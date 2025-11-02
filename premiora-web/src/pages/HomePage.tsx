import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeed } from '../hooks/useFeed';
import { useSearch } from '../hooks/useSearch';
import { Sidebar, Header } from '../components/layout';
import Feed from '../components/content/Feed';
import '../styles/HomePage.css';

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
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />
        <Feed
          items={filteredItems}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMoreContent}
        />
      </div>
    </div>
  );
};

export default HomePage;
