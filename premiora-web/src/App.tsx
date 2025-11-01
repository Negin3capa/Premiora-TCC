/**
 * Componente principal App
 * Gerencia roteamento da aplicação com proteção de rotas
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import { ProtectedRoute, PublicRoute } from './components/auth';

/**
 * Componente principal da aplicação com roteamento protegido
 * 
 * Rotas públicas (/, /login):
 * - Acessíveis apenas por usuários não autenticados
 * - Usuários autenticados são redirecionados para /home
 * 
 * Rotas protegidas (/home):
 * - Acessíveis apenas por usuários autenticados
 * - Usuários não autenticados são redirecionados para /login
 */
const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota raiz - Landing Page (apenas para não autenticados) */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      
      {/* Rota de Login (apenas para não autenticados) */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Rota Home (apenas para autenticados) */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />

      {/* Rota catch-all - redireciona para landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
