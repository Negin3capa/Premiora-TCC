import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook personalizado para gerenciar scroll infinito
 * Utiliza Intersection Observer API para detectar quando carregar mais conteúdo
 * Inclui debouncing, detecção de scroll rápido e funcionalidade manual de carregamento
 *
 * @param hasMore - Indica se há mais conteúdo para carregar
 * @param loading - Indica se está carregando conteúdo
 * @param onLoadMore - Callback executado quando deve carregar mais
 * @param threshold - Threshold do Intersection Observer (0-1)
 * @param debounceMs - Tempo de debouncing em milissegundos
 * @returns Objeto com ref para o elemento trigger e função manual de carregamento
 */
export const useInfiniteScroll = (
  hasMore: boolean,
  loading: boolean,
  onLoadMore: () => void,
  threshold: number = 0.1,
  debounceMs: number = 300
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const [manualLoading, setManualLoading] = useState(false);

  /**
   * Função debounced para carregar mais conteúdo
   * Previne múltiplas chamadas rápidas
   */
  const debouncedLoadMore = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTrigger = now - lastTriggerTimeRef.current;

    // Se já passou tempo suficiente desde o último trigger, executar imediatamente
    if (timeSinceLastTrigger >= debounceMs) {
      lastTriggerTimeRef.current = now;
      // Remover verificação de hasMore aqui - deixar para loadMoreContent
      if (!loading && !manualLoading) {
        onLoadMore();
      }
      return;
    }

    // Caso contrário, agendar para executar após o tempo restante
    const remainingTime = debounceMs - timeSinceLastTrigger;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      lastTriggerTimeRef.current = Date.now();
      // Remover verificação de hasMore aqui - deixar para loadMoreContent
      if (!loading && !manualLoading) {
        onLoadMore();
      }
    }, remainingTime);
  }, [loading, manualLoading, onLoadMore, debounceMs]);

  /**
   * Função para carregamento manual de conteúdo
   * Permite ao usuário forçar carregamento quando necessário
   */
  const loadMoreManually = useCallback(() => {
    if (hasMore && !loading && !manualLoading) {
      setManualLoading(true);
      try {
        onLoadMore();
      } finally {
        // Reset manual loading state after a short delay
        setTimeout(() => setManualLoading(false), 1000);
      }
    }
  }, [hasMore, loading, manualLoading, onLoadMore]);

  const loadMoreCallback = useCallback(() => {
    debouncedLoadMore();
  }, [debouncedLoadMore]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          // Adicionar verificação adicional para scroll rápido
          // Se o elemento ficou visível por muito pouco tempo, pode ter sido scroll rápido
          const now = Date.now();
          const timeVisible = now - lastTriggerTimeRef.current;

          // Só trigger se não foi um scroll muito rápido (mais de 50ms visível)
          // ou se é a primeira vez
          if (timeVisible > 50 || lastTriggerTimeRef.current === 0) {
            loadMoreCallback();
          }
        }
      },
      {
        threshold,
        // Adicionar rootMargin para detectar elementos antes de ficarem totalmente visíveis
        rootMargin: '100px'
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);

      // Check if element is already visible after setting up observer
      // Only trigger for short content (no scrolling needed) to avoid unnecessary loads
      setTimeout(() => {
        if (loadMoreRef.current && hasMore && !loading && !manualLoading) {
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [loadMoreCallback, threshold, hasMore, loading, manualLoading]);

  return {
    loadMoreRef,
    loadMoreManually,
    isManualLoading: manualLoading
  };
};
