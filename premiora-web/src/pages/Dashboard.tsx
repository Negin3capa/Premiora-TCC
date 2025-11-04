import React, { Suspense, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeed } from '../hooks/useFeed';
import { useSearch } from '../hooks/useSearch';
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
 * Página principal após login, exibe feed de conteúdo e informações do usuário
 *
 * @component
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { feedItems, loading, hasMore, loadMoreContent } = useFeed();
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(feedItems);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Handler para alternar visibilidade da sidebar em dispositivos móveis
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="homepage">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
            onToggleSidebar={toggleSidebar}
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
      <MobileBottomBar />
    </div>
  );
};

export default Dashboard;
