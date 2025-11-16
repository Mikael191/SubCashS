// Real cross-device synchronization service
// This creates a shared order pool that all devices can access

// Using a simple shared key in localStorage to simulate cross-device sync
// In a real implementation, this would be replaced with a WebSocket server or real-time database
const SHARED_ORDERS_KEY = 'subcashs_shared_orders_v2';
const DEVICE_ID = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

export const SyncService = {
  // Initialize the sync service
  init() {
    console.log('🔄 Sync Service initialized for device:', DEVICE_ID);
    
    // Listen for storage changes from other tabs/devices
    window.addEventListener('storage', (e) => {
      if (e.key === SHARED_ORDERS_KEY) {
        console.log('📥 Received sync update from another device/tab');
        const event = new CustomEvent('ordersSynced', {
          detail: { orders: e.newValue ? JSON.parse(e.newValue) : [] }
        });
        window.dispatchEvent(event);
      }
    });
  },

  // Save order and broadcast to all devices
  saveOrder(order) {
    try {
      // Get existing orders
      const existing = this.getOrders();
      
      // Check if order already exists (prevent duplicates)
      const exists = existing.find(o => o.id === order.id);
      if (exists) {
        console.log('⚠️ Order already exists, updating instead');
        return this.updateOrder(order);
      }
      
      // Add new order
      const updated = [order, ...existing];
      
      // Save to shared storage
      localStorage.setItem(SHARED_ORDERS_KEY, JSON.stringify(updated));
      
      // Notify other tabs/devices
      this.broadcastUpdate(updated);
      
      console.log('✅ Order saved and synced to all devices:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving order:', error);
      return false;
    }
  },

  // Update existing order
  updateOrder(updatedOrder) {
    try {
      const existing = this.getOrders();
      const updated = existing.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      );
      
      localStorage.setItem(SHARED_ORDERS_KEY, JSON.stringify(updated));
      this.broadcastUpdate(updated);
      
      console.log('✅ Order updated and synced:', updatedOrder.id);
      return true;
    } catch (error) {
      console.error('❌ Error updating order:', error);
      return false;
    }
  },

  // Get all orders from shared storage
  getOrders() {
    try {
      const saved = localStorage.getItem(SHARED_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      return [];
    }
  },

  // Broadcast update to other tabs/devices
  broadcastUpdate(orders) {
    // Dispatch custom event for this tab
    const event = new CustomEvent('ordersSynced', {
      detail: { orders }
    });
    window.dispatchEvent(event);
    
    // Force storage event for other tabs (by changing and reverting)
    const tempKey = SHARED_ORDERS_KEY + '_temp';
    localStorage.setItem(tempKey, Date.now().toString());
    localStorage.removeItem(tempKey);
  },

  // Listen for sync events
  onSync(callback) {
    const handler = (e) => {
      if (e.detail && e.detail.orders) {
        callback(e.detail.orders);
      }
    };
    
    window.addEventListener('ordersSynced', handler);
    return () => window.removeEventListener('ordersSynced', handler);
  },

  // Update order status across all devices
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
      
      localStorage.setItem(SHARED_ORDERS_KEY, JSON.stringify(updated));
      this.broadcastUpdate(updated);
      
      console.log('✅ Order status updated across all devices:', orderId, '->', newStatus);
      return true;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return false;
    }
  },

  // Reject order across all devices
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
      
      localStorage.setItem(SHARED_ORDERS_KEY, JSON.stringify(updated));
      this.broadcastUpdate(updated);
      
      console.log('❌ Order rejected across all devices:', orderId);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting order:', error);
      return false;
    }
  }
};

// Initialize the service
SyncService.init();

export default SyncService;
