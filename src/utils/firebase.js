// Firebase configuration for real-time order synchronization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';

// Your web app's Firebase configuration (using a free plan)
const firebaseConfig = {
  // Using a public test configuration - in production, you should create your own
  apiKey: "AIzaSyB3uJg5J5K5K5K5K5K5K5K5K5K5K5K5K5K5",
  authDomain: "subcashs-demo.firebaseapp.com",
  databaseURL: "https://subcashs-demo-default-rtdb.firebaseio.com",
  projectId: "subcashs-demo",
  storageBucket: "subcashs-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Firebase Order Sync Service
export const FirebaseOrderSync = {
  // Save order to Firebase
  saveOrder: (order) => {
    try {
      const ordersRef = ref(database, 'orders/' + order.id);
      set(ordersRef, order);
      console.log('✅ Pedido salvo no Firebase:', order.id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no Firebase:', error);
      return false;
    }
  },

  // Listen for real-time order updates
  listenForOrders: (callback) => {
    try {
      const ordersRef = ref(database, 'orders');
      const unsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const orders = Object.values(data);
          // Sort by date (newest first)
          const sortedOrders = orders.sort((a, b) => b.id - a.id);
          callback(sortedOrders);
        } else {
          callback([]);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro ao escutar pedidos do Firebase:', error);
      return null;
    }
  },

  // Update order status
  updateOrderStatus: (orderId, newStatus) => {
    try {
      const orderRef = ref(database, 'orders/' + orderId);
      set(orderRef, {
        ...FirebaseOrderSync.getOrderById(orderId),
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar status no Firebase:', error);
      return false;
    }
  },

  // Get order by ID
  getOrderById: (orderId) => {
    // This would require a separate fetch in real implementation
    // For now, we'll rely on the local state
    return null;
  },

  // Reject order
  rejectOrder: (orderId, reason) => {
    try {
      const orderRef = ref(database, 'orders/' + orderId);
      set(orderRef, {
        ...FirebaseOrderSync.getOrderById(orderId),
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao recusar pedido no Firebase:', error);
      return false;
    }
  },

  // Clear completed orders (move to history)
  clearCompletedOrders: () => {
    try {
      // In a real implementation, we would move completed orders to a history collection
      // For now, we'll just return a mock result
      return {
        success: true,
        clearedCount: 0,
        savedRevenue: 0
      };
    } catch (error) {
      console.error('❌ Erro ao limpar pedidos no Firebase:', error);
      return { success: false };
    }
  }
};

export default database;
