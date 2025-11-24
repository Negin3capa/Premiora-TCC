/**
 * Serviço de gerenciamento do feed
 * Responsável por busca e paginação de conteúdo do feed
 */
import { supabase } from "../../utils/supabaseClient";
import { supabaseAdmin } from "../../utils/supabaseAdminClient";
import { VideoService } from "./VideoService";
import type { SortOption, TimeRange } from "../../types/content";

/**
 * Resultado da busca de posts do feed com paginação por cursor
 */
export interface FeedResult {
  posts: any[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

/**
 * Classe de serviço para operações do feed
 */
export class FeedService {
  /**
   * Busca conteúdo para o feed com paginação por cursor
   * @param cursor - Cursor para paginação (null para primeira página)
   * @param limit - Número de itens por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com conteúdo e cursores
   */
  static async getFeedPostsCursor(
    cursor: string | null = null,
    limit: number = 10,
    userId?: string,
  ): Promise<FeedResult> {
    try {
      // Buscar posts e vídeos em paralelo usando cursor
      const [postsResult, videosResult] = await Promise.all([
        this.getPostsCursor(cursor, limit, userId),
        VideoService.getFeedVideosCursor(cursor, limit, userId),
      ]);

      // Mesclar e ordenar por data de publicação
      const allContent = [
        ...postsResult.posts.map((post: any) => ({
          ...post,
          contentType: "post",
        })),
        ...videosResult.videos.map((video: any) => ({
          ...video,
          contentType: "video",
        })),
      ].sort((a, b) =>
        new Date(b.timestamp || b.published_at).getTime() -
        new Date(a.timestamp || a.published_at).getTime()
      );

      // Determinar cursores baseado no conteúdo mesclado
      let nextCursor: string | undefined;
      let prevCursor: string | undefined;

      if (allContent.length > 0) {
        // Next cursor é baseado no último item
        const lastItem = allContent[allContent.length - 1];
        nextCursor = this.encodeCursor(
          lastItem.published_at || lastItem.timestamp,
          lastItem.id,
        );

        // Prev cursor seria baseado no primeiro item (para paginação reversa)
        const firstItem = allContent[0];
        prevCursor = this.encodeCursor(
          firstItem.published_at || firstItem.timestamp,
          firstItem.id,
        );
      }

      // Verificar se há mais conteúdo baseado nos resultados individuais
      // hasMore é true se posts OU vídeos têm mais dados disponíveis
      const hasMore = postsResult.hasMore || videosResult.hasMore;

      // Garantir que não há duplicatas por ID
      const uniqueContent = allContent.filter((item, index, self) =>
        index === self.findIndex((other) => other.id === item.id)
      );

      return {
        posts: uniqueContent,
        nextCursor,
        prevCursor,
        hasMore,
      };
    } catch (error) {
      console.error("Erro geral ao buscar conteúdo do feed com cursor:", error);
      throw error;
    }
  }

  /**
   * Busca posts usando paginação por cursor
   * @param cursor - Cursor para paginação (null para primeira página)
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts e metadados
   */
  static async getPostsCursor(
    cursor: string | null = null,
    limit: number = 10,
    userId?: string,
  ): Promise<{ posts: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      // Usar supabaseAdmin para garantir que posts premium sejam retornados (bypass RLS)
      // O filtro de acesso será feito manualmente abaixo
      let query = supabaseAdmin
        .from("posts")
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
          ),
          comments (
            id
          ),
          post_flairs (
            community_flairs (
              flair_text,
              flair_color,
              flair_background_color
            )
          ),
          required_tier:required_tier_id (
            id,
            name,
            tier_order
          )
        `)
        .eq("is_published", true)
        .neq("content_type", "video")
        .order("published_at", { ascending: false })
        .limit(limit);

      // Aplicar cursor se fornecido
      if (cursor) {
        const { sortValue, id } = this.decodeCursor(cursor);
        // Para o feed principal, assumimos ordenação por data (New)
        query = query.or(
          `published_at.lt.${sortValue},and(published_at.eq.${sortValue},id.lt.${id})`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar posts com cursor: ${error.message}`);
      }

      let posts = data || [];

