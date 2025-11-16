// Shared synchronization service using a free JSON storage service
// This creates a truly shared order pool that all devices can access

const STORAGE_URL = 'https://api.jsonstorage.net/v1/json';
const STORAGE_ID = 'subcashs-orders-demo'; // This is a public demo storage - in production you would use your own

export const SharedSync = {
  // Get all orders from shared storage
  async getOrders() {
    try {
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📥 Orders loaded from shared storage:', data.orders?.length || 0);
      return data.orders || [];
    } catch (error) {
      console.error('❌ Error loading orders from shared storage:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('subcashs_orders_local');
        return saved ? JSON.parse(saved) : [];
      } catch (localError) {
        console.error('❌ Error loading orders from localStorage:', localError);
        return [];
      }
    }
  },

  // Save order to shared storage
  async saveOrder(order) {
    try {
      // First get existing orders to preserve them
      const existingOrders = await this.getOrders();
      
      // Add new order to existing orders (avoid duplicates)
      const allOrders = [order, ...existingOrders.filter(o => o.id !== order.id)];
      
      // Save all orders to shared storage
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: allOrders })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_local', JSON.stringify(allOrders));
      
      console.log('✅ Order saved to shared storage:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving order to shared storage:', error);
      // Fallback to localStorage only
      try {
        const existing = await this.getOrdersFromLocalStorage();
        const updated = [order, ...existing.filter(o => o.id !== order.id)];
        localStorage.setItem('subcashs_orders_local', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error saving order to localStorage:', localError);
        return false;
      }
    }
  },

  // Update order status in shared storage
  async updateOrderStatus(orderId, newStatus) {
    try {
      const orders = await this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        } : order
      );
      
      // Save updated orders to shared storage
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updated })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_local', JSON.stringify(updated));
      
      console.log('✅ Order status updated in shared storage:', orderId, '->', newStatus);
      return true;
    } catch (error) {
      console.error('❌ Error updating order status in shared storage:', error);
      // Fallback to localStorage only
      try {
        const orders = await this.getOrdersFromLocalStorage();
        const updated = orders.map(order => 
          order.id === orderId ? { 
            ...order, 
            status: newStatus, 
            updatedAt: new Date().toISOString() 
          } : order
        );
        localStorage.setItem('subcashs_orders_local', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error updating order status in localStorage:', localError);
        return false;
      }
    }
  },

  // Reject order in shared storage
  async rejectOrder(orderId, reason) {
    try {
      const orders = await this.getOrders();
      const updated = orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        } : order
      );
      
      // Save updated orders to shared storage
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updated })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_local', JSON.stringify(updated));
      
      console.log('❌ Order rejected in shared storage:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order in shared storage:', error);
      // Fallback to localStorage only
      try {
        const orders = await this.getOrdersFromLocalStorage();
        const updated = orders.map(order => 
          order.id === orderId ? { 
            ...order, 
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          } : order
        );
        localStorage.setItem('subcashs_orders_local', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error rejecting order in localStorage:', localError);
        return false;
      }
    }
  },

  // Get historical revenue from shared storage
  async getHistoricalRevenue() {
    try {
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.revenue || 0;
    } catch (error) {
      console.error('❌ Error loading revenue from shared storage:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('subcashs_historical_revenue_local');
        return saved ? JSON.parse(saved) : 0;
      } catch (localError) {
        return 0;
      }
    }
  },

  // Add to historical revenue in shared storage
  async addToHistoricalRevenue(amount) {
    try {
      const current = await this.getHistoricalRevenue();
      const newTotal = current + amount;
      
      // Get current orders to preserve them
      const orders = await this.getOrders();
      
      // Save to shared storage
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders, revenue: newTotal })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_historical_revenue_local', JSON.stringify(newTotal));
      
      console.log('💰 Revenue saved to shared storage:', newTotal);
      return newTotal;
    } catch (error) {
      console.error('❌ Error saving revenue to shared storage:', error);
      // Fallback to localStorage only
      try {
        const current = await this.getHistoricalRevenueFromLocalStorage();
        const newTotal = current + amount;
        localStorage.setItem('subcashs_historical_revenue_local', JSON.stringify(newTotal));
        return newTotal;
      } catch (localError) {
        console.error('❌ Error saving revenue to localStorage:', localError);
        return 0;
      }
    }
  },

  // Clear completed orders in shared storage
  async clearCompletedOrders() {
    try {
      const orders = await this.getOrders();
      
      // Calculate revenue from completed orders
      const completedRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      
      // Add to historical revenue
      const newRevenue = await this.addToHistoricalRevenue(completedRevenue);
      
      // Keep only active orders
      const activeOrders = orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'delivering'
      );
      
      // Save active orders to shared storage
      const response = await fetch(`${STORAGE_URL}/${STORAGE_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: activeOrders, revenue: newRevenue })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_local', JSON.stringify(activeOrders));
      
      console.log('🧹 Orders cleared. Revenue saved:', completedRevenue);
      
      return {
        success: true,
        clearedCount: orders.length - activeOrders.length,
        savedRevenue: completedRevenue
      };
    } catch (error) {
      console.error('❌ Error clearing orders in shared storage:', error);
      // Fallback to localStorage only
      try {
        const orders = await this.getOrdersFromLocalStorage();
        
        // Calculate revenue from completed orders
        const completedRevenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + order.total, 0);
        
        // Add to historical revenue
        const newRevenue = await this.addToHistoricalRevenueFromLocalStorage(completedRevenue);
        
        // Keep only active orders
        const activeOrders = orders.filter(order => 
          order.status === 'pending' || 
          order.status === 'preparing' || 
          order.status === 'delivering'
        );
        
        localStorage.setItem('subcashs_orders_local', JSON.stringify(activeOrders));
        localStorage.setItem('subcashs_historical_revenue_local', JSON.stringify(newRevenue));
        
        return {
          success: true,
          clearedCount: orders.length - activeOrders.length,
          savedRevenue: completedRevenue
        };
      } catch (localError) {
        console.error('❌ Error clearing orders in localStorage:', localError);
        return { success: false };
      }
    }
  },

  // Helper: Get orders from localStorage
  async getOrdersFromLocalStorage() {
    try {
      const saved = localStorage.getItem('subcashs_orders_local');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  },

  // Helper: Get revenue from localStorage
  async getHistoricalRevenueFromLocalStorage() {
    try {
      const saved = localStorage.getItem('subcashs_historical_revenue_local');
      return saved ? JSON.parse(saved) : 0;
    } catch (error) {
      return 0;
    }
  }
};

export default SharedSync;