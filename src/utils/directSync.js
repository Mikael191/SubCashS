// Direct synchronization service using localStorage with forced polling
// This is the most reliable way to ensure orders appear immediately

export const DirectSync = {
  // Get all orders from localStorage
  getOrders() {
    try {
      const saved = localStorage.getItem('subcashs_orders');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      console.log('📥 Direct orders loaded:', parsed.length);
      return parsed;
    } catch (error) {
      console.error('❌ Error loading orders from localStorage:', error);
      return [];
    }
  },

  // Save order to localStorage
  saveOrder(order) {
    try {
      const orders = this.getOrders();
      // Remove any existing order with same ID
      const filtered = orders.filter(o => o.id !== order.id);
      // Add new order at the beginning
      const newOrders = [order, ...filtered];
      localStorage.setItem('subcashs_orders', JSON.stringify(newOrders));
      
      // Force immediate update notification
      this.notifyChange();
      
      console.log('✅ Order saved directly:', order.id);
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
      
      // Force immediate update notification
      this.notifyChange();
      
      console.log('✅ Order status updated directly:', orderId, '->', newStatus);
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
      
      // Force immediate update notification
      this.notifyChange();
      
      console.log('❌ Order rejected directly:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order in localStorage:', error);
      return false;
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
      
      // Force immediate update notification
      this.notifyChange();
      
      console.log('🧹 Orders cleared directly. Revenue saved:', completedRevenue);
      
      return {
        success: true,
        clearedCount: orders.length - activeOrders.length,
        savedRevenue: completedRevenue
      };
    } catch (error) {
      console.error('❌ Error clearing orders in localStorage:', error);
      return { success: false };
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
      
      console.log('💰 Revenue saved directly:', newTotal);
      return newTotal;
    } catch (error) {
      console.error('❌ Error saving revenue to localStorage:', error);
      return 0;
    }
  },

  // Get total revenue (current completed orders + historical)
  getTotalRevenue() {
    try {
      const orders = this.getOrders();
      const currentRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      const historicalRevenue = this.getHistoricalRevenue();
      return currentRevenue + historicalRevenue;
    } catch (error) {
      return 0;
    }
  },

  // Force notify all listeners
  notifyChange() {
    // Create a custom event
    const event = new CustomEvent('directOrdersUpdate', {
      detail: { timestamp: Date.now() }
    });
    
    // Dispatch to window
    window.dispatchEvent(event);
    
    // Also dispatch storage event for cross-tab communication
    window.dispatchEvent(new Event('storage'));
    
    console.log('🔔 Direct change notification sent');
  },

  // Initialize the service
  init() {
    // Ensure localStorage has the required keys
    if (!localStorage.getItem('subcashs_orders')) {
      localStorage.setItem('subcashs_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('subcashs_historical_revenue')) {
      localStorage.setItem('subcashs_historical_revenue', JSON.stringify(0));
    }
    console.log('✅ DirectSync initialized');
  }
};

// Initialize on load
DirectSync.init();

export default DirectSync;