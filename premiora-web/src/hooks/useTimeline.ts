/**
 * Hook personalizado para gerenciar timeline com recursos avançados
 * Suporte a paginação por cursor, posts otimistas, notificações em tempo real e virtualização
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import { FeedService } from '../services/content/FeedService';
import { ContentTransformer } from '../services/content/ContentTransformer';
import { PostService } from '../services/content/PostService';
import type { ContentItem } from '../types/content';

export interface TimelineState {
  items: (ContentItem | OptimisticPost)[];
  cursors: { [page: number]: string };
  pendingNewPosts: ContentItem[];
  pendingNewPostsCount: number;
  isAtTop: boolean;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
}

export interface OptimisticPost {
  id: string;
  content: string;
  title?: string;
  author: string;
  authorUsername: string;
  authorAvatar: string;
  timestamp: string;
  isOptimistic: true;
  communityId?: string;
  communityName?: string;
  communityDisplayName?: string;
  communityAvatar?: string;
}

/**
 * Hook para gerenciar timeline com recursos avançados
 * @returns Interface completa para interação com a timeline
 */
export const useTimeline = () => {
  const { user, userProfile } = useAuth();
  const { socket, send: sendWebSocket } = useWebSocket();

  const [state, setState] = useState<TimelineState>({
    items: [],
    cursors: {},
    pendingNewPosts: [],
    pendingNewPostsCount: 0,
    isAtTop: true,
    loading: false,
    hasMore: true,
    error: null
  });

  // Refs para controle de scroll e deduplicação
  const scrollPositionRef = useRef({ top: 0, isAtTop: true });
  const processedIdsRef = useRef(new Set<string>());
  const optimisticIdsRef = useRef(new Map<string, string>()); // tempId -> serverId

  /**
   * Gera ID único para posts otimistas
   */
  const generateOptimisticId = useCallback(() => {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Cria objeto de post otimista
   */
  const createOptimisticPost = useCallback((
    postData: { title?: string; content: string; communityId?: string },
    tempId: string
  ): OptimisticPost => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    return {
      id: tempId,
      content: postData.content,
      title: postData.title,
      author: userProfile.name || userProfile.username || 'Usuário',
      authorUsername: userProfile.username || userProfile.name || 'usuario',
      authorAvatar: userProfile.avatar_url || '',
      timestamp: new Date().toISOString(),
      isOptimistic: true,
      communityId: postData.communityId,
      // Community data será preenchido se necessário
    };
  }, [userProfile]);

  /**
   * Reconcilia post otimista com resposta do servidor
   */
  const reconcileOptimisticPost = useCallback((tempId: string, serverPost: any) => {
    const serverId = serverPost.id;
    optimisticIdsRef.current.set(tempId, serverId);

    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === tempId
          ? { ...ContentTransformer.transformToContentItem(serverPost), id: serverId }
          : item
      )
    }));

    // Remover da lista de processados para permitir o post real
    processedIdsRef.current.delete(tempId);
  }, []);

  /**
   * Trata erros de post otimista
   */
  const handleOptimisticError = useCallback((tempId: string, error: any) => {
    console.error('Erro no post otimista:', error);

    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== tempId),
      error: 'Falha ao publicar post. Tente novamente.'
    }));

    // TODO: Mostrar UI de erro com opções de retry/delete
  }, []);

  /**
   * Cria novo post com UI otimista
   */
  const createPost = useCallback(async (postData: { title?: string; content: string; communityId?: string }) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const tempId = generateOptimisticId();
    const optimisticPost = createOptimisticPost(postData, tempId);

    // Inserir post otimista no topo
    setState(prev => ({
      ...prev,
      items: [optimisticPost, ...prev.items],
      error: null
    }));

    try {
      // Enviar para o servidor
      const serverPost = await PostService.createPost({
        title: postData.title || '',
        content: postData.content,
        communityId: postData.communityId,
        images: [] // TODO: Suporte a imagens
      }, user.id);

      // Reconciliação bem-sucedida
      reconcileOptimisticPost(tempId, serverPost);

      // Broadcast para outros clientes via WebSocket (opcional, servidor já faz isso)
      if (socket) {
        sendWebSocket({
          type: 'post_created',
          payload: { post: serverPost }
        });
      }

    } catch (error) {
      handleOptimisticError(tempId, error);
    }
  }, [user, generateOptimisticId, createOptimisticPost, reconcileOptimisticPost, handleOptimisticError, socket, sendWebSocket]);

  /**
   * Carrega próxima página usando cursor
   */
  const loadNextPage = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const currentCursor = Object.values(state.cursors).pop(); // Último cursor
      const result = await FeedService.getFeedPostsCursor(currentCursor || null, 20, user?.id);

      const newItems = result.posts.map(ContentTransformer.transformToContentItem);

      // Filtrar duplicatas
      const uniqueNewItems = newItems.filter(item => {
        if (processedIdsRef.current.has(item.id)) return false;
        processedIdsRef.current.add(item.id);
        return true;
      });

      setState(prev => ({
        ...prev,
        items: [...prev.items, ...uniqueNewItems],
        cursors: {
          ...prev.cursors,
          [prev.items.length + uniqueNewItems.length]: result.nextCursor || ''
        },
        hasMore: result.hasMore,
        loading: false
      }));

    } catch (error) {
      console.error('Erro ao carregar próxima página:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Falha ao carregar mais posts'
      }));
    }
  }, [state.loading, state.hasMore, state.cursors, user?.id]);

  /**
   * Carrega posts pendentes (do toast)
   */
  const loadPendingPosts = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: [...prev.pendingNewPosts, ...prev.items],
      pendingNewPosts: [],
      pendingNewPostsCount: 0
    }));

    // TODO: Implementar scroll suave para o topo
  }, []);

  /**
   * Descarta posts pendentes
   */
  const dismissPendingPosts = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingNewPosts: [],
      pendingNewPostsCount: 0
    }));
  }, []);

  /**
   * Handler para eventos WebSocket
   */
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === 'new_posts') {
        const newPosts = message.payload.posts.map(ContentTransformer.transformToContentItem);

        // Filtrar duplicatas e posts otimistas já reconciliados
        const uniqueNewPosts = newPosts.filter((post: ContentItem) => {
          if (processedIdsRef.current.has(post.id)) return false;
          if (optimisticIdsRef.current.has(post.id)) return false;
          processedIdsRef.current.add(post.id);
          return true;
        });

        if (uniqueNewPosts.length === 0) return;

        setState(prev => {
          if (prev.isAtTop) {
            // Auto-prepend
            return {
              ...prev,
              items: [...uniqueNewPosts, ...prev.items],
              cursors: {
                ...prev.cursors,
                0: message.payload.first_cursor || prev.cursors[0]
              }
            };
          } else {
            // Mostrar toast
            return {
              ...prev,
              pendingNewPosts: [...prev.pendingNewPosts, ...uniqueNewPosts],
              pendingNewPostsCount: prev.pendingNewPostsCount + uniqueNewPosts.length
            };
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  }, []);

  /**
   * Atualiza posição de scroll
   */
  const updateScrollPosition = useCallback((scrollTop: number) => {
    const isAtTop = scrollTop < 100; // Considera "no topo" se scroll < 100px

    scrollPositionRef.current = { top: scrollTop, isAtTop };

    setState(prev => ({
      ...prev,
      isAtTop
    }));

    // Se voltou ao topo e há posts pendentes, carregar automaticamente
    if (isAtTop && state.pendingNewPostsCount > 0) {
      loadPendingPosts();
    }
  }, [state.pendingNewPostsCount, loadPendingPosts]);

  // Configurar WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.addEventListener('message', handleWebSocketMessage);

    // Subscribe para receber posts em tempo real
    sendWebSocket({
      type: 'subscribe',
      payload: {
        authToken: localStorage.getItem('authToken'),
        cursor: Object.values(state.cursors).pop() || null
      }
    });

    return () => {
      socket.removeEventListener('message', handleWebSocketMessage);
    };
  }, [socket, handleWebSocketMessage, sendWebSocket, state.cursors]);

  // Carregamento inicial
  useEffect(() => {
    if (user?.id && state.items.length === 0) {
      loadNextPage();
    }
  }, [user?.id, state.items.length, loadNextPage]);

  return {
    // Estado
    items: state.items,
    loading: state.loading,
    hasMore: state.hasMore,
    error: state.error,
    isAtTop: state.isAtTop,
    pendingNewPostsCount: state.pendingNewPostsCount,

    // Ações
    createPost,
    loadMore: loadNextPage,
    loadPendingPosts,
    dismissPendingPosts,
    updateScrollPosition,

    // Utilitários
    refresh: () => {
      setState(prev => ({ ...prev, items: [], cursors: {}, hasMore: true }));
      processedIdsRef.current.clear();
      optimisticIdsRef.current.clear();
      loadNextPage();
    }
  };
};
