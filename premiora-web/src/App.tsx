/**
 * Componente principal App
 * Gerencia roteamento da aplicação com proteção de rotas e code splitting
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/auth';
import NotificationContainer from './components/common/NotificationContainer';

// Lazy loading dos componentes de página para otimização de bundle
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const EmailConfirmation = React.lazy(() => import('./pages/EmailConfirmation'));
const EmailConfirmationSuccess = React.lazy(() => import('./pages/EmailConfirmationSuccess'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const CommunitiesPage = React.lazy(() => import('./pages/CommunitiesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

/**
 * Componente de loading para páginas em lazy loading
 * Exibe um indicador visual durante o carregamento das páginas
 */
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Carregando...
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
      <NotificationContainer />
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

        {/* Rota de Confirmação de Email (acessível para todos os estados de autenticação) */}
        <Route
          path="/email-confirmation"
          element={<EmailConfirmation />}
        />

        {/* Rota de Sucesso da Confirmação de Email (acessível para todos os estados de autenticação) */}
        <Route
          path="/email-confirmation-success"
          element={<EmailConfirmationSuccess />}
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

        {/* Rota Lista de Comunidades (apenas para autenticados) */}
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />

        {/* Rota Comunidades (apenas para autenticados) */}
        <Route
          path="/r/:communityName"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />

        {/* Rota Configurações (apenas para autenticados) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Rota catch-all - redireciona para landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
