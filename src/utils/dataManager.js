// Sistema centralizado de gerenciamento de pedidos
import { SimpleSync } from './simpleSync';

export const OrderManager = {
  // Salvar pedido
  saveOrder(order) {
    try {
      // Save to simple sync service
      const success = SimpleSync.saveOrder(order);
      
      console.log('✅ Pedido salvo:', order.id);
      
      // Disparar evento para TODAS as janelas/abas
      this.notifyChange();
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
      return false;
    }
  },

  // Buscar todos os pedidos
  getOrders() {
    try {
      // Get from simple sync service
      const orders = SimpleSync.getOrders();
      return orders;
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      return [];
    }
  },

  // Atualizar status do pedido
  updateOrderStatus(orderId, newStatus) {
    try {
      // Update via simple sync service
      const success = SimpleSync.updateOrderStatus(orderId, newStatus);
      
      console.log('✅ Status atualizado:', orderId, '->', newStatus);
      
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
  rejectOrder(orderId, reason = 'Pedido recusado pela loja') {
    try {
      // Reject via simple sync service
      const success = SimpleSync.rejectOrder(orderId, reason);
      
      console.log('❌ Pedido recusado:', orderId);
      
      this.notifyChange();
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao recusar pedido:', error);
      return false;
    }
  },

  // Limpar pedidos concluídos e recusados (mantém receita)
  clearCompletedOrders() {
    try {
      const result = SimpleSync.clearCompletedOrders();
      
      if (result.success) {
        console.log('🧹 Pedidos limpos. Receita salva:', result.savedRevenue);
        this.notifyChange();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao limpar pedidos:', error);
      return { success: false };
    }
  },

  // Adicionar à receita histórica
  addToHistoricalRevenue(amount) {
    try {
      const newTotal = SimpleSync.addToHistoricalRevenue(amount);
      return newTotal;
    } catch (error) {
      console.error('❌ Erro ao salvar receita:', error);
      return 0;
    }
  },

  // Buscar receita histórica
  getHistoricalRevenue() {
    try {
      const revenue = SimpleSync.getHistoricalRevenue();
      return revenue;
    } catch (error) {
      return 0;
    }
  },

  // Calcular receita total (pedidos atuais + histórico)
  getTotalRevenue() {
    const currentOrders = this.getOrders();
    const currentRevenue = currentOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    const historicalRevenue = this.getHistoricalRevenue();
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
