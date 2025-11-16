// Sistema centralizado de gerenciamento de pedidos
import { SharedSync } from './sharedSync';

export const OrderManager = {
  // Salvar pedido
  async saveOrder(order) {
    try {
      // Save to shared sync service
      const success = await SharedSync.saveOrder(order);
      
      console.log('✅ Pedido salvo e sincronizado:', order.id);
      
      // Disparar evento para TODAS as janelas/abas
      this.notifyChange();
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
      return false;
    }
  },

  // Buscar todos os pedidos
  async getOrders() {
    try {
      // Get from shared sync service
      const orders = await SharedSync.getOrders();
      return orders;
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      return [];
    }
  },

  // Atualizar status do pedido
  async updateOrderStatus(orderId, newStatus) {
    try {
      // Update via shared sync service
      const success = await SharedSync.updateOrderStatus(orderId, newStatus);
      
      console.log('✅ Status atualizado e sincronizado:', orderId, '->', newStatus);
      
      // Notificar mudanças
      this.notifyChange();
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return false;
    }
  },

  // Buscar pedido por ID
  getOrderById(orderId) {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId);
  },

  // Buscar pedidos por usuário
  getOrdersByUser(userId) {
    const orders = this.getOrders();
    return orders.filter(order => order.userId === userId);
  },

  // Recusar pedido
  async rejectOrder(orderId, reason = 'Pedido recusado pela loja') {
    try {
      // Reject via shared sync service
      const success = await SharedSync.rejectOrder(orderId, reason);
      
      console.log('❌ Pedido recusado e sincronizado:', orderId);
      
      this.notifyChange();
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao recusar pedido:', error);
      return false;
    }
  },

  // Limpar pedidos concluídos e recusados (mantém receita)
  async clearCompletedOrders() {
    try {
      const result = await SharedSync.clearCompletedOrders();
      
      if (result.success) {
        console.log('🧹 Pedidos limpos e sincronizados. Receita salva:', result.savedRevenue);
        this.notifyChange();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao limpar pedidos:', error);
      return { success: false };
    }
  },

  // Adicionar à receita histórica
  async addToHistoricalRevenue(amount) {
    try {
      const newTotal = await SharedSync.addToHistoricalRevenue(amount);
      return newTotal;
    } catch (error) {
      console.error('❌ Erro ao salvar receita:', error);
      return 0;
    }
  },

  // Buscar receita histórica
  async getHistoricalRevenue() {
    try {
      const revenue = await SharedSync.getHistoricalRevenue();
      return revenue;
    } catch (error) {
      return 0;
    }
  },

  // Calcular receita total (pedidos atuais + histórico)
  async getTotalRevenue() {
    const currentOrders = await this.getOrders();
    const currentRevenue = currentOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    const historicalRevenue = await this.getHistoricalRevenue();
    return currentRevenue + historicalRevenue;
  },

  // Criar evento customizado para notificar mudanças
  notifyChange() {
    const event = new CustomEvent('ordersChanged', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }
};

// Sistema de gerenciamento de usuários
export const UserManager = {
  // Salvar usuário atual logado
  saveUser(user) {
    localStorage.setItem('subcashs_current_user', JSON.stringify(user));
  },

  // Buscar usuário logado
  getUser() {
    const saved = localStorage.getItem('subcashs_current_user');
    return saved ? JSON.parse(saved) : null;
  },

  // Logout
  logout() {
    localStorage.removeItem('subcashs_current_user');
  },

  // Registrar novo usuário
  register(userData) {
    try {
      // Buscar usuários cadastrados
      const users = this.getAllUsers();
      
      // Verificar se email já existe
      const exists = users.find(u => u.email === userData.email);
      if (exists) {
        return { success: false, message: 'Email já cadastrado!' };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
      };

      // Salvar
      users.push(newUser);
      localStorage.setItem('subcashs_users', JSON.stringify(users));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, message: 'Erro ao cadastrar. Tente novamente.' };
    }
  },

  // Login
  login(email, password) {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        this.saveUser(user);
        return { success: true, user };
      }
      
      return { success: false, message: 'Email ou senha incorretos!' };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Erro ao fazer login. Tente novamente.' };
    }
  },

  // Buscar todos os usuários
  getAllUsers() {
    try {
      const saved = localStorage.getItem('subcashs_users');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  },

  // Buscar pedidos do usuário
  getUserOrders(userId) {
    const allOrders = OrderManager.getOrders();
    return allOrders.filter(order => order.userId === userId);
  },

  // Atualizar dados do usuário
  updateUser(userId, newData) {
    try {
      const users = this.getAllUsers();
      const updated = users.map(u => 
        u.id === userId ? { ...u, ...newData } : u
      );
      localStorage.setItem('subcashs_users', JSON.stringify(updated));
      
      // Atualizar usuário logado se for o mesmo
      const currentUser = this.getUser();
      if (currentUser && currentUser.id === userId) {
        this.saveUser({ ...currentUser, ...newData });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  }
};
