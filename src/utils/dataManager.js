// Sistema centralizado de gerenciamento de pedidos
// Simplified version using localStorage only

export const OrderManager = {
  // Salvar pedido
  saveOrder(order) {
    try {
      // Simple localStorage approach
      const saved = localStorage.getItem('subcashs_orders');
      const orders = saved ? JSON.parse(saved) : [];
      
      // Remove any existing order with same ID
      const filtered = orders.filter(o => o.id !== order.id);
      
      // Add new order at the beginning
      const newOrders = [order, ...filtered];
      
      // Save back to localStorage
      localStorage.setItem('subcashs_orders', JSON.stringify(newOrders));
      
      console.log('✅ Pedido salvo:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
      return false;
    }
  },

  // Buscar todos os pedidos
  getOrders() {
    try {
      const saved = localStorage.getItem('subcashs_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      return [];
    }
  },

  // Atualizar status do pedido
  updateOrderStatus(orderId, newStatus) {
    try {
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      
      console.log('✅ Status atualizado:', orderId, '->', newStatus);
      return true;
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
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { ...order, status: 'rejected' } : order
      );
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      
      console.log('❌ Pedido recusado:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao recusar pedido:', error);
      return false;
    }
  },

  // Limpar pedidos concluídos e recusados (mantém receita)
  clearCompletedOrders() {
    try {
      const orders = this.getOrders();
      
      // Calculate revenue from completed orders
      const completedRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      
      // Add to historical revenue
      const currentHistorical = this.getHistoricalRevenue();
      const newHistorical = currentHistorical + completedRevenue;
      localStorage.setItem('subcashs_historical_revenue', JSON.stringify(newHistorical));
      
      // Keep only active orders
      const activeOrders = orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'delivering'
      );
      
      localStorage.setItem('subcashs_orders', JSON.stringify(activeOrders));
      
      console.log('🧹 Pedidos limpos. Receita salva:', completedRevenue);
      
      return {
        success: true,
        clearedCount: orders.length - activeOrders.length,
        savedRevenue: completedRevenue
      };
    } catch (error) {
      console.error('❌ Erro ao limpar pedidos:', error);
      return { success: false };
    }
  },

  // Adicionar à receita histórica
  addToHistoricalRevenue(amount) {
    try {
      const current = this.getHistoricalRevenue();
      const newTotal = current + amount;
      localStorage.setItem('subcashs_historical_revenue', JSON.stringify(newTotal));
      return newTotal;
    } catch (error) {
      console.error('❌ Erro ao salvar receita:', error);
      return 0;
    }
  },

  // Buscar receita histórica
  getHistoricalRevenue() {
    try {
      const saved = localStorage.getItem('subcashs_historical_revenue');
      return saved ? JSON.parse(saved) : 0;
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
