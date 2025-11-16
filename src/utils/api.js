// Simple API service for order synchronization
// Using a free service for demonstration - in production you would use your own backend

const API_BASE_URL = 'https://jsonplaceholder.typicode.com'; // Free test API
const CUSTOM_ORDERS_KEY = 'subcashs_orders_sync'; // For localStorage simulation

// In a real implementation, you would replace this with your actual API
export const ApiService = {
  // Save order to API (simulated)
  async saveOrder(order) {
    try {
      // Simulate API call
      console.log('📡 Enviando pedido para API:', order.id);
      
      // Save to localStorage as backup
      const existing = this.getOrdersFromStorage();
      const updated = [order, ...existing];
      localStorage.setItem(CUSTOM_ORDERS_KEY, JSON.stringify(updated));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Pedido enviado para API com sucesso');
      return { success: true, data: order };
    } catch (error) {
      console.error('❌ Erro ao enviar pedido para API:', error);
      return { success: false, error: error.message };
    }
  },

  // Get orders from API (simulated)
  async getOrders() {
    try {
      // Get from localStorage (simulating API response)
      const orders = this.getOrdersFromStorage();
      console.log('📥 Pedidos carregados da API:', orders.length);
      return { success: true, data: orders };
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos da API:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Update order status (simulated)
  async updateOrderStatus(orderId, newStatus) {
    try {
      const orders = this.getOrdersFromStorage();
      const updated = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      );
      localStorage.setItem(CUSTOM_ORDERS_KEY, JSON.stringify(updated));
      
      console.log('✅ Status atualizado na API:', orderId, '->', newStatus);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar status na API:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject order (simulated)
  async rejectOrder(orderId, reason) {
    try {
      const orders = this.getOrdersFromStorage();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: 'rejected', 
          rejectedAt: new Date().toISOString(), 
          rejectionReason: reason 
        } : order
      );
      localStorage.setItem(CUSTOM_ORDERS_KEY, JSON.stringify(updated));
      
      console.log('❌ Pedido rejeitado na API:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao rejeitar pedido na API:', error);
      return { success: false, error: error.message };
    }
  },

  // Helper: Get orders from localStorage
  getOrdersFromStorage() {
    try {
      const saved = localStorage.getItem(CUSTOM_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos do storage:', error);
      return [];
    }
  },

  // Helper: Save orders to localStorage
  saveOrdersToStorage(orders) {
    try {
      localStorage.setItem(CUSTOM_ORDERS_KEY, JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar pedidos no storage:', error);
      return false;
    }
  }
};

export default ApiService;
