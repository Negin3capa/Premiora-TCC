/**
 * Serviço de gerenciamento do feed
 * Responsável por busca e paginação de conteúdo do feed
 */
import { supabase } from '../../utils/supabaseClient';

/**
 * Resultado da busca de posts do feed
 */
export interface FeedResult {
  posts: any[];
  hasMore: boolean;
}

/**
 * Classe de serviço para operações do feed
 */
export class FeedService {
  /**
   * Busca posts para o feed com paginação
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts e metadados
   */
  static async getFeedPosts(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<FeedResult> {
    try {
      // Primeiro, obter o total de registros para evitar erros de range
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        countQuery = countQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        countQuery = countQuery.eq('is_premium', false);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Erro ao contar posts: ${countError.message}`);
      }

      const totalPosts = count || 0;
      const from = (page - 1) * limit;

      // Se não há mais posts para carregar, retornar vazio
      if (from >= totalPosts) {
        return {
          posts: [],
          hasMore: false
        };
      }

      // Ajustar o limite se estamos na última página
      const actualLimit = Math.min(limit, totalPosts - from);

      let dataQuery = supabase
        .from('posts')
        .select(`
          *,
          creator:creator_id (
            id,
            display_name,
            profile_image_url
          ),
          community:community_id (
            id,
            name,
            display_name,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, from + actualLimit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq('is_premium', false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(`Erro ao buscar posts: ${dataError.message}`);
      }

      const hasMore = (from + actualLimit) < totalPosts;

      return {
        posts: data || [],
        hasMore
      };
    } catch (error) {
      console.error('Erro geral ao buscar posts do feed:', error);
      throw error;
    }
  }

  /**
   * Busca posts de uma comunidade específica
   * @param communityName - Nome da comunidade
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts da comunidade
   */
  static async getCommunityPosts(
    communityName: string,
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<FeedResult> {
    try {
      // Primeiro, obter o total de registros para evitar erros de range
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('community.name', communityName);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        countQuery = countQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        countQuery = countQuery.eq('is_premium', false);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Erro ao contar posts da comunidade: ${countError.message}`);
      }

      const totalPosts = count || 0;
      const from = (page - 1) * limit;

      // Se não há mais posts para carregar, retornar vazio
      if (from >= totalPosts) {
        return {
          posts: [],
          hasMore: false
        };
      }

      // Ajustar o limite se estamos na última página
      const actualLimit = Math.min(limit, totalPosts - from);

      let dataQuery = supabase
        .from('posts')
        .select(`
          *,
          creator:creator_id (
            id,
            display_name,
            profile_image_url
          ),
          community:community_id (
            id,
            name,
            display_name,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          )
        `)
        .eq('is_published', true)
        .eq('community.name', communityName)
        .order('published_at', { ascending: false })
        .range(from, from + actualLimit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq('is_premium', false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(`Erro ao buscar posts da comunidade: ${dataError.message}`);
      }

      const hasMore = (from + actualLimit) < totalPosts;

      return {
        posts: data || [],
        hasMore
      };
    } catch (error) {
      console.error('Erro geral ao buscar posts da comunidade:', error);
      throw error;
    }
  }

  /**
   * Busca posts de um criador específico
   * @param creatorId - ID do criador
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts do criador
   */
  static async getCreatorPosts(
    creatorId: string,
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<FeedResult> {
    try {
      // Primeiro, obter o total de registros para evitar erros de range
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('creator_id', creatorId);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        countQuery = countQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        countQuery = countQuery.eq('is_premium', false);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Erro ao contar posts do criador: ${countError.message}`);
      }

      const totalPosts = count || 0;
      const from = (page - 1) * limit;

      // Se não há mais posts para carregar, retornar vazio
      if (from >= totalPosts) {
        return {
          posts: [],
          hasMore: false
        };
      }

      // Ajustar o limite se estamos na última página
      const actualLimit = Math.min(limit, totalPosts - from);

      let dataQuery = supabase
        .from('posts')
        .select(`
          *,
          creator:creator_id (
            id,
            display_name,
            profile_image_url
          ),
          community:community_id (
            id,
            name,
            display_name,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          )
        `)
        .eq('is_published', true)
        .eq('creator_id', creatorId)
        .order('published_at', { ascending: false })
        .range(from, from + actualLimit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq('is_premium', false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(`Erro ao buscar posts do criador: ${dataError.message}`);
      }

      const hasMore = (from + actualLimit) < totalPosts;

      return {
        posts: data || [],
        hasMore
      };
    } catch (error) {
      console.error('Erro geral ao buscar posts do criador:', error);
      throw error;
    }
  }
}
