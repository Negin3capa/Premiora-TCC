/**
 * Hook personalizado para gerenciar sugestões de usuários
 * Fornece estado e funções para buscar e interagir com sugestões
 */
import { useState, useEffect, useCallback } from 'react';
import { UserSuggestionsService } from '../services/content';
import type { UserSuggestion } from '../services/content';
import { useAuth } from './useAuth';

/**
 * Interface para o estado do hook de sugestões
 */
interface UserSuggestionsState {
  suggestions: UserSuggestion[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

/**
 * Hook para gerenciar sugestões de usuários
 * @returns Estado e funções para interagir com sugestões
 */
export const useUserSuggestions = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UserSuggestionsState>({
    suggestions: [],
    loading: false,
    error: null,
    lastFetched: null
  });

  /**
   * Busca sugestões de usuários
   * @param forceRefresh - Força busca fresca ignorando cache
   */
  const fetchSuggestions = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) {
      console.log('⚠️ Usuário não autenticado, pulando busca de sugestões');
      return;
    }

    // Verificar se deve usar cache (última busca há menos de 5 minutos)
    const now = new Date();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutos
    if (!forceRefresh && state.lastFetched && (now.getTime() - state.lastFetched.getTime()) < cacheExpiry) {
      console.log('📋 Usando sugestões em cache');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔄 Buscando sugestões de usuários...');
      const suggestions = await UserSuggestionsService.getUserSuggestions(user.id, 5);

      setState(prev => ({
        ...prev,
        suggestions,
        loading: false,
        error: null,
        lastFetched: now
      }));

      console.log('✅ Sugestões carregadas:', suggestions.length);

    } catch (err) {
      console.error('❌ Erro ao buscar sugestões:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar sugestões',
        lastFetched: now
      }));
    }
  }, [user?.id, state.lastFetched]);

  /**
   * Seguir um usuário sugerido
   * @param targetUserId - ID do usuário a ser seguido
   */
  const followUser = useCallback(async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      console.log('👥 Seguindo usuário:', targetUserId);
      await UserSuggestionsService.followUser(user.id, targetUserId);

      // Atualizar estado local removendo o usuário seguido das sugestões
      setState(prev => ({
        ...prev,
        suggestions: prev.suggestions.filter(suggestion => suggestion.id !== targetUserId)
      }));

      console.log('✅ Usuário seguido com sucesso');

    } catch (err) {
      console.error('❌ Erro ao seguir usuário:', err);
      // TODO: Mostrar notificação de erro ao usuário
    }
  }, [user?.id]);

  /**
   * Deixar de seguir um usuário (para futuras funcionalidades)
   * @param targetUserId - ID do usuário a deixar de seguir
   */
  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      console.log('👥 Deixando de seguir usuário:', targetUserId);
      await UserSuggestionsService.unfollowUser(user.id, targetUserId);

      // Nota: Como não temos sistema de follow real ainda,
      // não removemos da lista de sugestões aqui

    } catch (err) {
      console.error('❌ Erro ao deixar de seguir usuário:', err);
      // TODO: Mostrar notificação de erro ao usuário
    }
  }, [user?.id]);

  /**
   * Atualizar sugestões manualmente
   */
  const refreshSuggestions = useCallback(() => {
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  // Buscar sugestões automaticamente quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      fetchSuggestions();
    } else {
      // Limpar sugestões quando usuário desloga
      setState({
        suggestions: [],
        loading: false,
        error: null,
        lastFetched: null
      });
    }
  }, [user?.id, fetchSuggestions]);

  return {
    suggestions: state.suggestions,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchSuggestions,
    followUser,
    unfollowUser,
    refreshSuggestions
  };
};
