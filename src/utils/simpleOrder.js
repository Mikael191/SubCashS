// Simple order management functions
// This is the most basic and reliable way to handle orders

export const saveOrder = (order) => {
  try {
    // Get existing orders
    const saved = localStorage.getItem('subcashs_orders');
    const orders = saved ? JSON.parse(saved) : [];
    
    // Remove any existing order with same ID
    const filtered = orders.filter(o => o.id !== order.id);
    
    // Add new order at the beginning
    const newOrders = [order, ...filtered];
    
    // Save back to localStorage
    localStorage.setItem('subcashs_orders', JSON.stringify(newOrders));
    
    console.log('✅ Order saved successfully:', order.id);
    return true;
  } catch (error) {
    console.error('❌ Error saving order:', error);
    return false;
  }
};

export const getOrders = () => {
  try {
    const saved = localStorage.getItem('subcashs_orders');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('❌ Error loading orders:', error);
    return [];
  }
};

export const updateOrderStatus = (orderId, newStatus) => {
  try {
    const orders = getOrders();
    const updated = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('subcashs_orders', JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return false;
  }
};

export const initializeStorage = () => {
  // Ensure localStorage has the required keys
  if (!localStorage.getItem('subcashs_orders')) {
    localStorage.setItem('subcashs_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('subcashs_historical_revenue')) {
    localStorage.setItem('subcashs_historical_revenue', JSON.stringify(0));
  }
};

// Initialize on load
initializeStorage();