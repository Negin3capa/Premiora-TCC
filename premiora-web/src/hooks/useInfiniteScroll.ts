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
  const hasCheckedInitialVisibility = useRef(false);



  /**
   * Callback do Intersection Observer - Twitter style
   * Trigger imediato quando sentinel entra na viewport
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];

    console.log('🔍 [useInfiniteScroll] Intersection event:', {
      isIntersecting: entry.isIntersecting,
      hasMore,
      loading,
      sentinelExists: !!sentinelRef.current,
      timestamp: new Date().toISOString()
    });

    if (entry.isIntersecting && hasMore && !loading) {
      console.log('🚀 [useInfiniteScroll] Triggering load more');
      setShowLoadingRow(true);
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);



  useEffect(() => {
    // Não configurar observer se sentinel não existe ainda
    if (!sentinelRef.current) {
      return;
    }

    // Reset the initial visibility check flag when creating new observer
    hasCheckedInitialVisibility.current = false;

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
    observerRef.current.observe(sentinelRef.current);

    // Forçar uma verificação inicial apenas uma vez por observer
    // Isso garante que o observer funcione mesmo se o sentinel já estiver visível no momento da criação
    if (!hasCheckedInitialVisibility.current) {
      hasCheckedInitialVisibility.current = true;

      setTimeout(() => {
        if (observerRef.current && sentinelRef.current && !hasCheckedInitialVisibility.current) {
          const entries = observerRef.current.takeRecords();
          if (entries.length > 0) {
            handleIntersection(entries);
          }
          // Não fazer verificação manual - deixar o Intersection Observer trabalhar normalmente
        }
      }, 100);
    }

    // Cleanup quando hasMore se torna false (fim do feed)
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, hasMore]); // Re-criar observer quando hasMore muda

  // Efeito separado para observar mudanças no sentinel element
  useEffect(() => {
    if (sentinelRef.current && observerRef.current && hasMore) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [sentinelRef.current, hasMore]);

  return {
    sentinelRef,
    showLoadingRow,
    setShowLoadingRow
  };
};
