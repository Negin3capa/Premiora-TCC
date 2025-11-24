/**
 * Serviço de sugestões de usuários
 * Responsável por buscar e recomendar usuários baseado em interesses similares
 */
import { supabase } from "../../utils/supabaseClient";

/**
 * Interface para sugestão de usuário
 */
export interface UserSuggestion {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  description?: string;
  latestPost?: string;
  isVerified?: boolean;
  reason?: string; // Por que este usuário foi sugerido
}

/**
 * Classe de serviço para sugestões de usuários
 */
export class UserSuggestionsService {
  /**
   * Busca sugestões de usuários para um usuário específico
   * Combina algoritmos baseados em comunidades e interações
   * @param userId - ID do usuário atual
   * @param limit - Número máximo de sugestões (padrão: 5)
   * @returns Promise com array de sugestões
   */
  static async getUserSuggestions(
    userId: string,
    limit: number = 5,
  ): Promise<UserSuggestion[]> {
    try {
      console.log("🔍 Buscando sugestões de usuários para:", userId);

      // Buscar sugestões baseadas em comunidades
      const communitySuggestions = await this.getCommunityBasedSuggestions(
        userId,
        Math.ceil(limit / 2),
      );

      // Buscar sugestões baseadas em interações
      const interactionSuggestions = await this.getInteractionBasedSuggestions(
        userId,
        Math.ceil(limit / 2),
      );

      // Combinar e remover duplicatas, mantendo a melhor pontuação
      const combinedSuggestions = this.mergeAndRankSuggestions(
        communitySuggestions,
        interactionSuggestions,
        limit,
      );

      if (combinedSuggestions.length > 0) {
        // Buscar posts recentes para enriquecer as sugestões
        const enrichedSuggestions = await this.enrichSuggestionsWithPosts(
          combinedSuggestions,
        );
        console.log("✅ Sugestões encontradas:", enrichedSuggestions.length);
        return enrichedSuggestions;
      }

      // Fallback para sugestões gerais se nenhum algoritmo retornou resultados
      return this.getGeneralSuggestions(userId, limit);
    } catch (err) {
      console.error("💥 Erro geral ao buscar sugestões:", err);
      return this.getFallbackSuggestions(limit);
    }
  }

  /**
   * Busca sugestões baseadas em comunidades compartilhadas
   * @param userId - ID do usuário atual
   * @param limit - Número máximo de sugestões
   * @returns Promise com sugestões baseadas em comunidades
   */
  private static async getCommunityBasedSuggestions(
    userId: string,
    limit: number,
  ): Promise<
    Array<
      { user: any; score: number; sharedCommunities: number; reason: string }
    >
  > {
    try {
      // Buscar comunidades do usuário atual
      const { data: userCommunities, error: communitiesError } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);

      if (communitiesError || !userCommunities?.length) {
        return [];
      }

      const communityIds = userCommunities.map((cm) => cm.community_id);

      // Buscar usuários em comunidades similares (excluindo o próprio usuário)
      const { data: similarUsers, error: similarError } = await supabase
        .from("community_members")
        .select(`
          user_id,
          community_id,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            bio
          )
        `)
        .in("community_id", communityIds)
        .neq("user_id", userId)
        .limit(limit * 3);

      if (similarError) {
        console.error(
          "❌ Erro ao buscar usuários similares por comunidade:",
          similarError,
        );
        return [];
      }

      // Agrupar e contar usuários por frequência de comunidades compartilhadas
      const userScores = new Map<
        string,
        { user: any; score: number; sharedCommunities: number; reason: string }
      >();

      similarUsers?.forEach((member: any) => {
        const userData = member.users;
        if (userData && userData.id) {
          const existing = userScores.get(userData.id);

          if (existing) {
            existing.score += 1;
            existing.sharedCommunities += 1;
          } else {
            userScores.set(userData.id, {
              user: userData,
              score: 1,
              sharedCommunities: 1,
              reason: "community",
            });
          }
        }
      });

      return Array.from(userScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (err) {
      console.error("💥 Erro ao buscar sugestões baseadas em comunidade:", err);
      return [];
    }
  }

  /**
   * Busca sugestões baseadas em interações (likes, comments, views)
   * @param userId - ID do usuário atual
   * @param limit - Número máximo de sugestões
   * @returns Promise com sugestões baseadas em interações
   */
  private static async getInteractionBasedSuggestions(
    userId: string,
    limit: number,
  ): Promise<
    Array<
      { user: any; score: number; sharedCommunities: number; reason: string }
    >
  > {
    try {
      // Buscar posts que o usuário curtiu
      const { data: likedPosts, error: likesError } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId);

      if (likesError) {
        console.error("❌ Erro ao buscar posts curtidos:", likesError);
      }

      // Buscar posts que o usuário comentou
      const { data: commentedPosts, error: commentsError } = await supabase
        .from("comments")
        .select("post_id")
        .eq("user_id", userId);

      if (commentsError) {
        console.error("❌ Erro ao buscar posts comentados:", commentsError);
      }

      // Combinar IDs de posts interagidos
      const interactedPostIds = new Set([
        ...(likedPosts?.map((like) => like.post_id) || []),
        ...(commentedPosts?.map((comment) => comment.post_id) || []),
      ]);

      if (interactedPostIds.size === 0) {
        return [];
      }

      // Buscar outros usuários que interagiram com os mesmos posts
      const postIdsArray = Array.from(interactedPostIds);

      // Buscar likes de outros usuários nos mesmos posts
      const { data: otherLikes, error: otherLikesError } = await supabase
        .from("post_likes")
        .select(`
          user_id,
          post_id,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            bio
          )
        `)
        .in("post_id", postIdsArray)
        .neq("user_id", userId)
        .limit(limit * 5);

      if (otherLikesError) {
        console.error(
          "❌ Erro ao buscar likes de outros usuários:",
          otherLikesError,
        );
      }

      // Buscar comentários de outros usuários nos mesmos posts
      const { data: otherComments, error: otherCommentsError } = await supabase
        .from("comments")
        .select(`
          user_id,
          post_id,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            bio
          )
        `)
        .in("post_id", postIdsArray)
        .neq("user_id", userId)
        .limit(limit * 5);

      if (otherCommentsError) {
        console.error(
          "❌ Erro ao buscar comentários de outros usuários:",
          otherCommentsError,
        );
      }

      // Combinar interações e pontuar usuários
      const userInteractionScores = new Map<
        string,
        { user: any; score: number; interactions: number; reason: string }
      >();

      // Processar likes
      otherLikes?.forEach((like: any) => {
        const userData = like.users;
        if (userData && userData.id) {
          const existing = userInteractionScores.get(userData.id);
          if (existing) {
            existing.score += 2; // Likes valem mais pontos
            existing.interactions += 1;
          } else {
            userInteractionScores.set(userData.id, {
              user: userData,
              score: 2,
              interactions: 1,
              reason: "interaction",
            });
          }
        }
      });

      // Processar comentários
      otherComments?.forEach((comment: any) => {
        const userData = comment.users;
        if (userData && userData.id) {
          const existing = userInteractionScores.get(userData.id);
          if (existing) {
            existing.score += 3; // Comentários valem mais pontos que likes
            existing.interactions += 1;
          } else {
            userInteractionScores.set(userData.id, {
              user: userData,
              score: 3,
              interactions: 1,
              reason: "interaction",
            });
          }
        }
      });

      return Array.from(userInteractionScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => ({ ...item, sharedCommunities: 0 }));
    } catch (err) {
      console.error("💥 Erro ao buscar sugestões baseadas em interações:", err);
      return [];
    }
  }

