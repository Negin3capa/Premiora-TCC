import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook personalizado para gerenciar scroll infinito no estilo Twitter/X
 * Utiliza Intersection Observer API com prefetch de 200px e loading lock
 * Implementa cursor-based pagination sem debouncing
 *
 * @param hasMore - Indica se há mais conteúdo para carregar
 * @param loading - Indica se está carregando conteúdo
 * @param onLoadMore - Callback executado quando deve carregar mais
 * @returns Objeto com ref para o elemento sentinel
 */
export const useInfiniteScroll = (
  hasMore: boolean,
  loading: boolean,
  onLoadMore: () => void
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [showLoadingRow, setShowLoadingRow] = useState(false);

  /**
   * Callback do Intersection Observer - Twitter style
   * Trigger imediato quando sentinel entra na viewport
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];

    if (entry.isIntersecting && hasMore && !loading) {
      setShowLoadingRow(true);
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    // Cleanup observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Criar novo observer com configurações Twitter/X
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px', // Prefetch 200px antes do elemento ficar visível
      threshold: 0 // Trigger quando qualquer parte entra na viewport
    });

    // Observar o sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Cleanup quando hasMore se torna false (fim do feed)
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, hasMore]); // Re-criar observer quando hasMore muda

  return {
    sentinelRef,
    showLoadingRow,
    setShowLoadingRow
  };
};
