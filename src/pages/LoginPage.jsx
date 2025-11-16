import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    number: '',
    neighborhood: '',
    city: 'Barueri',
    cep: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegister) {
      // Registrar novo cliente
      const users = JSON.parse(localStorage.getItem('subcashs_users') || '[]');
      const newUser = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('subcashs_users', JSON.stringify(users));
      localStorage.setItem('subcashs_current_user', JSON.stringify(newUser));
      onLogin(newUser);
      navigate('/');
    } else {
      // Login
      const users = JSON.parse(localStorage.getItem('subcashs_users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        localStorage.setItem('subcashs_current_user', JSON.stringify(user));
        onLogin(user);
        navigate('/');
      } else {
        alert('❌ Email ou senha incorretos!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">SubCashS</h1>
          <p className="text-yellow-400 text-sm font-semibold">CONVENIÊNCIA E PAPELARIA</p>
          <p className="text-gray-400 text-sm mt-4">{isRegister ? 'Crie sua conta' : 'Entre na sua conta'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Nome Completo *</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Telefone *</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">CEP *</label>
                <input
                  type="text"
                  required
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  placeholder="00000-000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Endereço"
                />
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Número"
                />
              </div>

              <input
                type="text"
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                placeholder="Bairro"
              />
            </>
          )}

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Email *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Senha *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-black border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg"
          >
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-yellow-400 hover:text-yellow-300 text-sm"
            >
              {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-gray-500 hover:text-gray-400 text-xs"
            >
              Acesso Administrativo
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
