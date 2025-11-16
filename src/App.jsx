import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaBars, FaTimes, FaPen, FaBook, FaCoffee, FaSnowflake, FaUtensils, FaPaperclip, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaStar, FaArrowRight, FaTag, FaTrash, FaPlus, FaMinus, FaTruck, FaCreditCard, FaCheckCircle, FaUserShield, FaSignOutAlt, FaBox, FaDollarSign, FaChartLine, FaEye, FaCheck, FaUser, FaEdit } from 'react-icons/fa';
import { OrderManager, UserManager } from './utils/dataManager';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, delivery, payment, success
  const [currentUser, setCurrentUser] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Barueri',
    state: 'SP'
  });
  const [shippingMethod, setShippingMethod] = useState('delivery'); // delivery or pickup
  const [paymentMethod, setPaymentMethod] = useState(''); // card, pix, money
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    cardType: 'credit' // credit or debit
  });
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  const [editingAddress, setEditingAddress] = useState(false); // Para permitir editar endereço
  
  const { scrollYProgress } = useScroll();

  // Check if user is logged in
  useEffect(() => {
    const user = UserManager.getUser();
    setCurrentUser(user);
    
    // Pré-preencher dados de entrega se usuário estiver logado
    if (user) {
      setDeliveryInfo({
        name: user.name || '',
        phone: user.phone || '',
        cep: user.cep || '',
        address: user.address || '',
        number: user.number || '',
        complement: user.complement || '',
        neighborhood: user.neighborhood || '',
        city: user.city || 'Barueri',
        state: user.state || 'SP'
      });
    }
  }, []);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh current order for customer tracking
  useEffect(() => {
    if (currentOrderId && showOrderTracking) {
      const interval = setInterval(() => {
        const updatedOrder = OrderManager.getOrderById(currentOrderId);
        if (updatedOrder) {
          // Forçar atualização do componente
          setForceUpdate(prev => prev + 1);
        }
      }, 1000); // Atualiza a cada 1 segundo
      return () => clearInterval(interval);
    }
  }, [currentOrderId, showOrderTracking]);

  // Admin shortcut: Press Ctrl+Shift+A to access admin
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.href = '/admin';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * item.quantity), 0);
  const shippingFee = shippingMethod === 'delivery' ? 5.00 : 0;
  const total = subtotal + shippingFee;

  const products = [
    { id: 1, name: 'Caderno Universitário', category: 'Papelaria', price: 'R$ 25,90', icon: FaBook, discount: '10%', rating: 4.8 },
    { id: 2, name: 'Caneta Esferográfica', category: 'Papelaria', price: 'R$ 3,50', icon: FaPen, rating: 4.5 },
    { id: 3, name: 'Café Expresso', category: 'Conveniência', price: 'R$ 4,50', icon: FaCoffee, discount: '15%', rating: 4.9 },
    { id: 4, name: 'Refrigerante Lata', category: 'Conveniência', price: 'R$ 5,00', icon: FaSnowflake, rating: 4.6 },
    { id: 5, name: 'Salgados', category: 'Conveniência', price: 'R$ 6,50', icon: FaUtensils, rating: 4.7 },
    { id: 6, name: 'Clips e Grampos', category: 'Papelaria', price: 'R$ 8,90', icon: FaPaperclip, discount: '5%', rating: 4.4 },
    { id: 7, name: 'Marcador de Texto', category: 'Papelaria', price: 'R$ 12,90', icon: FaPen, rating: 4.6 },
    { id: 8, name: 'Água Mineral', category: 'Conveniência', price: 'R$ 3,00', icon: FaSnowflake, rating: 4.8 },
  ];

  const categories = ['Todos', 'Papelaria', 'Conveniência'];
  
  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCartOpen(true);
    setCheckoutStep('cart');
  };

  const proceedToDelivery = () => {
    setCheckoutStep('delivery');
    setEditingAddress(false); // Resetar modo de edição
  };

  const proceedToPayment = () => {
    setCheckoutStep('payment');
    setEditingAddress(false); // Resetar modo de edição
  };

  const completeOrder = () => {
    // Verificar se usuário está logado
    if (!currentUser) {
      alert('⚠️ Para finalizar a compra, faça login ou crie uma conta!');
      navigate('/login');
      return;
    }

    console.log('🛒 Iniciando pedido...');
    console.log('👤 Usuário:', currentUser);
    console.log('📦 Carrinho:', cart);
    console.log('🚚 Método de entrega:', shippingMethod);
    console.log('💳 Método de pagamento:', paymentMethod);

    // Create order object
    const newOrder = {
      id: Date.now(),
      userId: currentUser.id, // Associar ao usuário
      customer: currentUser.name,
      phone: currentUser.phone || deliveryInfo.phone,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.replace('R$ ', '').replace(',', '.'))
      })),
      total: total,
      status: 'pending',
      paymentMethod: paymentMethod === 'card' ? `Cartão (${cardInfo.cardType === 'credit' ? 'Crédito' : 'Débito'})` : paymentMethod === 'pix' ? 'PIX' : 'Dinheiro',
      deliveryType: shippingMethod,
      address: shippingMethod === 'delivery' ? `${deliveryInfo.address || currentUser.address}, ${deliveryInfo.number || currentUser.number} - ${deliveryInfo.neighborhood || currentUser.neighborhood}, ${deliveryInfo.city || currentUser.city}` : 'Retirada na loja',
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    };
    
    console.log('📋 Pedido criado:', newOrder);
    
    // Save using OrderManager for reliability
    const success = OrderManager.saveOrder(newOrder);
    
    // Also save to API for cross-device sync
    ApiService.saveOrder(newOrder);
    
    console.log('💾 Resultado do salvamento:', success);
    
    if (success) {
      // Update order ID for tracking
      setCurrentOrderId(newOrder.id);
      
      // Notify all listeners
      OrderManager.notifyChange();
      
      console.log('✅ Pedido salvo com sucesso! ID:', newOrder.id);
      
      // Show success
      setCheckoutStep('success');
      
      // NÃO limpar automaticamente - deixar usuário escolher ação
    } else {
      alert('❌ Erro ao salvar pedido. Tente novamente.');
    }
  };

  const getCurrentOrder = () => {
    // Sempre buscar dados atualizados do localStorage
    const freshOrder = OrderManager.getOrderById(currentOrderId);
    return freshOrder;
  };

  const getOrderStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pedido Recebido';
      case 'preparing': return 'Preparando seu Pedido';
      case 'delivering': return 'Saiu para Entrega';
      case 'completed': return 'Pedido Concluído';
      default: return 'Processando';
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^35/.test(cleaned)) return 'jcb';
    if (/^(?:2131|1800|30[0-5])/.test(cleaned)) return 'diners';
    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(cleaned)) return 'maestro';
    if (/^(6062|60)/.test(cleaned)) return 'hipercard';
    if (/^(3841|60)/.test(cleaned)) return 'elo';
    return 'generic';
  };

  const cardBrand = getCardBrand(cardInfo.number);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4">SubCashS</h1>
            <p className="text-2xl text-yellow-400 font-bold">CONVENIÊNCIA & PAPELARIA</p>
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full top-0 z-40 bg-black/95 backdrop-blur-md border-b border-yellow-500/20 shadow-lg shadow-yellow-500/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col"
            >
              <span className="text-3xl md:text-4xl font-black tracking-tight text-white">
                SubCashS
              </span>
              <span className="text-xs md:text-sm font-medium text-yellow-400 tracking-widest">
                CONVENIÊNCIA E PAPELARIA
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#home" className="text-white hover:text-yellow-400 transition-colors font-medium">Início</a>
              <a href="#products" className="text-white hover:text-yellow-400 transition-colors font-medium">Produtos</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition-colors font-medium">Sobre</a>
              <a href="#location" className="text-white hover:text-yellow-400 transition-colors font-medium">Localização</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition-colors font-medium">Contato</a>
            </nav>

            {/* Cart & User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Account Button */}
              {currentUser ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/customer')}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-500/50 font-bold text-sm"
                >
                  <FaUser /> {currentUser.name.split(' ')[0]}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/login')}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg shadow-green-500/50 font-bold text-sm"
                >
                  <FaUser /> Entrar
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(true)}
                className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-3 rounded-full shadow-lg shadow-yellow-500/50"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-2xl text-yellow-400"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 space-y-3 border-t border-yellow-500/20 pt-4"
            >
              {/* Botão de Login/Usuário no Mobile */}
              {currentUser ? (
                <button
                  onClick={() => {
                    navigate('/customer');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg shadow-lg shadow-blue-500/50 font-bold"
                >
                  <FaUser /> {currentUser.name.split(' ')[0]}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-lg shadow-green-500/50 font-bold"
                >
                  <FaUser /> Entrar
                </button>
              )}
              
              <a href="#home" className="block text-white hover:text-yellow-400 transition-colors">Início</a>
              <a href="#products" className="block text-white hover:text-yellow-400 transition-colors">Produtos</a>
              <a href="#about" className="block text-white hover:text-yellow-400 transition-colors">Sobre</a>
              <a href="#location" className="block text-white hover:text-yellow-400 transition-colors">Localização</a>
              <a href="#contact" className="block text-white hover:text-yellow-400 transition-colors">Contato</a>
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  textShadow: [
                    '0 0 20px rgba(250, 204, 21, 0.5)',
                    '0 0 40px rgba(250, 204, 21, 0.8)',
                    '0 0 20px rgba(250, 204, 21, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl md:text-8xl font-black mb-4 text-white"
              >
                SubCashS
              </motion.div>
              <div className="text-2xl md:text-4xl font-bold text-yellow-400 tracking-wider">
                CONVENIÊNCIA & PAPELARIA
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed"
            >
              Experiência premium em produtos de papelaria e conveniência.
              Qualidade, variedade e atendimento excepcional em um só lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href="#products"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(250, 204, 21, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 text-lg font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/50"
              >
                Explorar Produtos <FaArrowRight />
              </motion.a>
              <motion.a
                href="#location"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 text-lg font-bold rounded-lg hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
              >
                <FaMapMarkerAlt /> Nossa Localização
              </motion.a>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { number: '500+', label: 'Produtos' },
              { number: '1000+', label: 'Clientes' },
              { number: '24/7', label: 'Suporte' },
              { number: '5.0', label: 'Avaliação' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 p-6 rounded-xl text-center backdrop-blur-sm"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-white">Nossos </span>
              <span className="text-yellow-400">Produtos</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Seleção premium de produtos para seu dia a dia
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center gap-4 mb-12 flex-wrap"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/50'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 rounded-2xl overflow-hidden group transition-all duration-300 shadow-xl"
              >
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 flex items-center gap-1">
                    <FaTag /> -{product.discount}
                  </div>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div className="flex justify-center mb-6 relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-2xl shadow-lg shadow-yellow-500/30"
                    >
                      <product.icon className="text-5xl text-black" />
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-yellow-400 text-sm font-semibold mb-3">{product.category}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-gray-400 text-sm ml-2">({product.rating})</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-yellow-400">{product.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 flex items-center gap-2"
                    >
                      <FaShoppingCart /> Adicionar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="text-white">Sobre a </span>
                <span className="text-yellow-400">SubCashS</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Há anos atendendo a comunidade com excelência, oferecemos uma experiência única em conveniência e papelaria. Nossa missão é proporcionar qualidade, variedade e atendimento personalizado.
              </p>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                De materiais escolares premium a snacks e bebidas selecionados, cada produto é escolhido pensando no seu bem-estar e satisfação.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <FaStar className="text-xl" />
                  <span className="font-bold">Produtos Premium</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <FaClock className="text-xl" />
                  <span className="font-bold">Atendimento Rápido</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { title: 'Qualidade', value: '100%', icon: FaStar },
                { title: 'Satisfação', value: '5.0', icon: FaStar },
                { title: 'Produtos', value: '500+', icon: FaTag },
                { title: 'Experiência', value: '10+', icon: FaClock },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-6 rounded-2xl text-center"
                >
                  <item.icon className="text-4xl text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-2">{item.value}</div>
                  <div className="text-sm text-gray-400 font-medium">{item.title}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section with Google Maps */}
      <section id="location" className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-white">Nossa </span>
              <span className="text-yellow-400">Localização</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Venha nos visitar! Estamos prontos para atendê-lo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 h-[400px] md:h-[500px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.0842890768877!2d-46.87588492378566!3d-23.51344075975813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf0233e5e3e3e3%3A0x1e1e1e1e1e1e1e1e!2sR.%20Adoniran%20Barbosa%2C%20112%20-%20Parque%20Imperial%2C%20Barueri%20-%20SP%2C%2006462-000!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização SubCashS"
              ></iframe>
            </motion.div>

            {/* Location Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-xl">
                    <FaMapMarkerAlt className="text-2xl text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Endereço</h3>
                    <p className="text-gray-300 leading-relaxed">
                      R. Adoniran Barbosa, 112<br />
                      Parque Imperial<br />
                      Barueri - SP, 06462-000
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-xl">
                    <FaClock className="text-2xl text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Horário de Funcionamento</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Segunda a Sexta: 08:00 - 20:00<br />
                      Sábado: 08:00 - 18:00<br />
                      Domingo: 09:00 - 14:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-xl">
                    <FaPhone className="text-2xl text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Contato</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Telefone: (11) 4199-0000<br />
                      WhatsApp: (11) 98765-4321
                    </p>
                  </div>
                </div>
              </div>

              <motion.a
                href="https://www.google.com/maps/dir//R.+Adoniran+Barbosa,+112+-+Parque+Imperial,+Barueri+-+SP,+06462-000"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-4 rounded-xl font-bold text-center hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Como Chegar
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-black">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-center mb-4"
          >
            <span className="text-white">Entre em </span>
            <span className="text-yellow-400">Contato</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 text-lg mb-12"
          >
            Tem alguma dúvida? Envie-nos uma mensagem!
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: FaPhone, title: 'Telefone', info: '(11) 4199-0000' },
              { icon: FaEnvelope, title: 'Email', info: 'contato@subcashs.com.br' },
              { icon: FaMapMarkerAlt, title: 'Endereço', info: 'Barueri - SP' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-6 rounded-2xl text-center"
              >
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-2xl text-black" />
                </div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.info}</p>
              </motion.div>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 p-8 rounded-2xl space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Seu Nome"
                className="w-full px-4 py-4 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Seu Email"
                className="w-full px-4 py-4 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <input
              type="tel"
              placeholder="Telefone"
              className="w-full px-4 py-4 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <textarea
              placeholder="Sua Mensagem"
              rows="5"
              className="w-full px-4 py-4 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
            ></textarea>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 text-lg font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
            >
              <FaEnvelope /> Enviar Mensagem
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-to-b from-black to-gray-900 border-t border-yellow-500/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black text-white mb-2">SubCashS</h3>
              <p className="text-sm text-yellow-400 font-semibold mb-4">CONVENIÊNCIA & PAPELARIA</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sua loja de confiança para produtos de qualidade
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#home" className="hover:text-yellow-400 transition-colors">Início</a></li>
                <li><a href="#products" className="hover:text-yellow-400 transition-colors">Produtos</a></li>
                <li><a href="#about" className="hover:text-yellow-400 transition-colors">Sobre</a></li>
                <li><a href="#location" className="hover:text-yellow-400 transition-colors">Localização</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <FaPhone className="text-yellow-400" />
                  (11) 4199-0000
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-yellow-400" />
                  contato@subcashs.com.br
                </li>
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-yellow-400 mt-1" />
                  <span>R. Adoniran Barbosa, 112<br />Barueri - SP</span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-white font-bold mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <FaClock className="text-yellow-400" />
                  Seg-Sex: 08:00 - 20:00
                </li>
                <li className="flex items-center gap-2">
                  <FaClock className="text-yellow-400" />
                  Sábado: 08:00 - 18:00
                </li>
                <li className="flex items-center gap-2">
                  <FaClock className="text-yellow-400" />
                  Domingo: 09:00 - 14:00
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-yellow-500/20 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 <span className="text-yellow-400 font-bold">SubCashS</span> - Todos os direitos reservados
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Desenvolvido com ❤️ em Barueri - SP
            </p>
            <p 
              className="text-gray-700 text-xs mt-4 opacity-30 hover:opacity-60 transition-opacity cursor-pointer"
              onClick={() => window.location.href = '/admin'}
              title="Atalho: Ctrl+Shift+A"
            >
              🛡️ Admin
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button */}
      {cart.length > 0 && !cartOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-5 rounded-full shadow-2xl shadow-yellow-500/50 z-40 md:hidden"
        >
          <FaShoppingCart className="text-2xl" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
            {cartCount}
          </span>
        </motion.button>
      )}

      {/* Order Tracking Modal for Customers */}
      <AnimatePresence>
        {showOrderTracking && currentOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderTracking(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <FaTruck className="text-yellow-400" />
                  Rastreamento do Pedido
                  <motion.span
                    key={forceUpdate}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
                  >
                    • Ao vivo
                  </motion.span>
                </h2>
                <button
                  onClick={() => setShowOrderTracking(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {(() => {
                const order = getCurrentOrder();
                if (!order) return <p className="text-gray-400">Pedido não encontrado</p>;

                return (
                  <div>
                    {/* Order Info */}
                    <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6 mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Pedido #{order.id}</p>
                          <p className="text-white font-bold text-lg">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Total</p>
                          <p className="text-yellow-400 font-black text-2xl">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <p className="text-gray-400">
                          <FaPhone className="inline mr-2 text-yellow-400" />
                          {order.phone}
                        </p>
                        <p className="text-gray-400">
                          <FaClock className="inline mr-2 text-yellow-400" />
                          {order.date}
                        </p>
                        <p className="text-gray-400 md:col-span-2">
                          <FaMapMarkerAlt className="inline mr-2 text-yellow-400" />
                          {order.address}
                        </p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-6">
                      <h3 className="text-white font-bold mb-4">Status do Pedido</h3>
                      <div className="space-y-4">
                        {[
                          { status: 'pending', label: 'Pedido Recebido', icon: FaCheckCircle },
                          { status: 'preparing', label: 'Preparando', icon: FaBox },
                          { status: 'delivering', label: order.deliveryType === 'pickup' ? 'Pronto para Retirada' : 'Saiu para Entrega', icon: FaTruck },
                          { status: 'completed', label: 'Concluído', icon: FaCheckCircle }
                        ].map((step, idx) => {
                          const statusOrder = ['pending', 'preparing', 'delivering', 'completed'];
                          const currentIndex = statusOrder.indexOf(order.status);
                          const stepIndex = statusOrder.indexOf(step.status);
                          const isActive = stepIndex <= currentIndex;
                          const isCurrent = step.status === order.status;

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
                                <p className={`font-bold ${
                                  isActive ? 'text-white' : 'text-gray-600'
                                }`}>
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

                    {/* Items */}
                    <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6">
                      <h3 className="text-white font-bold mb-4">Itens do Pedido</h3>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                            <span className="text-white font-medium">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    {order.status !== 'completed' && (
                      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                        <p className="text-blue-400 text-sm">
                          📞 Dúvidas? Entre em contato: (11) 4199-0000
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-yellow-500/20 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    {checkoutStep === 'cart' && 'Carrinho de Compras'}
                    {checkoutStep === 'delivery' && 'Dados de Entrega'}
                    {checkoutStep === 'payment' && 'Pagamento'}
                    {checkoutStep === 'success' && 'Pedido Confirmado!'}
                  </h2>
                  {checkoutStep === 'cart' && (
                    <p className="text-yellow-400 text-sm mt-1">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</p>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Cart Step */}
                {checkoutStep === 'cart' && (
                  <div>
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Seu carrinho está vazio</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-black/50 border border-yellow-500/20 rounded-xl p-4 flex gap-4"
                          >
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-lg flex items-center justify-center">
                              <item.icon className="text-3xl text-black" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg">{item.name}</h3>
                              <p className="text-yellow-400 text-sm">{item.category}</p>
                              <p className="text-white font-bold mt-2">{item.price}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                              >
                                <FaTrash />
                              </button>
                              <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="text-yellow-400 hover:text-yellow-300 w-8 h-8 flex items-center justify-center"
                                >
                                  <FaMinus />
                                </button>
                                <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-yellow-400 hover:text-yellow-300 w-8 h-8 flex items-center justify-center"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery Step */}
                {checkoutStep === 'delivery' && (
                  <div className="space-y-6">
                    {/* Shipping Method */}
                    <div>
                      <h3 className="text-white font-bold mb-4 text-lg">Método de Entrega</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setShippingMethod('delivery')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            shippingMethod === 'delivery'
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <FaTruck className={`text-3xl mx-auto mb-2 ${
                            shippingMethod === 'delivery' ? 'text-yellow-400' : 'text-gray-400'
                          }`} />
                          <p className="text-white font-bold">Entrega</p>
                          <p className="text-gray-400 text-sm">R$ 5,00</p>
                        </button>
                        <button
                          onClick={() => setShippingMethod('pickup')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            shippingMethod === 'pickup'
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <FaMapMarkerAlt className={`text-3xl mx-auto mb-2 ${
                            shippingMethod === 'pickup' ? 'text-yellow-400' : 'text-gray-400'
                          }`} />
                          <p className="text-white font-bold">Retirada</p>
                          <p className="text-gray-400 text-sm">Grátis</p>
                        </button>
                      </div>
                    </div>

                    {/* Delivery Form */}
                    {shippingMethod === 'delivery' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white font-bold text-lg">Endereço de Entrega</h3>
                          {currentUser && !editingAddress && (
                            <button
                              onClick={() => setEditingAddress(true)}
                              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-2 transition-colors"
                            >
                              <FaEdit /> Alterar Endereço
                            </button>
                          )}
                        </div>

                        {/* Mostrar dados salvos quando não estiver editando */}
                        {currentUser && !editingAddress && deliveryInfo.address ? (
                          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 md:p-6 space-y-3 text-sm md:text-base">
                            <div className="flex items-start gap-2 md:gap-3">
                              <FaUser className="text-yellow-400 mt-1 text-sm md:text-base" />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-xs md:text-sm">Nome Completo</p>
                                <p className="text-white font-bold truncate">{deliveryInfo.name}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 md:gap-3">
                              <FaPhone className="text-yellow-400 mt-1 text-sm md:text-base" />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-xs md:text-sm">Telefone</p>
                                <p className="text-white font-bold">{deliveryInfo.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 md:gap-3">
                              <FaMapMarkerAlt className="text-yellow-400 mt-1 text-sm md:text-base" />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-xs md:text-sm">Endereço</p>
                                <p className="text-white font-bold break-words">
                                  {deliveryInfo.address}, {deliveryInfo.number}
                                  {deliveryInfo.complement && ` - ${deliveryInfo.complement}`}
                                </p>
                                <p className="text-white break-words">
                                  {deliveryInfo.neighborhood} - {deliveryInfo.city}, {deliveryInfo.state}
                                </p>
                                <p className="text-gray-400 text-xs md:text-sm">CEP: {deliveryInfo.cep}</p>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-yellow-400/30">
                              <p className="text-yellow-400 text-xs md:text-sm flex items-center gap-2">
                                <FaCheckCircle /> Dados confirmados do seu cadastro
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <input
                              type="text"
                              placeholder="Nome Completo *"
                              value={deliveryInfo.name}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                              className="md:col-span-2 px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="tel"
                              placeholder="Telefone *"
                              value={deliveryInfo.phone}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="CEP *"
                              value={deliveryInfo.cep}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, cep: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Endereço *"
                              value={deliveryInfo.address}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                              className="md:col-span-2 px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Número *"
                              value={deliveryInfo.number}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, number: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Complemento"
                              value={deliveryInfo.complement}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, complement: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Bairro *"
                              value={deliveryInfo.neighborhood}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, neighborhood: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Cidade *"
                              value={deliveryInfo.city}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                              className="px-3 md:px-4 py-2 md:py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            {editingAddress && (
                              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() => {
                                    // Restaurar dados originais
                                    if (currentUser) {
                                      setDeliveryInfo({
                                        name: currentUser.name || '',
                                        phone: currentUser.phone || '',
                                        cep: currentUser.cep || '',
                                        address: currentUser.address || '',
                                        number: currentUser.number || '',
                                        complement: currentUser.complement || '',
                                        neighborhood: currentUser.neighborhood || '',
                                        city: currentUser.city || 'Barueri',
                                        state: currentUser.state || 'SP'
                                      });
                                    }
                                    setEditingAddress(false);
                                  }}
                                  className="flex-1 border-2 border-gray-700 text-white py-2 md:py-3 rounded-lg text-sm md:text-base hover:border-gray-600 transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => setEditingAddress(false)}
                                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:from-yellow-500 hover:to-yellow-600"
                                >
                                  Confirmar Alteração
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pickup Address */}
                    {shippingMethod === 'pickup' && (
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-yellow-400" />
                          Endereço para Retirada
                        </h3>
                        <p className="text-gray-300">
                          R. Adoniran Barbosa, 112<br />
                          Parque Imperial<br />
                          Barueri - SP, 06462-000
                        </p>
                        <div className="mt-4 text-sm text-gray-400">
                          <p className="flex items-center gap-2 mb-1">
                            <FaClock className="text-yellow-400" />
                            Seg-Sex: 08:00 - 20:00
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Step */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-6">
                    <h3 className="text-white font-bold text-lg">Forma de Pagamento</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <FaCreditCard className={`text-4xl mx-auto mb-3 ${
                          paymentMethod === 'card' ? 'text-yellow-400' : 'text-gray-400'
                        }`} />
                        <p className="text-white font-bold">Cartão</p>
                        <p className="text-gray-400 text-xs mt-1">Crédito/Débito</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'pix'
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`text-4xl mx-auto mb-3 font-bold ${
                          paymentMethod === 'pix' ? 'text-yellow-400' : 'text-gray-400'
                        }`}>PIX</div>
                        <p className="text-white font-bold">PIX</p>
                        <p className="text-gray-400 text-xs mt-1">Instantâneo</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('money')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'money'
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`text-4xl mx-auto mb-3 font-bold ${
                          paymentMethod === 'money' ? 'text-yellow-400' : 'text-gray-400'
                        }`}>R$</div>
                        <p className="text-white font-bold">Dinheiro</p>
                        <p className="text-gray-400 text-xs mt-1">Na entrega</p>
                      </button>
                    </div>

                    {/* Card Payment Form */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Animated Credit Card */}
                        <div className="mb-8">
                          <motion.div
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: cardInfo.number ? 0 : 0 }}
                            className="relative w-full max-w-md mx-auto"
                            style={{ perspective: '1000px' }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`relative w-full h-56 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden ${
                                cardBrand === 'visa' ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900' :
                                cardBrand === 'mastercard' ? 'bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600' :
                                cardBrand === 'amex' ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700' :
                                cardBrand === 'elo' ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-red-600' :
                                cardBrand === 'hipercard' ? 'bg-gradient-to-br from-red-700 via-red-800 to-gray-900' :
                                'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
                              }`}
                            >
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full -ml-30 -mb-30"></div>
                              </div>

                              {/* Card Content */}
                              <div className="relative z-10">
                                {/* Chip and Brand Logo */}
                                <div className="flex justify-between items-start mb-8">
                                  {/* Chip */}
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: cardInfo.number ? 1 : 0 }}
                                    className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md overflow-hidden"
                                  >
                                    <div className="grid grid-cols-3 gap-px p-1 h-full">
                                      {[...Array(9)].map((_, i) => (
                                        <div key={i} className="bg-yellow-600 rounded-sm"></div>
                                      ))}
                                    </div>
                                  </motion.div>

                                  {/* Brand Logo */}
                                  <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-white font-black text-2xl"
                                  >
                                    {cardBrand === 'visa' && <span className="italic">VISA</span>}
                                    {cardBrand === 'mastercard' && (
                                      <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                                        <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80 -ml-3"></div>
                                      </div>
                                    )}
                                    {cardBrand === 'amex' && <span className="font-bold">AMEX</span>}
                                    {cardBrand === 'elo' && <span className="font-bold">elo</span>}
                                    {cardBrand === 'hipercard' && <span className="text-xl">hipercard</span>}
                                    {cardBrand === 'generic' && <span className="text-sm opacity-50">CARTÃO</span>}
                                  </motion.div>
                                </div>

                                {/* Card Number (Hidden) */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="mb-6"
                                >
                                  <div className="text-white text-xl tracking-widest font-mono flex justify-between">
                                    {cardInfo.number || '•••• •••• •••• ••••'.split(' ').map((group, idx) => (
                                      <span key={idx} className="opacity-50">
                                        {cardInfo.number.split(' ')[idx] ? '••••' : '••••'}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>

                                {/* Card Holder and Expiry */}
                                <div className="flex justify-between items-end">
                                  <div>
                                    <div className="text-white text-xs opacity-70 mb-1">Nome do Titular</div>
                                    <motion.div
                                      key={cardInfo.name}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-white font-semibold tracking-wider text-sm"
                                    >
                                      {cardInfo.name || 'SEU NOME AQUI'}
                                    </motion.div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white text-xs opacity-70 mb-1">Validade</div>
                                    <motion.div
                                      key={cardInfo.expiry}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-white font-mono font-semibold"
                                    >
                                      {cardInfo.expiry || 'MM/AA'}
                                    </motion.div>
                                  </div>
                                </div>
                              </div>

                              {/* Contactless Icon */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: cardInfo.number ? 0.3 : 0 }}
                                className="absolute top-6 right-6 text-white text-3xl"
                              >
                                <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
                                  <path d="M8 8C8 6.4 9.4 5 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M5 12C5 8.7 7.7 6 11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M2 16C2 10.5 6.5 6 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Card Form */}
                        <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <FaCreditCard className="text-yellow-400" />
                            Dados do Cartão
                          </h4>

                          {/* Card Type Selection */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                              onClick={() => setCardInfo({...cardInfo, cardType: 'credit'})}
                              className={`py-3 rounded-lg border-2 font-bold transition-all ${
                                cardInfo.cardType === 'credit'
                                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              💳 Crédito
                            </button>
                            <button
                              onClick={() => setCardInfo({...cardInfo, cardType: 'debit'})}
                              className={`py-3 rounded-lg border-2 font-bold transition-all ${
                                cardInfo.cardType === 'debit'
                                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              💳 Débito
                            </button>
                          </div>

                          {/* Card Form Fields */}
                          <div className="space-y-4">
                            {/* Card Number */}
                            <div>
                              <label className="text-gray-400 text-sm mb-2 block">Número do Cartão *</label>
                              <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardInfo.number}
                                onChange={(e) => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})}
                                maxLength="19"
                                className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-lg tracking-wider focus:outline-none focus:border-yellow-500 transition-colors"
                              />
                              {cardBrand !== 'generic' && (
                                <motion.p
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-xs text-yellow-400 mt-2 flex items-center gap-1"
                                >
                                  <span>✓</span> Bandeira detectada: <span className="font-bold uppercase">{cardBrand}</span>
                                </motion.p>
                              )}
                            </div>

                            {/* Cardholder Name */}
                            <div>
                              <label className="text-gray-400 text-sm mb-2 block">Nome no Cartão *</label>
                              <input
                                type="text"
                                placeholder="Nome como está no cartão"
                                value={cardInfo.name}
                                onChange={(e) => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})}
                                className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white uppercase focus:outline-none focus:border-yellow-500 transition-colors"
                              />
                            </div>

                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-400 text-sm mb-2 block">Validade *</label>
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  value={cardInfo.expiry}
                                  onChange={(e) => setCardInfo({...cardInfo, expiry: formatExpiry(e.target.value)})}
                                  maxLength="5"
                                  className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-lg tracking-wider focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm mb-2 block">CVV *</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  value={cardInfo.cvv}
                                  onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '')})}
                                  maxLength="4"
                                  className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white text-lg tracking-wider focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Security Info */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
                              <p className="text-blue-400 text-xs flex items-start gap-2">
                                <span className="text-lg">🔒</span>
                                <span>Seus dados estão protegidos e criptografados. Não armazenamos informações do seu cartão.</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* PIX Instructions */}
                    {paymentMethod === 'pix' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/50 border border-yellow-500/20 rounded-xl p-6 text-center"
                      >
                        <div className="text-6xl mb-4">📱</div>
                        <h4 className="text-white font-bold mb-2 text-lg">Pagamento via PIX</h4>
                        <p className="text-gray-400 mb-4">
                          Após finalizar o pedido, você receberá o QR Code para pagamento
                        </p>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <p className="text-green-400 text-sm">
                            ✓ Pagamento instantâneo<br />
                            ✓ Confirmação em segundos
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Money Instructions */}
                    {paymentMethod === 'money' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/50 border border-yellow-500/20 rounded-xl p-6"
                      >
                        <div className="text-6xl mb-4 text-center">💵</div>
                        <h4 className="text-white font-bold mb-4 text-lg text-center">Pagamento em Dinheiro</h4>
                        <div className="space-y-3">
                          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                            <label className="text-gray-400 text-sm mb-2 block">Precisa de troco para quanto?</label>
                            <input
                              type="text"
                              placeholder="R$ 100,00"
                              className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <p className="text-gray-500 text-xs mt-2">Deixe em branco se não precisar de troco</p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-blue-400 text-sm">
                              💡 Tenha o valor exato ou informe o valor para troco
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6">
                      <h3 className="text-white font-bold mb-4 text-lg">Resumo do Pedido</h3>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-white font-medium">
                              R$ {(parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-gray-700 pt-3 mt-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Entrega</span>
                            <span className="text-white">
                              {shippingMethod === 'delivery' ? `R$ ${shippingFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3 mt-3">
                            <span className="text-yellow-400">Total</span>
                            <span className="text-yellow-400">R$ {total.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Step */}
                {checkoutStep === 'success' && (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <FaCheckCircle className="text-8xl text-green-500 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-white mb-4">Pedido Confirmado!</h3>
                    <p className="text-gray-400 text-lg mb-2">Seu pedido #{currentOrderId} foi recebido com sucesso</p>
                    <p className="text-yellow-400 font-bold text-2xl mb-6">R$ {total.toFixed(2).replace('.', ',')}</p>
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 max-w-md mx-auto mb-6">
                      <p className="text-white mb-2">
                        {shippingMethod === 'delivery' 
                          ? '🚚 Seu pedido será entregue em breve'
                          : '📍 Você pode retirar seu pedido em nossa loja'
                        }
                      </p>
                      <p className="text-gray-400 text-sm">
                        Acompanhe o status em tempo real no seu painel!
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate('/customer');
                          setCartOpen(false);
                        }}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 flex items-center gap-2 justify-center"
                      >
                        <FaUser /> Ver Meus Pedidos
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // Limpar carrinho e formulário
                          setCart([]);
                          setCartOpen(false);
                          setCheckoutStep('cart');
                          setDeliveryInfo({
                            name: '',
                            phone: '',
                            cep: '',
                            address: '',
                            number: '',
                            complement: '',
                            neighborhood: '',
                            city: 'Barueri',
                            state: 'SP'
                          });
                          setShippingMethod('delivery');
                          setPaymentMethod('');
                          setCardInfo({
                            number: '',
                            name: '',
                            expiry: '',
                            cvv: '',
                            cardType: 'credit'
                          });
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 justify-center"
                      >
                        <FaShoppingCart /> Continuar Comprando
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {checkoutStep !== 'success' && (
                <div className="p-6 border-t border-yellow-500/20">
                  {checkoutStep === 'cart' && cart.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-2xl font-black text-yellow-400">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={proceedToDelivery}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30"
                      >
                        Continuar para Entrega <FaArrowRight className="inline ml-2" />
                      </motion.button>
                    </div>
                  )}

                  {checkoutStep === 'delivery' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 border-2 border-gray-700 text-white py-4 rounded-xl font-bold hover:border-gray-600 transition-all"
                      >
                        Voltar
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={proceedToPayment}
                        disabled={shippingMethod === 'delivery' && (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.cep || !deliveryInfo.address || !deliveryInfo.number || !deliveryInfo.neighborhood)}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continuar para Pagamento <FaArrowRight className="inline ml-2" />
                      </motion.button>
                    </div>
                  )}

                  {checkoutStep === 'payment' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCheckoutStep('delivery')}
                        className="flex-1 border-2 border-gray-700 text-white py-4 rounded-xl font-bold hover:border-gray-600 transition-all"
                      >
                        Voltar
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={completeOrder}
                        disabled={
                          !paymentMethod || 
                          (paymentMethod === 'card' && (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvv || cardInfo.number.replace(/\s/g, '').length < 16))
                        }
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Finalizar Pedido - R$ {total.toFixed(2).replace('.', ',')}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
