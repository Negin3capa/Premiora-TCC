import React from 'react';
import ContentCard from '../ContentCard';
import UserSuggestions from './UserSuggestions';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { ContentItem } from '../../types/content';

interface FeedProps {
  items: ContentItem[];
  loading: boolean;
  hasMore: boolean;
  error?: string | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
}

/**
 * Componente Feed que exibe lista de conteúdo com scroll infinito
 * Gerencia renderização de diferentes tipos de conteúdo e carregamento lazy
 * Inclui funcionalidade manual de carregamento quando o automático falha
 *
 * @component
 */
const Feed: React.FC<FeedProps> = ({ items, loading, hasMore, error, onLoadMore, onRetry, canRetry }) => {
  const { loadMoreRef, loadMoreManually, isManualLoading } = useInfiniteScroll(hasMore, loading, onLoadMore);

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

        {/* Botão manual de carregamento quando há mais conteúdo disponível */}
        {hasMore && !loading && !isManualLoading && (
          <div className="load-more-manual">
            <button
              onClick={loadMoreManually}
              className="load-more-button"
              aria-label="Carregar mais conteúdo"
            >
              Carregar mais conteúdo
            </button>
          </div>
        )}

        {/* Estado de carregamento manual */}
        {isManualLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        )}

        {/* Estado de erro com opção de retry */}
        {error && (
          <div className="error-state">
            <div className="error-message">
              <p>Erro ao carregar conteúdo: {error}</p>
              {canRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="retry-button"
                  aria-label="Tentar novamente"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={loadMoreRef} className="load-more-trigger" />
      </div>
    </main>
  );
};

export default Feed;
