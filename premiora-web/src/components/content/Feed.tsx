import React from 'react';
import ContentCard from './ContentCard';
import UserSuggestions from './UserSuggestions';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { ContentItem } from '../../types/content';

interface FeedProps {
  items: ContentItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * Componente Feed que exibe lista de conteúdo com scroll infinito
 * Gerencia renderização de diferentes tipos de conteúdo e carregamento lazy
 *
 * @component
 */
const Feed: React.FC<FeedProps> = ({ items, loading, hasMore, onLoadMore }) => {
  const loadMoreRef = useInfiniteScroll(hasMore, loading, onLoadMore);

  return (
    <main className="feed">
      <div className="feed-content">
        {items.length === 0 && !loading ? (
          <div className="empty-state">
            <p>Nenhum conteúdo encontrado</p>
          </div>
        ) : (
          <div className="content-grid">
            {items.map((item) => {
              // Renderizar sugestões de usuário para itens do tipo profile
              if (item.type === 'profile') {
                return (
                  <div key={item.id} className="user-suggestions-wrapper">
                    <UserSuggestions suggestions={[]} />
                  </div>
                );
              }
              // Renderizar ContentCard para outros tipos
              return <ContentCard key={item.id} item={item} />;
            })}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando mais conteúdo...</p>
          </div>
        )}

        <div ref={loadMoreRef} className="load-more-trigger" />
      </div>
    </main>
  );
};

export default Feed;
