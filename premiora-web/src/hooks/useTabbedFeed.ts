import { useState, useCallback } from 'react';
import { useFeed } from './useFeed';
import { useFollowingFeed } from './useFollowingFeed';

/**
 * Hook personalizado que combina os feeds "For You" e "Following"
 * Gerencia a alternância entre abas e fornece uma interface unificada
 */
export const useTabbedFeed = () => {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');

  // Hooks para cada tipo de feed
  const forYouFeed = useFeed();
  const followingFeed = useFollowingFeed();

  // Handler para mudança de aba
  const handleTabChange = useCallback((tab: 'forYou' | 'following') => {
    setActiveTab(tab);
  }, []);

  // Retornar dados da aba ativa
  const activeFeed = activeTab === 'forYou' ? forYouFeed : followingFeed;

  return {
    // Estado da aba ativa
    activeTab,
    feedItems: activeFeed.feedItems,
    loading: activeFeed.loading,
    hasMore: activeFeed.hasMore,
    error: activeFeed.error,
    loadMoreContent: activeFeed.loadMoreContent,
    retryLoadContent: activeFeed.retryLoadContent,
    canRetry: activeFeed.canRetry,
    refreshFeed: activeFeed.refreshFeed,

    // Dados de ambas as abas (para componentes que precisam acessar diretamente)
    forYouFeed,
    followingFeed,

    // Controle de abas
    handleTabChange,

    // Utilitários
    addNewPost: (post: any) => {
      // Adicionar post a ambos os feeds
      forYouFeed.addNewPost(post);
      followingFeed.addNewPost(post);
    }
  };
};
