import React, { useState, useEffect } from 'react';
import { FaUserShield, FaSignOutAlt, FaBox, FaDollarSign, FaChartLine, FaTruck, FaCheckCircle, FaPhone, FaClock, FaMapMarkerAlt, FaCreditCard, FaCheck, FaTimes, FaBroom, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import { CrossDeviceOrder } from '../utils/crossDeviceOrder';

function EnhancedAdminPanel() {
  const [orders, setOrders] = useState([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, loading, success, error

  const ADMIN_PASSWORD = 'subcash2025';

  // Load orders with enhanced reliability
  const loadOrders = async () => {
    try {
      setUpdateStatus('loading');
      
      // Add small delay to ensure data consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const freshOrders = CrossDeviceOrder.getOrders();
      setOrders(freshOrders);
      
      const revenue = CrossDeviceOrder.getTotalRevenue();
      setTotalRevenue(revenue);
      
      setLastUpdate(new Date());
      setUpdateStatus('success');
      
      // Auto-hide success status after 2 seconds
      setTimeout(() => {
        if (updateStatus === 'success') {
          setUpdateStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('Error loading orders:', error);
      setUpdateStatus('error');
      
      // Auto-hide error status after 3 seconds
      setTimeout(() => {
        setUpdateStatus('idle');
      }, 3000);
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('❌ Senha incorreta!');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Update order status
  const updateStatusHandler = (orderId, newStatus) => {
    const success = CrossDeviceOrder.updateOrderStatus(orderId, newStatus);
    if (success) {
      loadOrders(); // Reload after update
    }
  };

  // Reject order
  const rejectOrder = (orderId) => {
    if (confirm('❌ Tem certeza que deseja recusar este pedido?')) {
      const success = CrossDeviceOrder.rejectOrder(orderId, 'Pedido recusado pela loja');
      if (success) {
        loadOrders(); // Reload after reject
      }
    }
  };

  // Clear completed orders
  const clearOrders = () => {
    if (confirm('🧹 Limpar pedidos concluídos e recusados?\n\nA receita será salva no histórico!')) {
      const result = CrossDeviceOrder.clearCompletedOrders();
      if (result.success) {
        loadOrders(); // Reload after clear
        alert(`✅ ${result.clearedCount} pedidos limpos!\n💰 R$ ${result.savedRevenue.toFixed(2)} salvo no histórico.`);
      }
    }
  };

  // Get count by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  // Set up polling and event listeners
  useEffect(() => {
    if (isAuthenticated) {
      // Load initial data
      loadOrders();
      
      // Set up frequent polling (every 2 seconds)
      const interval = setInterval(() => {
        loadOrders();
      }, 2000);
      
      // Listen for storage changes (cross-tab communication)
      const handleStorageChange = () => {
        console.log('🔄 Storage change detected, updating orders...');
        loadOrders();
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isAuthenticated]);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border-2 border-yellow-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md">
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
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 md:py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 border-b border-yellow-500/20 p-3 md:p-4">
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
              onClick={loadOrders}
              disabled={updateStatus === 'loading'}
              className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                updateStatus === 'loading' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Atualizar pedidos"
            >
              <FaRedo className={updateStatus === 'loading' ? 'animate-spin' : ''} /> 
              {updateStatus === 'loading' ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button 
              onClick={clearOrders}
              className="flex items-center gap-1 md:gap-2 bg-orange-600 hover:bg-orange-700 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base"
              title="Limpar pedidos concluídos/recusados"
            >
              <FaBroom /> Limpar Pedidos
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1 md:gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        {/* Update Status Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              {updateStatus === 'success' && (
                <span className="text-green-400 flex items-center gap-1">
                  <FaCheckCircle /> Atualizado
                </span>
              )}
              {updateStatus === 'error' && (
                <span className="text-red-400 flex items-center gap-1">
                  <FaExclamationTriangle /> Erro na atualização
                </span>
              )}
              {updateStatus === 'loading' && (
                <span className="text-blue-400 flex items-center gap-1">
                  <FaRedo className="animate-spin" /> Atualizando...
                </span>
              )}
            </div>
            <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Info sobre receita histórica */}
        {(() => {
          const historical = CrossDeviceOrder.getHistoricalRevenue();
          return historical > 0 ? (
            <div className="bg-green-600 border-2 border-green-500/30 rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0">
                <div>
                  <p className="text-white/80 text-xs md:text-sm mb-1">📋 Receita Histórica (Pedidos Limpos)</p>
                  <p className="text-2xl md:text-3xl font-black text-white">R$ {historical.toFixed(2).replace('.', ',')}</p>
                </div>
                <FaDollarSign className="text-4xl md:text-6xl text-white/20" />
              </div>
            </div>
          ) : null;
        })()}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-yellow-600 p-4 md:p-6 rounded-2xl">
            <FaDollarSign className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Faturamento Total</p>
            <p className="text-2xl md:text-3xl font-black text-white">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          </div>

          <div className="bg-blue-600 p-4 md:p-6 rounded-2xl">
            <FaBox className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Pendentes</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('pending')}</p>
          </div>

          <div className="bg-orange-600 p-4 md:p-6 rounded-2xl">
            <FaTruck className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Em Entrega</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('delivering')}</p>
          </div>

          <div className="bg-green-600 p-4 md:p-6 rounded-2xl">
            <FaCheckCircle className="text-3xl md:text-4xl mb-2 md:mb-3 text-white" />
            <p className="text-white/80 text-sm mb-1">Concluídos</p>
            <p className="text-2xl md:text-3xl font-black text-white">{getOrdersByStatus('completed')}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gray-900 border-2 border-yellow-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <FaChartLine className="text-yellow-400" />
              Pedidos
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm font-bold">{orders.length} pedidos</span>
              <button 
                onClick={loadOrders}
                disabled={updateStatus === 'loading'}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  updateStatus === 'loading' 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <FaRedo className={updateStatus === 'loading' ? 'animate-spin' : ''} /> 
                {updateStatus === 'loading' ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <FaBox className="text-4xl md:text-6xl text-gray-600 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-400">Nenhum pedido ainda</p>
              <button 
                onClick={loadOrders}
                disabled={updateStatus === 'loading'}
                className={`mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg font-bold ${
                  updateStatus === 'loading' 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                <FaRedo className={updateStatus === 'loading' ? 'animate-spin' : ''} /> 
                {updateStatus === 'loading' ? 'Atualizando...' : 'Atualizar Pedidos'}
              </button>
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
                          order.status === 'pending' ? 'bg-blue-500 text-white' :
                          order.status === 'preparing' ? 'bg-yellow-500 text-black' :
                          order.status === 'delivering' ? 'bg-orange-500 text-white' :
                          order.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-green-500 text-white'
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

                      <div className="bg-gray-800 rounded-lg p-3">
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
                          <button 
                            onClick={() => updateStatusHandler(order.id, 'preparing')} 
                            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2"
                          >
                            <FaCheck /> Aceitar
                          </button>
                          <button 
                            onClick={() => rejectOrder(order.id)} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2"
                          >
                            <FaTimes /> Recusar
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => updateStatusHandler(order.id, 'delivering')} 
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2"
                        >
                          <FaTruck /> Enviar
                        </button>
                      )}
                      {order.status === 'delivering' && (
                        <button 
                          onClick={() => updateStatusHandler(order.id, 'completed')} 
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base flex items-center gap-1 md:gap-2"
                        >
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

export default EnhancedAdminPanel;