// Simple synchronization service using localStorage only
// This creates a reliable order system that works consistently

export const SimpleSync = {
  // Get all orders from localStorage
  getOrders() {
    try {
      const saved = localStorage.getItem('subcashs_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Error loading orders from localStorage:', error);
      return [];
    }
  },

  // Save order to localStorage
  saveOrder(order) {
    try {
      const orders = this.getOrders();
      const newOrders = [order, ...orders.filter(o => o.id !== order.id)];
      localStorage.setItem('subcashs_orders', JSON.stringify(newOrders));
      console.log('✅ Order saved to localStorage:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving order to localStorage:', error);
      return false;
    }
  },

  // Update order status in localStorage
  updateOrderStatus(orderId, newStatus) {
    try {
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        } : order
      );
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      console.log('✅ Order status updated in localStorage:', orderId, '->', newStatus);
      return true;
    } catch (error) {
      console.error('❌ Error updating order status in localStorage:', error);
      return false;
    }
  },

  // Reject order in localStorage
  rejectOrder(orderId, reason) {
    try {
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        } : order
      );
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      console.log('❌ Order rejected in localStorage:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order in localStorage:', error);
      return false;
    }
  },

  // Get historical revenue from localStorage
  getHistoricalRevenue() {
    try {
      const saved = localStorage.getItem('subcashs_historical_revenue');
      return saved ? JSON.parse(saved) : 0;
    } catch (error) {
      console.error('❌ Error loading revenue from localStorage:', error);
      return 0;
    }
  },

  // Add to historical revenue in localStorage
  addToHistoricalRevenue(amount) {
    try {
      const current = this.getHistoricalRevenue();
      const newTotal = current + amount;
      localStorage.setItem('subcashs_historical_revenue', JSON.stringify(newTotal));
      console.log('💰 Revenue saved to localStorage:', newTotal);
      return newTotal;
    } catch (error) {
      console.error('❌ Error saving revenue to localStorage:', error);
      return 0;
    }
  },

  // Clear completed orders in localStorage
  clearCompletedOrders() {
    try {
      const orders = this.getOrders();
      
      // Calculate revenue from completed orders
      const completedRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      
      // Add to historical revenue
      this.addToHistoricalRevenue(completedRevenue);
      
      // Keep only active orders
      const activeOrders = orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'delivering'
      );
      
      localStorage.setItem('subcashs_orders', JSON.stringify(activeOrders));
      
      console.log('🧹 Orders cleared. Revenue saved:', completedRevenue);
      
      return {
        success: true,
        clearedCount: orders.length - activeOrders.length,
        savedRevenue: completedRevenue
      };
    } catch (error) {
      console.error('❌ Error clearing orders in localStorage:', error);
      return { success: false };
    }
  }
};

export default SimpleSync;