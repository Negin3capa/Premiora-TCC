import React, { Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeed } from '../hooks/useFeed';
import { useSearch } from '../hooks/useSearch';
import { Sidebar } from '../components/layout';
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
 * Página principal da aplicação Premiora
 * Exibe o feed de conteúdo com funcionalidades de busca e scroll infinito
 *
 * @component
 */
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { feedItems, loading, hasMore, loadMoreContent } = useFeed();
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(feedItems);

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
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
    </div>
  );
};

export default HomePage;
