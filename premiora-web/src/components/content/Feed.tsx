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
 * Componente Feed que exibe lista de conteúdo com scroll infinito no estilo Twitter/X
 * Implementa cursor-based pagination com loading row e sentinel detection
 * Remove carregamento manual - segue padrão Twitter sem botões manuais
 *
 * @component
 */
const Feed: React.FC<FeedProps> = ({ items, loading, hasMore, error, onLoadMore, onRetry, canRetry }) => {
  const { sentinelRef, showLoadingRow, setShowLoadingRow } = useInfiniteScroll(hasMore, loading, onLoadMore);

  // Reset loading row quando loading termina
  React.useEffect(() => {
    if (!loading && showLoadingRow) {
      setShowLoadingRow(false);
    }
  }, [loading, showLoadingRow, setShowLoadingRow]);

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

        {/* Loading row - Twitter style */}
        {showLoadingRow && (
          <div className="feed-loading-row">
            <div className="spinner"></div>
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

        {/* Bottom sentinel for infinite scroll */}
        <div ref={sentinelRef} className="bottom-sentinel" />
      </div>
    </main>
  );
};

export default Feed;
