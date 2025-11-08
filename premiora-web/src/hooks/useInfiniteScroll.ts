import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar scroll infinito
 * Utiliza Intersection Observer API para detectar quando carregar mais conteúdo
 *
 * @param hasMore - Indica se há mais conteúdo para carregar
 * @param loading - Indica se está carregando conteúdo
 * @param onLoadMore - Callback executado quando deve carregar mais
 * @param threshold - Threshold do Intersection Observer (0-1)
 * @returns Ref para o elemento trigger de carregamento
 */
export const useInfiniteScroll = (
  hasMore: boolean,
  loading: boolean,
  onLoadMore: () => void,
  threshold: number = 0.1
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCallback = useCallback(() => {
    if (hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreCallback();
        }
      },
      { threshold }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);

      // Check if element is already visible after setting up observer
      // Only trigger for short content (no scrolling needed) to avoid unnecessary loads
      setTimeout(() => {
        if (loadMoreRef.current && hasMore && !loading) {
          const rect = loadMoreRef.current.getBoundingClientRect();
          // Only trigger initial load if content is short (no scrolling needed)
          // For long content, rely on scroll-triggered intersection
          const contentIsShort = document.documentElement.scrollHeight <= window.innerHeight;
          const elementIsVisible = rect.top <= window.innerHeight + 50 && rect.bottom >= -50;

          if (contentIsShort && elementIsVisible) {
            loadMoreCallback();
          }
        }
      }, 100);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreCallback, threshold, hasMore, loading]);

  return loadMoreRef;
};
