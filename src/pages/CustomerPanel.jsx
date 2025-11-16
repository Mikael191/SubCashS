import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaShoppingBag, FaTruck, FaCheckCircle, FaClock, FaPhone, FaMapMarkerAlt, FaEdit, FaShoppingCart, FaBox } from 'react-icons/fa';
import { UserManager, OrderManager } from '../utils/dataManager';
import { useNavigate } from 'react-router-dom';

function CustomerPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Verificar se está logado
    const currentUser = UserManager.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    loadOrders(currentUser.id);

    // Auto-refresh a cada 2 segundos
    const interval = setInterval(() => {
      loadOrders(currentUser.id);
      setForceUpdate(prev => prev + 1);
    }, 2000);

    // Listen for order changes
    const handleChange = () => {
      loadOrders(currentUser.id);
    };
    window.addEventListener('ordersChanged', handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersChanged', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [navigate]);

  const loadOrders = (userId) => {
    const userOrders = OrderManager.getOrdersByUser(userId);
    setOrders(userOrders.sort((a, b) => b.id - a.id));
  };

  const handleLogout = () => {
    UserManager.logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'preparing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'delivering': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '⏳ Pedido Recebido';
      case 'preparing': return '👨‍🍳 Preparando';
      case 'delivering': return '🚚 Em Entrega';
      case 'completed': return '✅ Concluído';
      default: return 'Processando';
    }
  };

  const getStatusProgress = (status) => {
    switch(status) {
      case 'pending': return 25;
      case 'preparing': return 50;
      case 'delivering': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaUser className="text-yellow-400 text-3xl" />
            <div>
              <h1 className="text-2xl font-black text-white">Olá, {user.name}!</h1>
              <p className="text-xs text-yellow-400">MEUS PEDIDOS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600"
            >
              <FaShoppingCart /> Comprar Mais
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-4">📋 Informações do Cadastro</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <p className="text-gray-400">
                  <FaUser className="inline mr-2 text-yellow-400" />
                  {user.name}
                </p>
                <p className="text-gray-400">
                  <FaPhone className="inline mr-2 text-yellow-400" />
                  {user.phone}
                </p>
                {user.address && (
                  <p className="text-gray-400 md:col-span-2">
                    <FaMapMarkerAlt className="inline mr-2 text-yellow-400" />
                    {user.address}, {user.number} - {user.neighborhood}, {user.city}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              title="Editar perfil"
            >
              <FaEdit className="text-xl" />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-center"
          >
            <FaShoppingBag className="text-4xl mx-auto mb-2" />
            <p className="text-2xl font-black">{orders.length}</p>
            <p className="text-xs opacity-80">Total de Pedidos</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-2xl text-center"
          >
            <FaClock className="text-4xl mx-auto mb-2" />
            <p className="text-2xl font-black">{orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}</p>
            <p className="text-xs opacity-80">Em Andamento</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-2xl text-center"
          >
            <FaTruck className="text-4xl mx-auto mb-2" />
            <p className="text-2xl font-black">{orders.filter(o => o.status === 'delivering').length}</p>
            <p className="text-xs opacity-80">Em Entrega</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl text-center"
          >
            <FaCheckCircle className="text-4xl mx-auto mb-2" />
            <p className="text-2xl font-black">{orders.filter(o => o.status === 'completed').length}</p>
            <p className="text-xs opacity-80">Concluídos</p>
          </motion.div>
        </div>

        {/* Orders List */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <FaShoppingBag className="text-yellow-400" />
              Meus Pedidos
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
              >
                • Ao vivo
              </motion.span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600"
              >
                Começar a Comprar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-black/50 border border-yellow-500/20 rounded-xl p-6 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-white">Pedido #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getStatusProgress(order.status)}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-400">
                          <FaClock className="inline mr-2 text-yellow-400" />
                          {order.date}
                        </p>
                        <p className="text-gray-400">
                          <FaTruck className="inline mr-2 text-yellow-400" />
                          {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                        </p>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <p className="text-sm text-gray-400">{order.items.length} item(ns)</p>
                        <p className="text-2xl font-black text-yellow-400">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <FaTruck className="text-yellow-400" />
                  Detalhes do Pedido
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Status Timeline */}
              <div className="mb-6">
                <h3 className="text-white font-bold mb-4">Status do Pedido</h3>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Pedido Recebido', icon: FaCheckCircle },
                    { status: 'preparing', label: 'Preparando', icon: FaBox },
                    { status: 'delivering', label: selectedOrder.deliveryType === 'pickup' ? 'Pronto para Retirada' : 'Saiu para Entrega', icon: FaTruck },
                    { status: 'completed', label: 'Concluído', icon: FaCheckCircle }
                  ].map((step, idx) => {
                    const statusOrder = ['pending', 'preparing', 'delivering', 'completed'];
                    const currentIndex = statusOrder.indexOf(selectedOrder.status);
                    const stepIndex = statusOrder.indexOf(step.status);
                    const isActive = stepIndex <= currentIndex;
                    const isCurrent = step.status === selectedOrder.status;

                    return (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black' 
                            : 'bg-gray-800 text-gray-600'
                        }`}>
                          <step.icon className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-yellow-400 text-sm font-bold">✅ Status atual</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6 mb-6">
                <h3 className="text-white font-bold mb-4">Itens do Pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.quantity}x {item.name}</span>
                      <span className="text-white font-medium">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-yellow-400">TOTAL:</span>
                      <span className="text-yellow-400">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 font-bold mb-2">📅 Data</p>
                  <p className="text-white">{selectedOrder.date}</p>
                </div>
                <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 font-bold mb-2">💳 Pagamento</p>
                  <p className="text-white">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-4 md:col-span-2">
                  <p className="text-yellow-400 font-bold mb-2">📍 Entrega</p>
                  <p className="text-white">{selectedOrder.address}</p>
                </div>
              </div>

              {selectedOrder.status !== 'completed' && (
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-blue-400 text-sm">
                    Qualquer dúvida, entre em contato: <strong>(11) 99999-9999</strong>
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomerPanel;
