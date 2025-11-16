// Sistema centralizado de gerenciamento de pedidos
// Cross-device version using enhanced localStorage
import { CrossDeviceOrder } from './crossDeviceOrder';

export const OrderManager = {
  // Salvar pedido
  saveOrder(order) {
    return CrossDeviceOrder.saveOrder(order);
  },

  // Buscar todos os pedidos
  getOrders() {
    return CrossDeviceOrder.getOrders();
  },

  // Atualizar status do pedido
  updateOrderStatus(orderId, newStatus) {
    return CrossDeviceOrder.updateOrderStatus(orderId, newStatus);
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
    return CrossDeviceOrder.rejectOrder(orderId, reason);
  },

  // Limpar pedidos concluídos e recusados (mantém receita)
  clearCompletedOrders() {
    return CrossDeviceOrder.clearCompletedOrders();
  },

  // Adicionar à receita histórica
  addToHistoricalRevenue(amount) {
    return CrossDeviceOrder.addToHistoricalRevenue(amount);
  },

  // Buscar receita histórica
  getHistoricalRevenue() {
    return CrossDeviceOrder.getHistoricalRevenue();
  },

  // Calcular receita total (pedidos atuais + histórico)
  getTotalRevenue() {
    return CrossDeviceOrder.getTotalRevenue();
  },

  // Criar evento customizado para notificar mudanças
  notifyChange() {
    // Simple notification
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
