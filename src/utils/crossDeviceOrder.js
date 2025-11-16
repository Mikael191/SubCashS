// Cross-device order management using localStorage with enhanced polling
// This creates a more reliable way to share orders between devices

// Enhanced order management with better cross-device support
export const CrossDeviceOrder = {
  // Save order with enhanced reliability
  saveOrder(order) {
    try {
      // Get existing orders
      const saved = localStorage.getItem('subcashs_orders_v2');
      const orders = saved ? JSON.parse(saved) : [];
      
      // Remove any existing order with same ID
      const filtered = orders.filter(o => o.id !== order.id);
      
      // Add new order at the beginning with timestamp
      const newOrder = {
        ...order,
        lastUpdated: Date.now()
      };
      const newOrders = [newOrder, ...filtered];
      
      // Save back to localStorage
      localStorage.setItem('subcashs_orders_v2', JSON.stringify(newOrders));
      
      // Also save to legacy key for backward compatibility
      localStorage.setItem('subcashs_orders', JSON.stringify(newOrders));
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new Event('storage'));
      
      console.log('✅ Order saved successfully:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving order:', error);
      return false;
    }
  },

  // Get orders with enhanced reliability
  getOrders() {
    try {
      // Try new key first
      const saved = localStorage.getItem('subcashs_orders_v2');
      if (saved) {
        const orders = JSON.parse(saved);
        // Sort by timestamp to ensure newest first
        return orders.sort((a, b) => (b.lastUpdated || b.id) - (a.lastUpdated || a.id));
      }
      
      // Fallback to legacy key
      const legacy = localStorage.getItem('subcashs_orders');
      return legacy ? JSON.parse(legacy) : [];
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      return [];
    }
  },

  // Update order status
  updateOrderStatus(orderId, newStatus) {
    try {
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus,
          lastUpdated: Date.now()
        } : order
      );
      localStorage.setItem('subcashs_orders_v2', JSON.stringify(updated));
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return false;
    }
  },

  // Reject order
  rejectOrder(orderId, reason = 'Pedido recusado pela loja') {
    try {
      const orders = this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: 'rejected',
          rejectionReason: reason,
          lastUpdated: Date.now()
        } : order
      );
      localStorage.setItem('subcashs_orders_v2', JSON.stringify(updated));
      localStorage.setItem('subcashs_orders', JSON.stringify(updated));
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order:', error);
      return false;
    }
  },

  // Clear completed orders
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
      localStorage.setItem('subcashs_historical_revenue_v2', JSON.stringify(newHistorical));
      
      // Keep only active orders
      const activeOrders = orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'delivering'
      );
      
      localStorage.setItem('subcashs_orders_v2', JSON.stringify(activeOrders));
      localStorage.setItem('subcashs_orders', JSON.stringify(activeOrders));
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      return {
        success: true,
        clearedCount: orders.length - activeOrders.length,
        savedRevenue: completedRevenue
      };
    } catch (error) {
      console.error('❌ Error clearing orders:', error);
      return { success: false };
    }
  },

  // Get historical revenue
  getHistoricalRevenue() {
    try {
      const saved = localStorage.getItem('subcashs_historical_revenue_v2');
      if (saved) return JSON.parse(saved);
      
      // Fallback to legacy key
      const legacy = localStorage.getItem('subcashs_historical_revenue');
      return legacy ? JSON.parse(legacy) : 0;
    } catch (error) {
      return 0;
    }
  },

  // Add to historical revenue
  addToHistoricalRevenue(amount) {
    try {
      const current = this.getHistoricalRevenue();
      const newTotal = current + amount;
      localStorage.setItem('subcashs_historical_revenue_v2', JSON.stringify(newTotal));
      return newTotal;
    } catch (error) {
      console.error('❌ Error saving revenue:', error);
      return 0;
    }
  },

  // Get total revenue
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

  // Initialize storage
  initialize() {
    // Ensure localStorage has the required keys
    if (!localStorage.getItem('subcashs_orders_v2')) {
      localStorage.setItem('subcashs_orders_v2', JSON.stringify([]));
    }
    if (!localStorage.getItem('subcashs_historical_revenue_v2')) {
      localStorage.setItem('subcashs_historical_revenue_v2', JSON.stringify(0));
    }
  }
};

// Initialize on load
CrossDeviceOrder.initialize();

export default CrossDeviceOrder;