  /**
   * Combina e ranqueia sugestões de diferentes algoritmos
   * @param communitySuggestions - Sugestões baseadas em comunidades
   * @param interactionSuggestions - Sugestões baseadas em interações
   * @param limit - Número máximo de sugestões finais
   * @returns Array combinado e ranqueado
   */
  private static mergeAndRankSuggestions(
    communitySuggestions: Array<
      { user: any; score: number; sharedCommunities: number; reason: string }
    >,
    interactionSuggestions: Array<
      { user: any; score: number; sharedCommunities: number; reason: string }
    >,
    limit: number,
  ): Array<
    { user: any; score: number; sharedCommunities: number; reason: string }
  > {
    const combinedMap = new Map<
      string,
      { user: any; score: number; sharedCommunities: number; reason: string }
    >();

    // Adicionar sugestões de comunidade
    communitySuggestions.forEach((suggestion) => {
      combinedMap.set(suggestion.user.id, suggestion);
    });

    // Adicionar ou atualizar sugestões de interação
    interactionSuggestions.forEach((suggestion) => {
      const existing = combinedMap.get(suggestion.user.id);
      if (existing) {
        // Combinar scores se usuário já existe
        existing.score += suggestion.score;
        existing.reason = existing.sharedCommunities > 0
          ? "both"
          : "interaction";
      } else {
        combinedMap.set(suggestion.user.id, suggestion);
      }
    });

    // Converter para array, ordenar por score e limitar
    return Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Busca sugestões gerais quando o usuário não tem comunidades
   * @param userId - ID do usuário atual
   * @param limit - Número máximo de sugestões
   * @returns Promise com array de sugestões
   */
  private static async getGeneralSuggestions(
    userId: string,
    limit: number,
  ): Promise<UserSuggestion[]> {
    try {
      // Buscar creators populares (com mais posts)
      const { data: popularCreators, error } = await supabase
        .from("posts")
        .select(`
          creator_id,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            bio
          )
        `)
        .eq("is_published", true)
        .neq("creator_id", userId)
        .order("views_count", { ascending: false })
        .limit(limit * 2);

      if (error) {
        console.error("❌ Erro ao buscar creators populares:", error);
        return this.getFallbackSuggestions(limit);
      }

      // Remover duplicatas e limitar
      const uniqueCreators = new Map<string, any>();
      popularCreators?.forEach((post) => {
        if (!uniqueCreators.has(post.creator_id)) {
          uniqueCreators.set(post.creator_id, post.users);
        }
      });

      const creators = Array.from(uniqueCreators.values()).slice(0, limit);
      return this.enrichSuggestionsWithPosts(
        creators.map((creator) => ({
          user: creator,
          score: 1,
          sharedCommunities: 0,
          reason: "popular",
        })),
      );
    } catch (err) {
      console.error("💥 Erro ao buscar sugestões gerais:", err);
      return this.getFallbackSuggestions(limit);
    }
  }

  /**
   * Enriquece sugestões com informações de posts recentes
   * @param userData - Dados dos usuários com scores e razões
   * @returns Promise com sugestões enriquecidas
   */
  private static async enrichSuggestionsWithPosts(
    userData: Array<
      { user: any; score: number; sharedCommunities: number; reason: string }
    >,
  ): Promise<UserSuggestion[]> {
    const suggestions: UserSuggestion[] = [];

    for (const { user, sharedCommunities, reason } of userData) {
      try {
        // Buscar post mais recente do usuário
        const { data: latestPost, error: postError } = await supabase
          .from("posts")
          .select("title, content, published_at")
          .eq("creator_id", user.id)
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1)
          .single();

        const suggestion: UserSuggestion = {
          id: user.id,
          username: user.name || user.username || "Usuário",
          handle: `@${user.username}`,
          avatar: user.avatar_url || "https://via.placeholder.com/40x40?text=U",
          description: user.bio || undefined,
          isVerified: user.is_verified || false,
          reason: this.formatReason(reason, sharedCommunities),
        };

        if (!postError && latestPost) {
          suggestion.latestPost = latestPost.title ||
            (latestPost.content
              ? latestPost.content.substring(0, 50) + "..."
              : undefined);
        }

        suggestions.push(suggestion);
      } catch (err) {
        console.error(
          "❌ Erro ao enriquecer sugestão para usuário:",
          user.id,
          err,
        );
        // Adicionar sugestão básica mesmo com erro
        suggestions.push({
          id: user.id,
          username: user.name || user.username || "Usuário",
          handle: `@${user.username}`,
          avatar: user.avatar_url || "https://via.placeholder.com/40x40?text=U",
          isVerified: user.is_verified || false,
          reason: this.formatReason(reason, sharedCommunities),
        });
      }
    }

    return suggestions;
  }

