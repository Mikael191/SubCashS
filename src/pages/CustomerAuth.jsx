import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaHome, FaCity } from 'react-icons/fa';
import { UserManager } from '../utils/dataManager';
import { useNavigate } from 'react-router-dom';

function CustomerAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Barueri',
    state: 'SP',
    cep: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      const result = UserManager.login(formData.email, formData.password);
      if (result.success) {
        navigate('/customer');
      } else {
        alert(result.message);
      }
    } else {
      // Registro
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
      }

      const result = UserManager.register(formData);
      if (result.success) {
        UserManager.saveUser(result.user);
        navigate('/customer');
      } else {
        alert(result.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl font-black text-white mb-2"
          >
            SubCashS
          </motion.h1>
          <p className="text-yellow-400 font-bold text-lg">CONVENIÊNCIA & PAPELARIA</p>
          <p className="text-gray-400 text-sm mt-4">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              isLogin
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              !isLogin
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-yellow-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome completo *"
                className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-yellow-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-yellow-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Senha *"
              className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <FaPhone className="absolute left-4 top-4 text-yellow-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Telefone *"
                  className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  required={!isLogin}
                />
              </div>

              <div className="border-t border-gray-700 pt-4 mt-6">
                <p className="text-yellow-400 text-sm font-bold mb-3">📍 Endereço (Opcional)</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative md:col-span-2">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-yellow-400" />
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="CEP"
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <div className="relative md:col-span-2">
                    <FaHome className="absolute left-4 top-4 text-yellow-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Rua"
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="Número"
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />

                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleChange}
                    placeholder="Complemento"
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />

                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Bairro"
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />

                  <div className="relative">
                    <FaCity className="absolute left-4 top-4 text-yellow-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Cidade"
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/50"
          >
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </motion.button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
          >
            ← Voltar para a loja
          </button>
          <p className="text-gray-600 text-xs mt-4">
            Seus dados são armazenados de forma segura
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default CustomerAuth;
