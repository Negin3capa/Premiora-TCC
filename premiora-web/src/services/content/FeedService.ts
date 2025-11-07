/**
 * Serviço de gerenciamento do feed
 * Responsável por busca e paginação de conteúdo do feed
 */
import { supabase } from '../../utils/supabaseClient';
import { VideoService } from './VideoService';

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
   * Busca conteúdo para o feed com paginação (posts + vídeos)
   * @param page - Página atual
   * @param limit - Número de itens por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com conteúdo e metadados
   */
  static async getFeedPosts(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<FeedResult> {
    try {
      // Buscar posts e vídeos em paralelo
      const [postsResult, videosResult] = await Promise.all([
        this.getPostsOnly(page, limit, userId),
        VideoService.getFeedVideos(page, limit, userId)
      ]);

      // Mesclar e ordenar por data de publicação
      const allContent = [
        ...postsResult.posts.map(post => ({ ...post, contentType: 'post' })),
        ...videosResult.map(video => ({ ...video, contentType: 'video' }))
      ].sort((a, b) => new Date(b.timestamp || b.published_at).getTime() - new Date(a.timestamp || a.published_at).getTime());

      // Aplicar paginação no resultado mesclado
      const from = (page - 1) * limit;
      const paginatedContent = allContent.slice(from, from + limit);

      // Verificar se há mais conteúdo
      const hasMore = allContent.length > from + limit;

      return {
        posts: paginatedContent,
        hasMore
      };
    } catch (error) {
      console.error('Erro geral ao buscar conteúdo do feed:', error);
      throw error;
    }
  }

  /**
   * Busca apenas posts (método auxiliar para compatibilidade)
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts
   */
  static async getPostsOnly(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<{ posts: any[] }> {
    try {
      const from = (page - 1) * limit;

      let dataQuery = supabase
        .from('posts')
        .select(`
          *,
          creator:creator_id (
            id,
            display_name,
            profile_image_url,
            users!creators_id_fkey (
              username
            )
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
        .neq('content_type', 'video') // Excluir vídeos pois são buscados separadamente
        .order('published_at', { ascending: false })
        .range(from, from + limit - 1);

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

      return {
        posts: data || []
      };
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
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
            profile_image_url,
            users!creators_id_fkey (
              username
            )
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
            profile_image_url,
            users!creators_id_fkey (
              username
            )
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
