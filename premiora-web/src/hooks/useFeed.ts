import { useState, useEffect, useCallback } from 'react';
import type { ContentItem } from '../types/content';

/**
 * Hook personalizado para gerenciar estado e lógica do feed
 * Centraliza toda a lógica relacionada ao feed de conteúdo
 */
export const useFeed = () => {
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  /**
   * Gera dados mock de conteúdo para desenvolvimento
   * @param startIndex - Índice inicial para geração
   * @param count - Número de itens a gerar
   * @returns Array de itens de conteúdo mock
   */
  const generateMockContent = useCallback((startIndex: number, count: number): ContentItem[] => {
    const types: ContentItem['type'][] = ['video', 'post'];
    const accessLevels: ContentItem['accessLevel'][] = ['public', 'supporters', 'premium'];

    // Array de avatares reais do Unsplash
    const avatarUrls = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face&auto=format'
    ];

    // Array de thumbnails reais para posts e vídeos
    const thumbnailUrls = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1464822759844-d150f38d609b?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&h=200&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&auto=format'
    ];

    const mockItems: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const type = types[Math.floor(Math.random() * types.length)];
      const accessLevel = type === 'post' ? accessLevels[Math.floor(Math.random() * accessLevels.length)] : undefined;

      const baseContent = type === 'post'
        ? `Este é um conteúdo de exemplo ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        : undefined;

      mockItems.push({
        id: `item-${index}`,
        type,
        title: type === 'profile' ? `Criador ${index}` : `${type.charAt(0).toUpperCase() + type.slice(1)} ${index}`,
        author: `Usuário ${index}`,
        authorAvatar: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
        thumbnail: type !== 'profile' ? thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)] : undefined,
        content: baseContent,
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        timestamp: `${Math.floor(Math.random() * 24)}h atrás`,
        accessLevel,
        isLocked: accessLevel !== 'public' && Math.random() > 0.5,
        previewContent: accessLevel !== 'public'
          ? `Este é um preview do conteúdo exclusivo ${index}. Veja apenas uma parte...`
          : undefined,
        requiredTier: accessLevel === 'supporters' ? 'Apoiadores' : accessLevel === 'premium' ? 'Premium' : undefined,
        fullContent: accessLevel !== 'public'
          ? `${baseContent}\n\nConteúdo completo exclusivo para ${accessLevel === 'supporters' ? 'apoiadores' : 'assinantes premium'}! Este é o conteúdo adicional que só membros podem ver. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
          : undefined
      });
    }

    return mockItems;
  }, []);

  /**
   * Insere sugestões de usuários em intervalos controlados no feed
   * @param items - Itens do feed
   * @param startIndex - Índice inicial
   * @returns Array com sugestões inseridas
   */
  const insertUserSuggestions = useCallback((items: ContentItem[], startIndex: number): ContentItem[] => {
    const result: ContentItem[] = [];
    const suggestionInterval = 5; // Inserir sugestão a cada 5 posts

    for (let i = 0; i < items.length; i++) {
      result.push(items[i]);

      // Inserir sugestão após cada 5 posts, mas nunca consecutivamente
      if ((startIndex + i + 1) % suggestionInterval === 0) {
        const lastItem = result[result.length - 1];
        if (lastItem && lastItem.type !== 'profile') {
          const suggestionIndex = Math.floor((startIndex + i + 1) / suggestionInterval);
          result.push({
            id: `suggestion-${suggestionIndex}`,
            type: 'profile',
            title: `Sugestões para você ${suggestionIndex}`,
            author: '',
            authorAvatar: '',
            views: 0,
            likes: 0,
            timestamp: ''
          });
        }
      }
    }

    return result;
  }, []);

  /**
   * Carrega mais conteúdo para scroll infinito
   */
  const loadMoreContent = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const newContent = generateMockContent(feedItems.length, 10);
      const contentWithSuggestions = insertUserSuggestions(newContent, feedItems.length);
      setFeedItems(prev => [...prev, ...contentWithSuggestions]);
      setPage(prev => prev + 1);

      // Simula fim do conteúdo após 5 páginas
      if (page >= 5) {
        setHasMore(false);
      }

      setLoading(false);
    }, 1000);
  }, [loading, hasMore, feedItems.length, page, generateMockContent, insertUserSuggestions]);

  // Carrega conteúdo inicial
  useEffect(() => {
    setLoading(true);
    const initialContent = generateMockContent(0, 10);
    const contentWithSuggestions = insertUserSuggestions(initialContent, 0);
    setFeedItems(contentWithSuggestions);
    setLoading(false);
  }, [generateMockContent, insertUserSuggestions]);

  return {
    feedItems,
    loading,
    hasMore,
    loadMoreContent
  };
};
