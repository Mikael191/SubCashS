import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import DirectAdminPanel from './pages/DirectAdminPanel.jsx'
import CustomerAuth from './pages/CustomerAuth.jsx'
import CustomerPanel from './pages/CustomerPanel.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<CustomerAuth />} />
        <Route path="/customer" element={<CustomerPanel />} />
        <Route path="/admin" element={<DirectAdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
