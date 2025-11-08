import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useFeed } from '../hooks/useFeed';
import { useLocalSearch } from '../hooks/useSearch';
import { Sidebar, MobileBottomBar, FeedSidebar } from '../components/layout';
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
 * Página principal após login, exibe feed de conteúdo e informações do usuário
 *
 * @component
 */
const Dashboard: React.FC = () => {
  const { feedItems, loading, hasMore, loadMoreContent, refreshFeed } = useFeed();
  const { filteredItems } = useLocalSearch(feedItems);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeedSidebarOpen, setIsFeedSidebarOpen] = useState(false);

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

  // Refresh inicial apenas uma vez - apenas se não houver conteúdo carregado
  useEffect(() => {
    if (!hasInitialRefreshedRef.current && feedItems.length === 0) {
      hasInitialRefreshedRef.current = true;
      // Pequeno delay para garantir que o componente está totalmente montado
      const timer = setTimeout(() => {
        refreshFeed();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [feedItems.length]); // Adicionada dependência para verificar se conteúdo foi carregado

  return (
    <div className="homepage">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </Suspense>
        <Suspense fallback={<ComponentLoader />}>
          <Feed
            items={filteredItems}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMoreContent}
          />
        </Suspense>
      </div>
      <FeedSidebar
        isOpen={isFeedSidebarOpen}
        onClose={() => setIsFeedSidebarOpen(false)}
      />
      <MobileBottomBar />
    </div>
  );
};

export default Dashboard;
