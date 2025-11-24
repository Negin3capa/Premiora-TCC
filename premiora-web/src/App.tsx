/**
 * Componente principal App
 * Gerencia roteamento da aplicação com proteção de rotas e code splitting
 */
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, ProfileSetupGuard } from './components/auth';
import { MobileBottomBar } from './components/layout';
import NotificationContainer from './components/common/NotificationContainer';

/**
 * Hook para detectar se está em dispositivo móvel
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// Lazy loading dos componentes de página para otimização de bundle
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const ProfileSetup = React.lazy(() => import('./pages/ProfileSetup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const CommunitiesPage = React.lazy(() => import('./pages/CommunitiesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = React.lazy(() => import('./pages/ProfileEditPage'));
const CreateCommunityPage = React.lazy(() => import('./pages/CreateCommunityPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage'));
const PostViewPage = React.lazy(() => import('./pages/PostViewPage'));
const SubscriptionsPage = React.lazy(() => import('./pages/SubscriptionsPage'));
const CheckoutSuccessPage = React.lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = React.lazy(() => import('./pages/CheckoutCancelPage'));
const CreatorChannelSetupPage = React.lazy(() => import('./pages/CreatorChannelSetupPage'));

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
 * Layout para rotas protegidas que inclui a barra de navegação móvel
 * Garante que todas as páginas móveis tenham acesso à navegação inferior
 */
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <>
      {children}
      {isMobile && <MobileBottomBar />}
    </>
  );
};

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

        {/* Rota de Signup - redireciona para login (fluxo unificado) */}
        <Route
          path="/signup"
          element={<Navigate to="/login" replace />}
        />

        {/* Rota de Setup de Perfil (apenas para autenticados) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProfileSetup />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Dashboard (apenas para autenticados com perfil completo) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProfileSetupGuard>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
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
              <ProtectedLayout>
                <CommunitiesPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Explore (apenas para autenticados) */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ExplorePage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Busca Móvel e Desktop (apenas para autenticados) */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SearchResultsPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Criação de Comunidade (apenas para autenticados) */}
        <Route
          path="/create-community"
          element={(
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateCommunityPage />
              </ProtectedLayout>
            </ProtectedRoute>
          )}
        />

        {/* Rota Comunidades (apenas para autenticados) */}
        <Route
          path="/r/:communityName"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CommunityPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Configurações (apenas para autenticados) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Assinaturas (apenas para autenticados) */}
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SubscriptionsPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Checkout Success (apenas para autenticados) */}
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CheckoutSuccessPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Checkout Cancel (apenas para autenticados) */}
        <Route
          path="/checkout/cancel"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CheckoutCancelPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Notificações (apenas para autenticados) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <NotificationsPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Mensagens (apenas para autenticados) */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MessagesPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Visualização de Post (apenas para autenticados) */}
        <Route
          path="/u/:username/status/:postId"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <PostViewPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Visualização de Post de Comunidade (apenas para autenticados) */}
        <Route
          path="/r/:communityName/u/:username/status/:postId"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <PostViewPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Edição de Perfil (apenas para autenticados) */}
        <Route
          path="/u/:username/edit"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProfileEditPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Perfil por username (apenas para autenticados) */}
        <Route
          path="/u/:username"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Perfil legado - redireciona para perfil do usuário atual */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota Setup do Canal de Criador (apenas para autenticados) */}
        <Route
          path="/creator/setup"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreatorChannelSetupPage />
              </ProtectedLayout>
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
