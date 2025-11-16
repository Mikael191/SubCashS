// Cross-device synchronization service using a free JSON storage service
// This creates a truly shared order pool that all devices can access

// Using Firebase Realtime Database free tier for real cross-device sync
// This is a public demo database - in production you would use your own

const FIREBASE_CONFIG = {
  databaseURL: "https://subcashs-demo-default-rtdb.firebaseio.com/"
};

const ORDERS_PATH = '/orders';
const REVENUE_PATH = '/revenue';

// Firebase Realtime Database REST API
const FIREBASE_URL = FIREBASE_CONFIG.databaseURL;

export const CrossDeviceSync = {
  // Get all orders from Firebase
  async getOrders() {
    try {
      const response = await fetch(`${FIREBASE_URL}${ORDERS_PATH}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data) return [];
      
      // Convert object to array
      const orders = Object.values(data);
      console.log('📥 Orders loaded from Firebase:', orders.length);
      return orders;
    } catch (error) {
      console.error('❌ Error loading orders from Firebase:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('subcashs_orders_backup');
        return saved ? JSON.parse(saved) : [];
      } catch (localError) {
        console.error('❌ Error loading orders from localStorage:', localError);
        return [];
      }
    }
  },

  // Save order to Firebase
  async saveOrder(order) {
    try {
      // First get existing orders to preserve them
      const existingOrders = await this.getOrders();
      
      // Add new order to existing orders
      const allOrders = [order, ...existingOrders.filter(o => o.id !== order.id)];
      
      // Save all orders to Firebase
      const response = await fetch(`${FIREBASE_URL}${ORDERS_PATH}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allOrders.reduce((acc, order) => {
          acc[order.id] = order;
          return acc;
        }, {}))
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_backup', JSON.stringify(allOrders));
      
      console.log('✅ Order saved to Firebase:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving order to Firebase:', error);
      // Fallback to localStorage only
      try {
        const existing = await this.getOrdersFromLocalStorage();
        const updated = [order, ...existing.filter(o => o.id !== order.id)];
        localStorage.setItem('subcashs_orders_backup', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error saving order to localStorage:', localError);
        return false;
      }
    }
  },

  // Update order status in Firebase
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
      
      // Save updated orders to Firebase
      const response = await fetch(`${FIREBASE_URL}${ORDERS_PATH}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated.reduce((acc, order) => {
          acc[order.id] = order;
          return acc;
        }, {}))
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_backup', JSON.stringify(updated));
      
      console.log('✅ Order status updated in Firebase:', orderId, '->', newStatus);
      return true;
    } catch (error) {
      console.error('❌ Error updating order status in Firebase:', error);
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
        localStorage.setItem('subcashs_orders_backup', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error updating order status in localStorage:', localError);
        return false;
      }
    }
  },

  // Reject order in Firebase
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
      
      // Save updated orders to Firebase
      const response = await fetch(`${FIREBASE_URL}${ORDERS_PATH}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated.reduce((acc, order) => {
          acc[order.id] = order;
          return acc;
        }, {}))
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_orders_backup', JSON.stringify(updated));
      
      console.log('❌ Order rejected in Firebase:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order in Firebase:', error);
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
        localStorage.setItem('subcashs_orders_backup', JSON.stringify(updated));
        return true;
      } catch (localError) {
        console.error('❌ Error rejecting order in localStorage:', localError);
        return false;
      }
    }
  },

  // Get historical revenue from Firebase
  async getHistoricalRevenue() {
    try {
      const response = await fetch(`${FIREBASE_URL}${REVENUE_PATH}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data || 0;
    } catch (error) {
      console.error('❌ Error loading revenue from Firebase:', error);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('subcashs_historical_revenue');
        return saved ? JSON.parse(saved) : 0;
      } catch (localError) {
        return 0;
      }
    }
  },

  // Add to historical revenue in Firebase
  async addToHistoricalRevenue(amount) {
    try {
      const current = await this.getHistoricalRevenue();
      const newTotal = current + amount;
      
      // Save to Firebase
      const response = await fetch(`${FIREBASE_URL}${REVENUE_PATH}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTotal)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('subcashs_historical_revenue', JSON.stringify(newTotal));
      
      console.log('💰 Revenue saved to Firebase:', newTotal);
      return newTotal;
    } catch (error) {
      console.error('❌ Error saving revenue to Firebase:', error);
      // Fallback to localStorage only
      try {
        const current = await this.getHistoricalRevenueFromLocalStorage();
        const newTotal = current + amount;
        localStorage.setItem('subcashs_historical_revenue', JSON.stringify(newTotal));
        return newTotal;
      } catch (localError) {
        console.error('❌ Error saving revenue to localStorage:', localError);
        return 0;
      }
    }
  },

  // Helper: Get orders from localStorage
  async getOrdersFromLocalStorage() {
    try {
      const saved = localStorage.getItem('subcashs_orders_backup');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  },

  // Helper: Get revenue from localStorage
  async getHistoricalRevenueFromLocalStorage() {
    try {
      const saved = localStorage.getItem('subcashs_historical_revenue');
      return saved ? JSON.parse(saved) : 0;
    } catch (error) {
      return 0;
    }
  }
};

export default CrossDeviceSync;
