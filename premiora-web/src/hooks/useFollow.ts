import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { FollowService } from '../services/followService';

/**
 * Hook personalizado para gerenciar operações de follow/unfollow
 * Centraliza a lógica de seguir/deixar de seguir usuários
 *
 * @param targetUserId - ID do usuário alvo (opcional, pode ser passado depois)
 */
export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);

  /**
   * Verifica se o usuário atual está seguindo o usuário alvo
   */
  const checkFollowStatus = useCallback(async (userId: string) => {
    if (!user?.id) return;

    try {
      const status = await FollowService.isFollowing(user.id, userId);
      setIsFollowing(status);
    } catch (err) {
      console.error('Erro ao verificar status de follow:', err);
      setError('Erro ao verificar status de follow');
    }
  }, [user?.id]);

  /**
   * Carrega contagem de seguidores do usuário alvo
   */
  const loadFollowersCount = useCallback(async (userId: string) => {
    try {
      const count = await FollowService.getFollowersCount(userId);
      setFollowersCount(count);
    } catch (err) {
      console.error('Erro ao carregar contagem de seguidores:', err);
    }
  }, []);

  /**
   * Seguir um usuário
   */
  const followUser = useCallback(async (userId: string) => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    if (user.id === userId) {
      setError('Não é possível seguir a si mesmo');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await FollowService.followUser(user.id, userId);
      if (success) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao seguir usuário';
      setError(errorMessage);
      console.error('Erro ao seguir usuário:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Deixar de seguir um usuário
   */
  const unfollowUser = useCallback(async (userId: string) => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await FollowService.unfollowUser(user.id, userId);
      if (success) {
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deixar de seguir usuário';
      setError(errorMessage);
      console.error('Erro ao deixar de seguir usuário:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Toggle follow/unfollow
   */
  const toggleFollow = useCallback(async (userId: string) => {
    if (isFollowing) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  // Carregar status inicial quando targetUserId é fornecido
  useEffect(() => {
    if (targetUserId && user?.id) {
      checkFollowStatus(targetUserId);
      loadFollowersCount(targetUserId);
    }
  }, [targetUserId, user?.id, checkFollowStatus, loadFollowersCount]);

  return {
    isFollowing,
    loading,
    error,
    followersCount,
    followUser,
    unfollowUser,
    toggleFollow,
    refreshStatus: targetUserId ? () => checkFollowStatus(targetUserId) : undefined,
    refreshCount: targetUserId ? () => loadFollowersCount(targetUserId) : undefined
  };
};
