import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentService } from '../services/contentService';
import { FollowService } from '../services/followService';
import { FeedService } from '../services/content/FeedService';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import type { ContentItem } from '../types/content';

/**
 * Hook personalizado para gerenciar o feed dos usuários seguidos
 * Mostra o mesmo conteúdo do feed geral, mas filtrado apenas para posts de usuários seguidos
 */
export const useFollowingFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const hasMoreRef = useRef(true); // Ref to track current hasMore state
  const loadingRef = useRef(false); // Loading lock to prevent duplicate fetches

  const ITEMS_PER_PAGE = 20;

  /**
   * Carrega IDs dos usuários seguidos
   */
  const loadFollowingIds = useCallback(async () => {
    if (!user?.id) {
      setFollowingIds([]);
      return;
    }

    try {
      const ids = await FollowService.getFollowing(user.id);
      setFollowingIds(ids);
    } catch (error) {
      console.error('Erro ao carregar IDs dos usuários seguidos:', error);
      setFollowingIds([]);
    }
  }, [user?.id]);

  /**
   * Carrega conteúdo do feed geral e filtra apenas posts de usuários seguidos
   * @param append - Se deve adicionar aos itens existentes
   * @param isRetry - Se é uma tentativa de retry
   */
  const loadFollowingContent = useCallback(async (append: boolean = false, isRetry: boolean = false) => {
    // Só carregar se o usuário estiver logado
    if (!user?.id) {
      setFeedItems([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches with loading lock
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      // Limpar erro anterior se não for retry
      if (!isRetry) {
        setError(null);
      }

      const currentCursor = append ? nextCursor : null;

      // Buscar conteúdo do feed geral usando FeedService
      const { posts, nextCursor: newCursor, hasMore: moreAvailable } = await FeedService.getFeedPostsCursor(
        currentCursor,
        ITEMS_PER_PAGE,
        user.id
      );

      // Filtrar apenas posts de usuários seguidos
      const filteredPosts = posts.filter(post => {
        // Para posts, verificar se o creator_id está na lista de seguidos
        if (post.contentType === 'post') {
          return followingIds.includes(post.creator_id);
        }
        // Para vídeos, verificar se o creator_id está na lista de seguidos
        if (post.contentType === 'video') {
          return followingIds.includes(post.creator_id || post.creator?.id);
        }
        return false;
      });

      // Converter posts do banco para ContentItem
      const contentItems = filteredPosts.map(post => ContentService.transformToContentItem(post));

      // Atualizar estado
      if (append) {
        setFeedItems(prev => [...prev, ...contentItems]);
      } else {
        setFeedItems(contentItems);
      }

      setNextCursor(newCursor || null);
      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
      setError(null); // Limpar erro em caso de sucesso

      if (isRetry) {
        setRetryCount(0); // Resetar contador de retry em caso de sucesso
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar feed dos seguidos';
      console.error('❌ Erro ao carregar feed dos seguidos:', err);

      setError(errorMessage);

      // Em caso de erro, manter itens existentes ou mostrar estado vazio
      if (!append) {
        setFeedItems([]);
        setNextCursor(null);
      }

      // Incrementar contador de retry se for uma tentativa de carregamento normal
      if (!isRetry) {
        setRetryCount(prev => prev + 1);
      }

      throw err; // Re-throw para que o chamador possa lidar com o erro
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id, nextCursor, followingIds]);

  /**
   * Carrega mais conteúdo para scroll infinito
   * Inclui proteção contra race conditions e tratamento de erros
   */
  const loadMoreContent = useCallback(async () => {
    // Proteção contra múltiplas chamadas simultâneas usando ref para hasMore
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    setLoading(true);

    try {
      await loadFollowingContent(true);
    } catch (error) {
      console.error('Erro ao carregar mais conteúdo dos seguidos:', error);
      // Em caso de erro, não avançar o offset para permitir retry
      // O estado de loading será resetado no finally
    } finally {
      setLoading(false);
    }
  }, [loadFollowingContent]);

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
      await loadFollowingContent(false, true);
    } catch (error) {
      console.error('Erro no retry do feed dos seguidos:', error);
    } finally {
      setLoading(false);
    }
  }, [retryCount, loadFollowingContent]);

  /**
   * Atualiza o feed quando um novo post é criado por alguém que o usuário segue
   * @param newPost - Novos dados do post
   */
  const addNewPost = useCallback(async (newPost: any) => {
    // Verificar se o criador do post é alguém que o usuário segue
    if (!user?.id || !newPost.user_id) {
      return;
    }

    try {
      const isFollowing = await FollowService.isFollowing(user.id, newPost.user_id);
      if (!isFollowing) {
        return; // Não adicionar se não está seguindo
      }

      const newContentItem = ContentService.transformPostToContentItem(newPost);

      setFeedItems(prev => {
        // Verificar se o post já existe no feed para evitar duplicatas
        const postExists = prev.some(item => item.id === newContentItem.id);
        if (postExists) {
          console.log('Post já existe no feed dos seguidos, ignorando duplicata:', newContentItem.id);
          return prev; // Retornar estado atual sem modificações
        }

        return [newContentItem, ...prev];
      });
    } catch (error) {
      console.error('Erro ao verificar se usuário segue o criador:', error);
    }
  }, [user?.id]);

  // Carrega IDs dos usuários seguidos quando o usuário muda
  useEffect(() => {
    loadFollowingIds();
  }, [loadFollowingIds]);

  // Carrega conteúdo inicial quando o usuário ou IDs dos seguidos mudam
  useEffect(() => {
    if (user?.id && followingIds.length >= 0) { // >= 0 porque pode ser uma lista vazia
      setLoading(true);
      loadFollowingContent(false).finally(() => {
        setLoading(false);
      });
    } else {
      // Limpar feed se usuário não estiver logado
      setFeedItems([]);
      setHasMore(false);
      setNextCursor(null);
      setError(null);
    }
  }, [user?.id, followingIds]); // Removido loadFollowingContent da dependência para evitar recriação desnecessária

  // Configurar real-time subscriptions para novos posts dos usuários seguidos
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    console.log('Configurando real-time subscription para posts dos seguidos...');

    // Inscrever-se para novos posts publicados
    const postsSubscription = supabase
      .channel('following_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'is_published=eq.true'
        },
        async (payload) => {
          console.log('🎉 Novo post detectado:', payload.new);

          // Verificar se é de alguém que o usuário segue antes de adicionar
          await addNewPost(payload.new);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Subscription dos seguidos bem-sucedida');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('📡 Erro na subscription dos seguidos (esperado em desenvolvimento):', err);
        } else if (status === 'CLOSED') {
          console.log('📡 Subscription dos seguidos fechada');
        } else {
          console.log('📡 Status da subscription dos seguidos:', status);
        }
      });

    // Cleanup da subscription quando o componente desmontar
    return () => {
      console.log('🧹 Limpando subscription dos posts seguidos...');
      postsSubscription.unsubscribe();
    };
  }, [user?.id, addNewPost]);

  return {
    feedItems,
    loading,
    hasMore,
    error,
    loadMoreContent,
    addNewPost,
    refreshFeed: () => loadFollowingContent(false),
    retryLoadContent,
    canRetry: retryCount < 3 && error !== null
  };
};
