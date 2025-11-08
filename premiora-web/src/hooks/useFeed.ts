import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentService } from '../services/contentService';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import type { ContentItem } from '../types/content';

// Cache global para prefetch - acessível via window
declare global {
  interface Window {
    ProfilePrefetchCache?: {
      getInstance(): {
        getCachedFeed(): any[] | null;
        getCachedProfile(username: string): {
          profile: import('../types/profile').CreatorProfile | null;
          posts: import('../types/profile').Post[];
          featuredPost: import('../types/profile').Post | null;
        } | null;
      };
    };
  }
}

/**
 * Hook personalizado para gerenciar estado e lógica do feed
 * Centraliza toda a lógica relacionada ao feed de conteúdo
 */
export const useFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasMoreRef = useRef(true); // Ref to track current hasMore state

  /**
   * Carrega conteúdo do feed do banco de dados
   * @param pageNum - Número da página
   * @param append - Se deve adicionar aos itens existentes
   * @param isRetry - Se é uma tentativa de retry
   */
  const loadFeedContent = useCallback(async (pageNum: number, append: boolean = false, isRetry: boolean = false) => {
    try {
      // Limpar erro anterior se não for retry
      if (!isRetry) {
        setError(null);
      }

      // Verificar se há dados em cache para a primeira página
      if (pageNum === 1 && !append) {
        const cachedFeed = window.ProfilePrefetchCache?.getInstance().getCachedFeed();
        if (cachedFeed && cachedFeed.length > 0) {
          setFeedItems(cachedFeed);
          setHasMore(true); // Assumir que há mais conteúdo se temos cache
          setError(null); // Limpar qualquer erro anterior
          return;
        }
      }

      const { posts, hasMore: moreAvailable } = await ContentService.getFeedPosts(pageNum, 10, userId);

      // Converter posts/vídeos do banco para ContentItem
      const contentItems = posts.map(post => ContentService.transformToContentItem(post));

      // Inserir sugestões de usuários e atualizar estado
      if (append) {
        setFeedItems(prev => {
          const startIndex = prev.length;
          const contentWithSuggestions = ContentService.insertUserSuggestions(
            contentItems,
            startIndex
          );

          const newItems = [...prev, ...contentWithSuggestions];
          return newItems;
        });
      } else {
        const contentWithSuggestions = ContentService.insertUserSuggestions(
          contentItems,
          0
        );
        setFeedItems(contentWithSuggestions);
      }

      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable; // Update ref
      setError(null); // Limpar erro em caso de sucesso
      if (isRetry) {
        setRetryCount(0); // Resetar contador de retry em caso de sucesso
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar feed';
      console.error('❌ Erro ao carregar feed:', err);

      setError(errorMessage);

      // Em caso de erro, manter itens existentes ou mostrar estado vazio
      if (!append) {
        setFeedItems([]);
      }

      // Incrementar contador de retry se for uma tentativa de carregamento normal
      if (!isRetry) {
        setRetryCount(prev => prev + 1);
      }

      throw err; // Re-throw para que o chamador possa lidar com o erro
    }
  }, [userId]); // Removido feedItems.length da dependência para evitar recriação desnecessária

  /**
   * Carrega mais conteúdo para scroll infinito
   * Inclui proteção contra race conditions e tratamento de erros
   */
  const loadMoreContent = useCallback(async () => {
    // Proteção contra múltiplas chamadas simultâneas usando ref para hasMore
    if (loading || !hasMoreRef.current) {
      return;
    }

    setLoading(true);
    const nextPage = page + 1;

    try {
      await loadFeedContent(nextPage, true);
      setPage(nextPage);
    } catch (error) {
      console.error('Erro ao carregar mais conteúdo:', error);
      // Em caso de erro, não avançar a página para permitir retry
      // O estado de loading será resetado no finally
    } finally {
      setLoading(false);
    }
  }, [loading, page, loadFeedContent]);

  /**
   * Tenta recarregar o conteúdo em caso de erro
   * Limita o número de tentativas para evitar loops infinitos
   */
  const retryLoadContent = useCallback(async () => {
    if (retryCount >= 3) {
      return;
    }

    setLoading(true);

    try {
      await loadFeedContent(page, false, true);
    } catch (error) {
      console.error('Erro no retry:', error);
    } finally {
      setLoading(false);
    }
  }, [retryCount, page, loadFeedContent]);

  /**
   * Atualiza o feed quando um novo post é criado
   * @param newPost - Novos dados do post
   */
  const addNewPost = useCallback((newPost: any) => {
    const newContentItem = ContentService.transformPostToContentItem(newPost);

    setFeedItems(prev => {
      // Remover sugestões e inserir o novo post no início
      const filteredItems = prev.filter(item => item.type !== 'profile');
      const itemsWithNewPost = [newContentItem, ...filteredItems];

      // Re-inserir sugestões
      return ContentService.insertUserSuggestions(itemsWithNewPost, 0);
    });
  }, []);

  // Carrega conteúdo inicial
  useEffect(() => {
    setLoading(true);
    loadFeedContent(1, false).finally(() => {
      setLoading(false);
    });
  }, [loadFeedContent]);

  // Atualizar userId quando disponível do contexto de auth
  useEffect(() => {
    setUserId(user?.id);
  }, [user?.id]);

  // Configurar real-time subscriptions para novos posts
  useEffect(() => {
    console.log('Configurando real-time subscription para posts...');

    // Inscrever-se para novos posts publicados
    const postsSubscription = supabase
      .channel('posts_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          console.log('🎉 Novo post detectado via real-time:', payload.new);

          // Sempre adicionar novos posts ao feed, independente do criador
          // (posts próprios também devem aparecer)
          addNewPost(payload.new);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Subscription bem-sucedida');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('📡 Erro na subscription (esperado em desenvolvimento):', err);
        } else if (status === 'CLOSED') {
          console.log('📡 Subscription fechada');
        } else {
          console.log('📡 Status da subscription:', status);
        }
      });

    // Cleanup da subscription quando o componente desmontar
    return () => {
      console.log('🧹 Limpando subscription de posts...');
      postsSubscription.unsubscribe();
    };
  }, [addNewPost]); // Removido userId da dependência para evitar re-subscription desnecessária

  return {
    feedItems,
    loading,
    hasMore,
    error,
    loadMoreContent,
    addNewPost,
    refreshFeed: () => loadFeedContent(1, false),
    retryLoadContent,
    canRetry: retryCount < 3 && error !== null
  };
};