      // Buscar assinaturas do usuário se estiver logado
      let userSubscribedTiers: any[] = [];
      if (userId) {
        const { data: userSubs } = await supabase
          .from('user_subscriptions')
          .select('plan_id')
          .eq('user_id', userId)
          .eq('status', 'active');
        
        const planIds = userSubs?.map(s => s.plan_id) || [];
        
        if (planIds.length > 0) {
          const { data: tiers } = await supabaseAdmin
            .from('subscription_tiers')
            .select('id, tier_order, creator_channel_id')
            .in('id', planIds);
          
          userSubscribedTiers = tiers || [];
        }
      }

      // Processar posts para verificar acesso e sanitizar se necessário
      posts = posts.map(post => {
        if (!post.is_premium) return post;
        
        // Se é o criador, tem acesso
        if (userId && post.creator_id === userId) return post;

        let hasAccess = false;
        
        if (userId && userSubscribedTiers.length > 0) {
          const requiredOrder = post.required_tier?.tier_order || 0;
          // Verificar se tem tier suficiente para este criador
          hasAccess = userSubscribedTiers.some(t => 
            t.creator_channel_id === post.creator_id && t.tier_order >= requiredOrder
          );
        }

        if (!hasAccess) {
          return {
            ...post,
            content: null,
            media_urls: [],
            isLocked: true,
            requiredTier: post.required_tier?.name
          };
        }

        return post;
      });

      let nextCursor: string | undefined;
      const hasMore = posts.length === limit;

      if (hasMore && posts.length > 0) {
        const lastPost = posts[posts.length - 1];
        nextCursor = this.encodeCursor(lastPost.published_at, lastPost.id);
      }

