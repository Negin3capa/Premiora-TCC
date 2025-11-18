/**
 * Hook para gerenciamento de likes em posts
 * Fornece funcionalidade para dar/tirar likes e verificar estado
 */
import { useState, useCallback, useEffect } from 'react';
import { LikeService } from '../services/content/LikeService';
import { useAuth } from './useAuth';

interface UsePostLikeProps {
  postId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  currentLikeCount?: number; // Para sincronização com dados externos
}

interface UsePostLikeReturn {
  liked: boolean;
  likeCount: number;
  isLoading: boolean;
  error: string | null;
  toggleLike: () => Promise<void>;
  refreshLikeStatus: () => Promise<void>;
}

/**
 * Hook para gerenciar likes de um post específico
 * @param props - Propriedades do hook
 * @returns Estado e funções para manipular likes
 */
export const usePostLike = ({
  postId,
  initialLiked = false,
  initialLikeCount = 0,
  currentLikeCount
}: UsePostLikeProps): UsePostLikeReturn => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sincronizar contagem de likes com dados externos quando disponível
   */
  useEffect(() => {
    if (currentLikeCount !== undefined && !isLoading) {
      setLikeCount(currentLikeCount);
    }
  }, [currentLikeCount, isLoading]);

  /**
   * Atualiza o estado do like baseado no usuário atual
   */
  const refreshLikeStatus = useCallback(async () => {
    if (!user?.id || !postId) {
      setLiked(false);
      return;
    }

    try {
      setError(null);
      const hasLiked = await LikeService.hasUserLiked(postId, user.id);
      setLiked(hasLiked);
    } catch (err) {
      console.error('Erro ao verificar status do like:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [user?.id, postId]);

  /**
   * Toggle (dar/remover) like no post com feedback otimizista instantâneo
   */
  const toggleLike = useCallback(async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    if (!postId) {
      setError('ID do post não fornecido');
      return;
    }

    setError(null);

    // Feedback otimizista instantâneo - atualiza UI imediatamente
    const wasLiked = liked;
    const newLikedState = !wasLiked;
    const newLikeCount = wasLiked ? Math.max(0, likeCount - 1) : likeCount + 1;

    setLiked(newLikedState);
    setLikeCount(newLikeCount);
    setIsLoading(true);

    try {
      const result = await LikeService.toggleLike(postId, user.id);

      // Se o servidor retornou um estado diferente, corrige o estado otimizista
      if (result.liked !== newLikedState || result.likeCount !== newLikeCount) {
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      }
    } catch (err) {
      console.error('Erro ao alterar like:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Reverte o estado otimizista em caso de erro
      setLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : Math.max(0, likeCount - 1));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, postId, liked, likeCount]);

  /**
   * Atualizar status inicial quando o hook é montado ou dependências mudam
   */
  useEffect(() => {
    refreshLikeStatus();
  }, [refreshLikeStatus]);

  return {
    liked,
    likeCount,
    isLoading,
    error,
    toggleLike,
    refreshLikeStatus
  };
};

interface UsePostViewsProps {
  initialViews?: number;
  currentViews?: number;
}

interface UsePostViewsReturn {
  viewCount: number;
  incrementView: (postId: string) => Promise<void>;
}

/**
 * Hook para gerenciamento de visualizações de posts com estado local
 */
export const usePostViews = ({
  initialViews = 0,
  currentViews
}: UsePostViewsProps = {}): UsePostViewsReturn => {
  const [viewCount, setViewCount] = useState(initialViews);

  // Sincronizar contagem de visualizações com dados externos quando disponível
  useEffect(() => {
    if (currentViews !== undefined) {
      setViewCount(currentViews);
    }
  }, [currentViews]);

  const incrementView = useCallback(async (postId: string): Promise<void> => {
    if (!postId) {
      console.warn('ID do post não fornecido para incrementar visualização');
      return;
    }

    // Atualizar estado local imediatamente (otimizista)
    setViewCount(prev => prev + 1);

    try {
      // Incrementar visualização de forma assíncrona
      // Não precisamos esperar pelo resultado para não bloquear a UI
      await LikeService.incrementViewCount(postId);
    } catch (err) {
      console.error('Erro ao incrementar visualização:', err);
      // Em caso de erro, reverter a atualização otimista
      setViewCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  return { viewCount, incrementView };
};
