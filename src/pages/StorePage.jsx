import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaPen, FaBook, FaCoffee, FaSnowflake, FaUtensils, FaPaperclip, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaStar, FaArrowRight, FaTag, FaUser, FaSignOutAlt } from 'react-icons/fa';

function StorePage({ user, onLogout, cart, setCart }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { scrollYProgress } = useScroll();

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
  const filteredProducts = selectedCategory === 'Todos' ? products : products.filter(p => p.category === selectedCategory);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* Header */}
      <header className="fixed w-full top-0 z-40 bg-black/95 backdrop-blur-md border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black text-white">SubCashS</span>
              <span className="text-xs md:text-sm font-medium text-yellow-400 tracking-widest">CONVENIÊNCIA E PAPELARIA</span>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-full">
                  <FaUser className="text-yellow-400" />
                  <span className="text-sm text-white">{user.name}</span>
                  <button onClick={onLogout} className="text-gray-400 hover:text-white" title="Sair">
                    <FaSignOutAlt />
                  </button>
                </div>
              )}
              
              <button onClick={() => navigate('/checkout')} className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-3 rounded-full shadow-lg">
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{cartCount}</span>
                )}
              </button>

              <button className="md:hidden text-2xl text-yellow-400" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-6xl md:text-8xl font-black mb-4 text-white">SubCashS</h1>
            <div className="text-2xl md:text-4xl font-bold text-yellow-400">CONVENIÊNCIA & PAPELARIA</div>
          </motion.div>
          
          <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experiência premium em produtos de papelaria e conveniência.
          </motion.p>

          <motion.a initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} href="#products" whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 text-lg font-bold rounded-lg">
            Explorar Produtos <FaArrowRight />
          </motion.a>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-12">
            <span className="text-white">Nossos </span>
            <span className="text-yellow-400">Produtos</span>
          </h2>

          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-full font-bold transition-all ${selectedCategory === cat ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }} className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 rounded-2xl overflow-hidden relative">
                {product.discount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 flex items-center gap-1">
                    <FaTag /> -{product.discount}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-center mb-6 relative">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-2xl">
                      <product.icon className="text-5xl text-black" />
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-yellow-400 text-sm font-semibold mb-3">{product.category}</p>
                    
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                      <span className="text-gray-400 text-sm ml-2">({product.rating})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-yellow-400">{product.price}</span>
                    <button onClick={() => addToCart(product)} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                      <FaShoppingCart /> Adicionar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-to-b from-black to-gray-900 border-t border-yellow-500/20">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 text-sm">© 2024 <span className="text-yellow-400 font-bold">SubCashS</span> - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default StorePage;
