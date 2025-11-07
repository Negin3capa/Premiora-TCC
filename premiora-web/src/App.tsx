/**
 * Componente principal App
 * Gerencia roteamento da aplicação com proteção de rotas e code splitting
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, ProfileSetupGuard } from './components/auth';
import NotificationContainer from './components/common/NotificationContainer';

// Lazy loading dos componentes de página para otimização de bundle
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const EmailConfirmation = React.lazy(() => import('./pages/EmailConfirmation'));
const EmailConfirmationSuccess = React.lazy(() => import('./pages/EmailConfirmationSuccess'));
const ProfileSetup = React.lazy(() => import('./pages/ProfileSetup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const CommunitiesPage = React.lazy(() => import('./pages/CommunitiesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

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
 * Rotas públicas (/, /login, /signup):
 * - Acessíveis apenas por usuários não autenticados
 * - Usuários autenticados são redirecionados para /dashboard
 *
 * Rotas protegidas (/dashboard):
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

        {/* Rota de Signup (apenas para não autenticados) */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Rota de Callback OAuth (acessível para todos) */}
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
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

        {/* Rota de Setup de Perfil (apenas para autenticados) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* Rota Dashboard (apenas para autenticados com perfil completo) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProfileSetupGuard>
                <Dashboard />
              </ProfileSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Rota Home (redirect para dashboard) */}
        <Route
          path="/home"
          element={<Navigate to="/dashboard" replace />}
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

        {/* Rota Notificações (apenas para autenticados) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Rota Mensagens (apenas para autenticados) */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Rota Perfil (apenas para autenticados) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
