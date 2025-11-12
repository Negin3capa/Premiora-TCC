import React, { useState } from 'react';
import ContentCard from '../ContentCard';
import UserSuggestions from './UserSuggestions';
import SidebarFeed from './SidebarFeed';
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
  // Props para abas (controladas pelo header)
  activeTab?: 'forYou' | 'following';
  followingItems?: ContentItem[];
  followingLoading?: boolean;
  followingHasMore?: boolean;
  followingError?: string | null;
  onFollowingLoadMore?: () => void;
  onFollowingRetry?: () => void;
  followingCanRetry?: boolean;
  // Controla se deve mostrar a sidebar do feed
  showSidebar?: boolean;
}

/**
 * Componente Feed que exibe lista de conteúdo com scroll infinito no estilo Twitter/X
 * Implementa cursor-based pagination com loading row e sentinel detection
 * Suporte a abas "For You" e "Following" para feed personalizado
 *
 * @component
 */
const Feed: React.FC<FeedProps> = ({
  items,
  loading,
  hasMore,
  error,
  onLoadMore,
  onRetry,
  canRetry,
  activeTab = 'forYou',
  followingItems = [],
  followingLoading = false,
  followingHasMore = false,
  followingError,
  onFollowingLoadMore,
  onFollowingRetry,
  followingCanRetry,
  showSidebar = true
}) => {
  // Estado para controlar qual aba está ativa
  const [currentTab, setCurrentTab] = useState<'forYou' | 'following'>(activeTab);

  // Hook de scroll infinito para a aba ativa
  const currentItems = currentTab === 'forYou' ? items : followingItems;
  const currentLoading = currentTab === 'forYou' ? loading : followingLoading;
  const currentHasMore = currentTab === 'forYou' ? hasMore : followingHasMore;
  const currentError = currentTab === 'forYou' ? error : followingError;
  const currentOnLoadMore = currentTab === 'forYou' ? onLoadMore : onFollowingLoadMore;
  const currentOnRetry = currentTab === 'forYou' ? onRetry : onFollowingRetry;
  const currentCanRetry = currentTab === 'forYou' ? canRetry : followingCanRetry;

  console.log('📊 [Feed] Current tab state:', {
    currentTab,
    currentItemsCount: currentItems.length,
    currentLoading,
    currentHasMore,
    currentError: !!currentError,
    hasOnLoadMore: !!currentOnLoadMore,
    timestamp: new Date().toISOString()
  });

  const { sentinelRef, showLoadingRow, setShowLoadingRow } = useInfiniteScroll(
    currentHasMore,
    currentLoading,
    currentOnLoadMore || (() => {})
  );

  // Reset loading row quando loading termina
  React.useEffect(() => {
    if (!currentLoading && showLoadingRow) {
      setShowLoadingRow(false);
    }
  }, [currentLoading, showLoadingRow, setShowLoadingRow]);

  // Atualizar aba ativa quando prop muda
  React.useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  return (
    <main className="feed">
      <div className={`feed-layout ${!showSidebar ? 'feed-layout--full-width' : ''}`}>
        {/* Conteúdo principal */}
        <div className="feed-main">
          <div className={`feed-content ${!showSidebar ? 'feed-content--full-width' : ''}`}>
            {currentItems.length === 0 && !currentLoading ? (
              <div className="empty-state">
                <p>
                  {currentTab === 'following'
                    ? 'Nenhum post dos usuários seguidos encontrado. Comece seguindo alguns usuários!'
                    : 'Nenhum conteúdo encontrado'
                  }
                </p>
              </div>
            ) : (
              <div className="content-grid">
                {currentItems.map((item) => {
                  // Gerar chave única baseada na aba atual para evitar conflitos
                  const uniqueKey = `${currentTab}-${item.id}`;

                  // Renderizar sugestões de usuário para itens do tipo profile
                  if (item.type === 'profile') {
                    return (
                      <div key={uniqueKey} className="user-suggestions-wrapper">
                        <UserSuggestions />
                      </div>
                    );
                  }
                  // Renderizar ContentCard para outros tipos
                  return <ContentCard key={uniqueKey} item={item} />;
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
            {currentError && (
              <div className="feed-error-state">
                <div className="error-message">
                  <p>Erro ao carregar conteúdo: {currentError}</p>
                  {currentCanRetry && currentOnRetry && (
                    <button
                      onClick={currentOnRetry}
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
        </div>

        {/* Sidebar - conditionally rendered */}
        {showSidebar && <SidebarFeed />}
      </div>
    </main>
  );
};

export default Feed;
