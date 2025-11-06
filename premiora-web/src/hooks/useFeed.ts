import { useState, useEffect, useCallback } from 'react';
import { ContentService } from '../services/contentService';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import type { ContentItem } from '../types/content';

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

  /**
   * Carrega conteúdo do feed do banco de dados
   * @param pageNum - Número da página
   * @param append - Se deve adicionar aos itens existentes
   */
  const loadFeedContent = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const { posts, hasMore: moreAvailable } = await ContentService.getFeedPosts(pageNum, 10, userId);

      // Converter posts/vídeos do banco para ContentItem
      const contentItems = posts.map(post => ContentService.transformToContentItem(post));

      // Inserir sugestões de usuários
      const contentWithSuggestions = ContentService.insertUserSuggestions(
        contentItems,
        append ? feedItems.length : 0
      );

      if (append) {
        setFeedItems(prev => [...prev, ...contentWithSuggestions]);
      } else {
        setFeedItems(contentWithSuggestions);
      }

      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      // Em caso de erro, manter itens existentes ou mostrar estado vazio
      if (!append) {
        setFeedItems([]);
      }
    }
  }, [userId, feedItems.length]);

  /**
   * Carrega mais conteúdo para scroll infinito
   */
  const loadMoreContent = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    loadFeedContent(nextPage, true)
      .then(() => {
        setPage(nextPage);
      })
      .catch((error) => {
        console.error('Erro ao carregar mais conteúdo:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loading, hasMore, page, loadFeedContent]);

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
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status);
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
    loadMoreContent,
    addNewPost,
    refreshFeed: () => loadFeedContent(1, false)
  };
};