      return {
        posts,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error("Erro ao buscar posts com cursor:", error);
      throw error;
    }
  }

  /**
   * Codifica cursor baseado em valor de ordenação e ID
   * @param sortValue - Valor usado para ordenação (timestamp, score, likes)
   * @param id - ID do item
   * @returns Cursor codificado em base64
   */
  private static encodeCursor(sortValue: string | number, id: string): string {
    const cursorData = JSON.stringify({ v: sortValue, id });
    return btoa(cursorData); // Base64 encoding
  }

  /**
   * Decodifica cursor para valor de ordenação e ID
   * @param cursor - Cursor codificado
   * @returns Objeto com sortValue e id
   */
  private static decodeCursor(
    cursor: string,
  ): { sortValue: string | number; id: string } {
    try {
      const decoded = atob(cursor); // Base64 decoding
      const parsed = JSON.parse(decoded);

      // Compatibilidade com cursores antigos que usavam 'timestamp'
      if (parsed.timestamp) {
        return { sortValue: parsed.timestamp, id: parsed.id };
      }

      return { sortValue: parsed.v, id: parsed.id };
    } catch (error) {
      console.error("Erro ao decodificar cursor:", error);
      throw new Error("Cursor inválido");
    }
  }
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
    userId?: string,
  ): Promise<FeedResult> {
    try {
      // Buscar posts e vídeos em paralelo para a página atual
      const [postsResult, videosResult] = await Promise.all([
        this.getPostsOnly(page, limit, userId),
        VideoService.getFeedVideos(page, limit, userId),
      ]);

      // Mesclar e ordenar por data de publicação
      const allContent = [
        ...postsResult.posts.map((post) => ({ ...post, contentType: "post" })),
        ...videosResult.videos.map((video) => ({
          ...video,
          contentType: "video",
        })),
      ].sort((a, b) =>
        new Date(b.timestamp || b.published_at).getTime() -
        new Date(a.timestamp || a.published_at).getTime()
      );

      // Verificar se há mais conteúdo baseado nos resultados individuais
      // hasMore é true se posts OU vídeos têm mais dados disponíveis
      const hasMore = postsResult.hasMore || videosResult.hasMore;

      // Garantir que não há duplicatas por ID
      const uniqueContent = allContent.filter((item, index, self) =>
        index === self.findIndex((other) => other.id === item.id)
      );

      return {
        posts: uniqueContent,
        hasMore,
      };
    } catch (error) {
      console.error("Erro geral ao buscar conteúdo do feed:", error);
      throw error;
    }
  }

  /**
   * Busca apenas posts (método auxiliar para compatibilidade)
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts e indicador de mais conteúdo
   */
  static async getPostsOnly(
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<{ posts: any[]; hasMore: boolean }> {
    try {
      const from = (page - 1) * limit;

      let dataQuery = supabase
        .from("posts")
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
          ),
          comments (
            id
          )
        `)
        .eq("is_published", true)
        .neq("content_type", "video") // Excluir vídeos pois são buscados separadamente
        .order("published_at", { ascending: false })
        .range(from, from + limit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq("is_premium", false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(`Erro ao buscar posts: ${dataError.message}`);
      }

      // Verificar se há mais posts disponíveis
      const hasMore = data && data.length === limit;

      return {
        posts: data || [],
        hasMore,
      };
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      throw error;
    }
  }

  /**
   * Busca posts de uma comunidade específica com paginação por cursor
   * @param communityName - Nome da comunidade
   * @param cursor - Cursor para paginação (null para primeira página)
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts da comunidade e cursor
   */
  /**
   * Busca posts de uma comunidade específica com paginação por cursor e ordenação
   * @param communityName - Nome da comunidade
   * @param cursor - Cursor para paginação (null para primeira página)
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @param sortBy - Critério de ordenação (hot, new, top)
   * @param timeRange - Filtro de tempo para ordenação Top
   * @returns Promise com posts da comunidade e cursor
   */
  static async getCommunityPostsCursor(
    communityName: string,
    cursor: string | null = null,
    limit: number = 10,
    userId?: string,
    sortBy: SortOption = "hot",
    timeRange: TimeRange = "all",
  ): Promise<FeedResult> {
    try {
      // Primeiro, buscar o ID da comunidade pelo nome
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("id")
        .eq("name", communityName)
        .single();

      if (communityError) {
        if (communityError.code === "PGRST116") {
          // Comunidade não encontrada
          return {
            posts: [],
            hasMore: false,
          };
        }
        throw new Error(`Erro ao buscar comunidade: ${communityError.message}`);
      }

      const communityId = communityData.id;

      // Buscar posts da comunidade usando cursor
      let dataQuery = supabase
        .from("posts")
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
          ),
          comments (
            id
          ),
          post_flairs (
            community_flairs (
              flair_text,
              flair_color,
              flair_background_color
            )
          )
        `)
        .eq("is_published", true)
        .eq("community_id", communityId);

      // Aplicar ordenação
      if (sortBy === "hot") {
        dataQuery = dataQuery.order("hot_score", { ascending: false });
      } else if (sortBy === "top") {
        dataQuery = dataQuery.order("likes_count", { ascending: false });

        // Aplicar filtro de tempo para Top
        if (timeRange !== "all") {
          const now = new Date();
          let dateFilter = new Date();

          switch (timeRange) {
            case "day":
              dateFilter.setDate(now.getDate() - 1);
              break;
            case "week":
              dateFilter.setDate(now.getDate() - 7);
              break;
            case "month":
              dateFilter.setMonth(now.getMonth() - 1);
              break;
            case "year":
              dateFilter.setFullYear(now.getFullYear() - 1);
              break;
          }

          dataQuery = dataQuery.gte("published_at", dateFilter.toISOString());
        }
      } else {
        // New (default)
        dataQuery = dataQuery.order("published_at", { ascending: false });
      }

      // Ordenação secundária por ID para estabilidade
      dataQuery = dataQuery.order("id", { ascending: false });

      dataQuery = dataQuery.limit(limit);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq("is_premium", false);
      }

      // Aplicar cursor se fornecido
      if (cursor) {
        const { sortValue, id } = this.decodeCursor(cursor);

        if (sortBy === "hot") {
          dataQuery = dataQuery.or(
            `hot_score.lt.${sortValue},and(hot_score.eq.${sortValue},id.lt.${id})`,
          );
        } else if (sortBy === "top") {
          dataQuery = dataQuery.or(
            `likes_count.lt.${sortValue},and(likes_count.eq.${sortValue},id.lt.${id})`,
          );
        } else {
          dataQuery = dataQuery.or(
            `published_at.lt.${sortValue},and(published_at.eq.${sortValue},id.lt.${id})`,
          );
        }
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(
          `Erro ao buscar posts da comunidade com cursor: ${dataError.message}`,
        );
      }

      const posts = data || [];
      let nextCursor: string | undefined;
      const hasMore = posts.length === limit;

      if (hasMore && posts.length > 0) {
        const lastPost = posts[posts.length - 1];
        let val;

        if (sortBy === "hot") val = lastPost.hot_score;
        else if (sortBy === "top") val = lastPost.likes_count;
        else val = lastPost.published_at;

        nextCursor = this.encodeCursor(val, lastPost.id);
      }

      return {
        posts,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error(
        "Erro geral ao buscar posts da comunidade com cursor:",
        error,
      );
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
    userId?: string,
  ): Promise<FeedResult> {
    try {
      // Primeiro, buscar o ID da comunidade pelo nome
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("id")
        .eq("name", communityName)
        .single();

      if (communityError) {
        if (communityError.code === "PGRST116") {
          // Comunidade não encontrada
          return {
            posts: [],
            hasMore: false,
          };
        }
        throw new Error(`Erro ao buscar comunidade: ${communityError.message}`);
      }

      const communityId = communityData.id;

      // Agora buscar posts da comunidade usando o community_id
      const from = (page - 1) * limit;

      let dataQuery = supabase
        .from("posts")
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
          ),
          comments (
            id
          )
        `)
        .eq("is_published", true)
        .eq("community_id", communityId)
        .order("published_at", { ascending: false })
        .range(from, from + limit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq("is_premium", false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(
          `Erro ao buscar posts da comunidade: ${dataError.message}`,
        );
      }

      // Verificar se há mais posts
      const hasMore = data && data.length === limit;

      return {
        posts: data || [],
        hasMore,
      };
    } catch (error) {
      console.error("Erro geral ao buscar posts da comunidade:", error);
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
    userId?: string,
  ): Promise<FeedResult> {
    try {
      // Primeiro, obter o total de registros para evitar erros de range
      // Usar supabaseAdmin para incluir posts premium na contagem
      let countQuery = supabaseAdmin
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("creator_id", creatorId);

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(
          `Erro ao contar posts do criador: ${countError.message}`,
        );
      }

      const totalPosts = count || 0;
      const from = (page - 1) * limit;

      // Se não há mais posts para carregar, retornar vazio
      if (from >= totalPosts) {
        return {
          posts: [],
          hasMore: false,
        };
      }

      // Ajustar o limite se estamos na última página
      const actualLimit = Math.min(limit, totalPosts - from);

      let dataQuery = supabaseAdmin
        .from("posts")
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
          ),
          comments (
            id
          ),
          required_tier:required_tier_id (
            id,
            name,
            tier_order
          )
        `)
        .eq("is_published", true)
        .eq("creator_id", creatorId)
        .order("published_at", { ascending: false })
        .range(from, from + actualLimit - 1);

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(
          `Erro ao buscar posts do criador: ${dataError.message}`,
        );
      }

      let posts = data || [];

      // Buscar assinaturas do usuário se estiver logado
      let userSubscribedTiers: any[] = [];
      if (userId) {
        const { data: userSubs } = await supabase
          .from('user_subscriptions')
          .select('plan_id')
          .eq('user_id', userId)
          .eq('status', 'active');
        
        const planIds = userSubs?.map(s => s.plan_id) || [];
        
        if (planIds.length > 0) {
          const { data: tiers } = await supabaseAdmin
            .from('subscription_tiers')
            .select('id, tier_order, creator_channel_id')
            .in('id', planIds);
          
          userSubscribedTiers = tiers || [];
        }
      }

      // Processar posts para verificar acesso e sanitizar se necessário
      posts = posts.map(post => {
        if (!post.is_premium) return post;
        
        // Se é o criador, tem acesso
        if (userId && post.creator_id === userId) return post;

        let hasAccess = false;
        
        if (userId && userSubscribedTiers.length > 0) {
          const requiredOrder = post.required_tier?.tier_order || 0;
          // Verificar se tem tier suficiente para este criador
          hasAccess = userSubscribedTiers.some(t => 
            t.creator_channel_id === post.creator_id && t.tier_order >= requiredOrder
          );
        }

        if (!hasAccess) {
          return {
            ...post,
            content: null,
            media_urls: [],
            isLocked: true,
            requiredTier: post.required_tier?.name
          };
        }

        return post;
      });

      const hasMore = (from + actualLimit) < totalPosts;

      return {
        posts,
        hasMore,
      };
    } catch (error) {
      console.error("Erro geral ao buscar posts do criador:", error);
      throw error;
    }
  }
}
