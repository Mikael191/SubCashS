import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserShield, FaSignOutAlt, FaBox, FaDollarSign, FaChartLine, FaTruck, FaCheckCircle, FaPhone, FaClock, FaMapMarkerAlt, FaCreditCard, FaCheck, FaTrash, FaTimes, FaBroom } from 'react-icons/fa';
import { OrderManager, SyncService } from '../utils/dataManager';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ADMIN_PASSWORD = 'subcash2025';

  useEffect(() => {
    if (isAuthenticated) {
      // Load initial orders
      loadOrders();
      
      // Listen for real-time sync updates
      const unsubscribe = SyncService.onSync((syncedOrders) => {
        console.log('🔄 Orders synced from another device:', syncedOrders.length);
        setOrders(syncedOrders);
      });
      
      // Poll every 1 second as aggressive backup
      const interval = setInterval(() => {
        const freshOrders = SyncService.getOrders();
        const currentOrders = orders;
        
        // Only update if different
        if (JSON.stringify(freshOrders) !== JSON.stringify(currentOrders)) {
          console.log('🔍 Poll detected order changes');
          setOrders(freshOrders);
        }
      }, 1000);
      
      // Listen for localStorage changes (legacy support)
      const handleChange = () => loadOrders();
      window.addEventListener('ordersChanged', handleChange);
      window.addEventListener('storage', handleChange);
      
      return () => {
        if (unsubscribe) unsubscribe();
        clearInterval(interval);
        window.removeEventListener('ordersChanged', handleChange);
        window.removeEventListener('storage', handleChange);
      };
    }
  }, [isAuthenticated, orders]);

  const loadOrders = () => {
    const freshOrders = OrderManager.getOrders();
    setOrders(freshOrders);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('❌ Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const updateStatus = (orderId, newStatus) => {
    // Update via sync service for cross-device sync
    SyncService.updateOrderStatus(orderId, newStatus);
    // Update via OrderManager as backup
    OrderManager.updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const rejectOrder = (orderId) => {
    if (confirm('❌ Tem certeza que deseja recusar este pedido?')) {
      // Reject via sync service for cross-device sync
      SyncService.rejectOrder(orderId, 'Pedido recusado pela loja');
      // Reject via OrderManager as backup
      OrderManager.rejectOrder(orderId, 'Pedido recusado pela loja');
      loadOrders();
    }
  };

  const clearOrders = () => {
    if (confirm('🧹 Limpar pedidos concluídos e recusados?\n\nA receita será salva no histórico!')) {
      // Clear via OrderManager
      const result = OrderManager.clearCompletedOrders();
      if (result.success) {
        alert(`✅ ${result.clearedCount} pedidos limpos!\n💰 R$ ${result.savedRevenue.toFixed(2)} salvo no histórico.`);
        loadOrders();
      }
    }
  };

  const getTotalRevenue = () => {
    return OrderManager.getTotalRevenue();
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <FaUserShield className="text-4xl md:text-6xl text-yellow-400 mx-auto mb-3 md:mb-4" />
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2">Painel Administrativo</h1>
            <p className="text-yellow-400 text-sm">SubCashS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              autoFocus
            />
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 md:py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600">
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20 p-3 md:p-4">
        <div className="container mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <FaUserShield className="text-yellow-400 text-2xl md:text-3xl" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">SubCashS</h1>
              <p className="text-xs text-yellow-400">PAINEL ADMINISTRATIVO</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button 
              onClick={clearOrders}
              className="flex items-center gap-1 md:gap-2 bg-orange-600 hover:bg-orange-700 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
              title="Limpar pedidos concluídos/recusados"
            >
              <FaBroom /> Limpar Pedidos
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 md:gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        {/* Info sobre receita histórica */}
        {OrderManager.getHistoricalRevenue() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-500/30 rounded-2xl p-4 md:p-6 mb-4 md:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0">
              <div>
                <p className="text-white/80 text-xs md:text-sm mb-1">📋 Receita Histórica (Pedidos Limpos)</p>
                <p className="text-2xl md:text-3xl font-black text-white">R$ {OrderManager.getHistoricalRevenue().toFixed(2).replace('.', ',')}</p>
              </div>
              <FaDollarSign className="text-4xl md:text-6xl text-white/20" />
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-4 md:p-6 rounded-2xl">
            <FaDollarSign className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Faturamento Total</p>
            <p className="text-2xl md:text-3xl font-black text-white">R$ {getTotalRevenue().toFixed(2).replace('.', ',')}</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 md:p-6 rounded-2xl">
            <FaBox className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Pendentes</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('pending')}</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 md:p-6 rounded-2xl">
            <FaTruck className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Em Entrega</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('delivering')}</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-600 to-green-700 p-4 md:p-6 rounded-2xl">
            <FaCheckCircle className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Concluídos</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('completed')}</p>
          </motion.div>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <FaChartLine className="text-yellow-400" />
              Pedidos
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                • Ao vivo
              </motion.span>
            </h2>
            <span className="text-gray-400 text-sm font-bold">{orders.length} pedidos</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <FaBox className="text-4xl md:text-6xl text-gray-600 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-400">Nenhum pedido ainda</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-black/50 border border-yellow-500/20 rounded-xl p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-white">{order.customer}</h3>
                        <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold ${
                          order.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'delivering' ? 'bg-orange-500/20 text-orange-400' :
                          order.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {order.status === 'pending' ? '⏳ Pendente' :
                           order.status === 'preparing' ? '👨‍🍳 Preparando' :
                           order.status === 'delivering' ? '🚚 Entregando' :
                           order.status === 'rejected' ? '❌ Recusado' :
                           '✓ Concluído'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm mb-3">
                        <p className="text-gray-400 flex items-center">
                          <FaPhone className="inline mr-2 text-yellow-400 text-xs" />
                          {order.phone}
                        </p>
                        <p className="text-gray-400 flex items-center">
                          <FaClock className="inline mr-2 text-yellow-400 text-xs" />
                          {order.date}
                        </p>
                        <p className="text-gray-400 sm:col-span-2 flex items-start">
                          <FaMapMarkerAlt className="inline mr-2 mt-1 text-yellow-400 text-xs" />
                          <span>{order.address}</span>
                        </p>
                        <p className="text-gray-400 flex items-center">
                          <FaCreditCard className="inline mr-2 text-yellow-400 text-xs" />
                          {order.paymentMethod}
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs md:text-sm text-gray-300 py-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-bold text-sm md:text-base">
                          <span className="text-yellow-400">TOTAL:</span>
                          <span className="text-yellow-400">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(order.id, 'preparing')} className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2">
                            <FaCheck /> Aceitar
                          </button>
                          <button onClick={() => rejectOrder(order.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2">
                            <FaTimes /> Recusar
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => updateStatus(order.id, 'delivering')} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2">
                          <FaTruck /> Enviar
                        </button>
                      )}
                      {order.status === 'delivering' && (
                        <button onClick={() => updateStatus(order.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2">
                          <FaCheckCircle /> Concluir
                        </button>
                      )}
                      {order.status === 'rejected' && (
                        <div className="text-red-400 font-bold text-sm md:text-base flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-2">
                          <FaTimes /> Recusado
                        </div>
                      )}
                      {order.status === 'completed' && (
                        <div className="text-green-400 font-bold text-sm md:text-base flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-2">
                          <FaCheckCircle /> Entregue
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
