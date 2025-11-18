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
  initialLikeCount = 0
}: UsePostLikeProps): UsePostLikeReturn => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
   * Toggle (dar/remover) like no post
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

    setIsLoading(true);
    setError(null);

    try {
      const result = await LikeService.toggleLike(postId, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error('Erro ao alterar like:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, postId]);

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

/**
 * Hook para gerenciamento de visualizações de posts
 */
export const usePostViews = () => {
  const incrementView = useCallback(async (postId: string): Promise<void> => {
    if (!postId) {
      console.warn('ID do post não fornecido para incrementar visualização');
      return;
    }

    try {
      // Incrementar visualização de forma assíncrona
      // Não precisamos esperar pelo resultado para não bloquear a UI
      LikeService.incrementViewCount(postId).catch(err => {
        console.error('Erro ao incrementar visualização:', err);
      });
    } catch (err) {
      console.error('Erro ao preparar incremento de visualização:', err);
    }
  }, []);

  return { incrementView };
};
