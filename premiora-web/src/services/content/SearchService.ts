/**
 * Serviço de busca para comunidades e conteúdo
 * Fornece funcionalidades de busca global na plataforma
 */
import { supabase } from "../../utils/supabaseClient";
import type { ContentItem } from "../../types/content";
import type { Community } from "../../types/community";

/**
 * Classe de serviço para operações de busca
 */
export class SearchService {
  /**
   * Busca usuários por nome ou username
   * @param query - Termo de busca
   * @param limit - Número máximo de resultados (padrão: 10)
   * @returns Lista de usuários encontrados
   */
  static async searchUsers(
    query: string,
    limit: number = 10,
  ): Promise<any[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // 1. Buscar na tabela users (name ou username)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id")
        .or(
          `name.ilike.%${query.toLowerCase()}%,username.ilike.%${query.toLowerCase()}%`,
        )
        .eq("profile_setup_completed", true)
        .limit(limit);

      if (usersError) {
        console.error("Erro ao buscar usuários (users table):", usersError);
      }

      // 2. Buscar na tabela creators (display_name)
      const { data: creatorsData, error: creatorsError } = await supabase
        .from("creators")
        .select("id")
        .ilike("display_name", `%${query}%`)
        .limit(limit);

      if (creatorsError) {
        console.error("Erro ao buscar creators (creators table):", creatorsError);
        // Não falhar se creators table não for acessível (pode ser restrito)
      }

      // 3. Combinar IDs únicos
      const userIds = new Set<string>();
      if (usersData) usersData.forEach((u) => userIds.add(u.id));
      if (creatorsData) creatorsData.forEach((c) => userIds.add(c.id));

      if (userIds.size === 0) {
        return [];
      }

      const uniqueIds = Array.from(userIds).slice(0, limit);

      // 4. Buscar detalhes completos dos usuários
      const { data: finalUsers, error: finalError } = await supabase
        .from("users")
        .select("id, name, username, avatar_url, profile_setup_completed")
        .in("id", uniqueIds);

      if (finalError) {
        console.error("Erro ao buscar detalhes finais dos usuários:", finalError);
        return [];
      }

      // 5. Buscar display_name atualizado dos creators para esses usuários
      // Isso garante que mostremos o nome correto mesmo se users.name estiver desatualizado
      const { data: finalCreators, error: finalCreatorsError } = await supabase
        .from("creators")
        .select("id, display_name")
        .in("id", uniqueIds);
        
      if (finalCreatorsError) {
        console.error("Erro ao buscar detalhes finais dos creators:", finalCreatorsError);
      }
      
      // Criar mapa de creators para lookup rápido
      const creatorsMap = new Map();
      if (finalCreators) {
        finalCreators.forEach(c => creatorsMap.set(c.id, c));
      }

      // 6. Mesclar dados e retornar
      return (finalUsers || []).map(user => {
        const creator = creatorsMap.get(user.id);
        // Preferir display_name do creator se existir, senão usar name do user
        const displayName = creator?.display_name || user.name;
        
        return {
          ...user,
          name: displayName
        };
      });

    } catch (err) {
      console.error("Erro geral na busca de usuários:", err);
      return [];
    }
  }

  /**
   * Busca comunidades por nome ou descrição
   * @param query - Termo de busca
   * @param limit - Número máximo de resultados (padrão: 10)
   * @returns Lista de comunidades encontradas
   */
  static async searchCommunities(
    query: string,
    limit: number = 10,
  ): Promise<Community[]> {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .or(
        `name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`,
      )
      .eq("is_private", false) // Apenas comunidades públicas
      .order("member_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar comunidades:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      displayName: item.display_name || item.name,
      description: item.description,
      bannerUrl: item.banner_url,
      avatarUrl: item.icon_url || item.avatar_url,
      creatorId: item.creator_id,
      isPrivate: item.is_private,
      memberCount: item.member_count || item.members_count || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  /**
   * Busca conteúdo (posts) por título, autor ou conteúdo
   * @param query - Termo de busca
   * @param limit - Número máximo de resultados (padrão: 10)
   * @returns Lista de itens de conteúdo encontrados
   */
  static async searchContent(
    query: string,
    limit: number = 10,
  ): Promise<ContentItem[]> {
    if (!query.trim()) {
      return [];
    }

    // Primeiro busca os posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        content_type,
        creator_id,
        community_id,
        created_at,
        likes_count,
        views_count,
        is_premium,
        media_urls,
        communities (
          name,
          display_name
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (postsError) {
      console.error("Erro ao buscar posts:", postsError);
      return [];
    }

    const contentItems: ContentItem[] = [];

    // Se temos posts, busca os dados dos usuários separadamente
    if (postsData && postsData.length > 0) {
      const creatorIds = postsData.map((post) => post.creator_id);

      // Busca dados dos usuários (usa cliente padrão)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, name, avatar_url")
        .in("id", creatorIds);

      if (usersError) {
        console.error("Erro ao buscar usuários dos posts:", usersError);
      }

      // Cria um mapa de usuários para lookup rápido
      const usersMap = new Map();
      if (usersData) {
        usersData.forEach((user) => usersMap.set(user.id, user));
      }

      // Transforma posts em ContentItem
      postsData.forEach((post: any) => {
        const user = usersMap.get(post.creator_id);
        const communities = Array.isArray(post.communities)
          ? post.communities[0]
          : post.communities;

        contentItems.push({
          id: post.id,
          type: post.content_type === "video" ? "video" : "post",
          title: post.title,
          author: user?.name || user?.username || "Usuário",
          authorAvatar: user?.avatar_url || "",
          content: post.content,
          timestamp: post.created_at,
          communityId: post.community_id,
          communityName: communities?.display_name || communities?.name || "",
          communityAvatar: "", // TODO: implementar avatar da comunidade
          likes: post.likes_count || 0,
          views: post.views_count || 0,
          accessLevel: post.is_premium ? "premium" : "public",
          isLocked: post.is_premium,
          videoUrl: post.content_type === "video"
            ? (post.media_urls?.[0] || "")
            : undefined,
          creatorId: post.creator_id,
        });
      });
    }

    return contentItems;
  }

  /**
   * Busca global combinando usuários, comunidades e conteúdo
   * @param query - Termo de busca
   * @param options - Opções de busca
   * @returns Resultados de busca separados por tipo
   */
  static async globalSearch(
    query: string,
    options: {
      usersLimit?: number;
      communitiesLimit?: number;
      contentLimit?: number;
    } = {},
  ): Promise<{
    users: any[];
    communities: Community[];
    content: ContentItem[];
  }> {
    const { usersLimit = 5, communitiesLimit = 5, contentLimit = 8 } = options;

    const [users, communities, content] = await Promise.all([
      this.searchUsers(query, usersLimit),
      this.searchCommunities(query, communitiesLimit),
      this.searchContent(query, contentLimit),
    ]);

    return { users, communities, content };
  }
}
