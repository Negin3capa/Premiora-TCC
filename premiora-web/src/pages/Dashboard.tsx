import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useTabbedFeed } from '../hooks/useTabbedFeed';
import { useLocalSearch } from '../hooks/useSearch';
import { Sidebar, MobileBottomBar } from '../components/layout';
import '../styles/HomePage.css';

// Lazy loading dos componentes para otimização
const Header = React.lazy(() => import('../components/layout/Header'));
const Feed = React.lazy(() => import('../components/content/Feed'));

/**
 * Componente de loading para componentes em lazy loading
 * Exibe um indicador visual durante o carregamento
 */
const ComponentLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontSize: '14px',
    color: '#666'
  }}>
    Carregando...
  </div>
);

/**
 * Dashboard da aplicação Premiora
 * Página principal após login, exibe feed de conteúdo com abas "For You" e "Following"
 *
 * @component
 */
const Dashboard: React.FC = () => {
  const {
    activeTab,
    feedItems,
    loading,
    hasMore,
    error,
    loadMoreContent,
    refreshFeed,
    retryLoadContent,
    canRetry,
    followingFeed,
    handleTabChange
  } = useTabbedFeed();

  const { filteredItems } = useLocalSearch(feedItems);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Controlar se já fizemos o refresh inicial
  const hasInitialRefreshedRef = useRef(false);

  // Memoizar handlers para evitar re-criação
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && hasInitialRefreshedRef.current) {
      // Quando a página fica visível novamente, fazer refresh do feed (apenas se já foi inicializado)
      refreshFeed();
    }
  }, [refreshFeed]);

  const handleNavigation = useCallback(() => {
    if (hasInitialRefreshedRef.current) {
      // Delay maior para garantir que a navegação foi completada
      setTimeout(() => {
        refreshFeed();
      }, 300);
    }
  }, [refreshFeed]);

  // Setup dos event listeners apenas uma vez
  useEffect(() => {
    // Adicionar listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleNavigation);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [handleVisibilityChange, handleNavigation]);

  // REMOVED: Refresh inicial que estava causando conflitos com infinite scroll
  // O useFeed hook já carrega o conteúdo inicial adequadamente

  return (
    <div className="dashboard-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="dashboard-main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            showTabs={true}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </Suspense>
        <Suspense fallback={<ComponentLoader />}>
          <Feed
            // Props da aba ativa
            items={filteredItems}
            loading={loading}
            hasMore={hasMore}
            error={error}
            onLoadMore={loadMoreContent}
            onRetry={retryLoadContent}
            canRetry={canRetry}
            // Props das abas (controladas pelo header)
            activeTab={activeTab}
            // Props do feed "Following"
            followingItems={followingFeed.feedItems}
            followingLoading={followingFeed.loading}
            followingHasMore={followingFeed.hasMore}
            followingError={followingFeed.error}
            onFollowingLoadMore={followingFeed.loadMoreContent}
            onFollowingRetry={followingFeed.retryLoadContent}
            followingCanRetry={followingFeed.canRetry}
          />
        </Suspense>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default Dashboard;
