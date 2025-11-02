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
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreCallback, threshold]);

  return loadMoreRef;
};