  /**
   * Formata a razão da sugestão para exibição
   * @param reason - Tipo da razão
   * @param sharedCommunities - Número de comunidades compartilhadas
   * @returns String formatada da razão
   */
  private static formatReason(
    reason: string,
    sharedCommunities: number,
  ): string {
    switch (reason) {
      case "community":
        return `Compartilha ${sharedCommunities} comunidade(s) com você`;
      case "interaction":
        return "Interage com conteúdo similar ao seu";
      case "both":
        return `Compartilha ${sharedCommunities} comunidade(s) e interage com seu conteúdo`;
      default:
        return "Creator popular";
    }
  }

  /**
   * Retorna sugestões de fallback quando há erro
   * @param limit - Número máximo de sugestões
   * @returns Array de sugestões básicas
   */
  private static getFallbackSuggestions(limit: number): UserSuggestion[] {
    console.log("⚠️ Usando sugestões de fallback");

    return [
      {
        id: "fallback-1",
        username: "Explore Comunidades",
        handle: "@explore",
        avatar: "https://via.placeholder.com/40x40?text=E",
        description: "Descubra novas comunidades e creators",
        latestPost: "Bem-vindo ao Premiora!",
        isVerified: false,
        reason: "Sugestão do sistema",
      },
      {
        id: "fallback-2",
        username: "Creators Populares",
        handle: "@popular",
        avatar: "https://via.placeholder.com/40x40?text=P",
        description: "Veja o que está em alta",
        latestPost: "Conteúdo trending agora",
        isVerified: false,
        reason: "Sugestão do sistema",
      },
    ].slice(0, limit);
  }

  /**
   * Seguir um usuário
   * @param userId - ID do usuário atual
   * @param targetUserId - ID do usuário a ser seguido
   * @returns Promise que resolve quando a operação é concluída
   */
  static async followUser(userId: string, targetUserId: string): Promise<void> {
    try {
      await import("../followService").then((m) =>
        m.FollowService.followUser(userId, targetUserId)
      );
    } catch (error) {
      console.error("Erro ao seguir usuário:", error);
      throw error;
    }
  }

  /**
   * Deixar de seguir um usuário
   * @param userId - ID do usuário atual
   * @param targetUserId - ID do usuário a deixar de seguir
   * @returns Promise que resolve quando a operação é concluída
   */
  static async unfollowUser(
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    try {
      await import("../followService").then((m) =>
        m.FollowService.unfollowUser(userId, targetUserId)
      );
    } catch (error) {
      console.error("Erro ao deixar de seguir usuário:", error);
      throw error;
    }
  }
}
