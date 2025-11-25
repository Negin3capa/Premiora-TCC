/**
 * Serviço de gerenciamento de likes em posts
 * Responsável por dar, tirar e verificar likes
 */
import { supabase } from "../../utils/supabaseClient";

/**
 * Classe de serviço para operações de likes
 */
export class LikeService {
  /**
   * Da ou remove like de um post
   * @param postId - ID do post
   * @param userId - ID do usuário
   * @returns Promise com status da operação e novo estado do like
   */
  static async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    // Verificar se já existe um like deste usuário no post
    const { data: existingLike, error: checkError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      throw new Error(
        `Erro ao verificar like existente: ${checkError.message}`,
      );
    }

    let liked: boolean;
    let likeCount: number;

    if (existingLike) {
      // Remover like existente
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error(`Erro ao remover like: ${deleteError.message}`);
      }

      liked = false;
    } else {
      // Adicionar novo like
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (insertError) {
        // Verificar se o erro é de constraint único (já existe like)
        if (insertError.code === "23505") {
          // Talvez houve uma condição de corrida, tentar remover
          await this.toggleLike(postId, userId);
          return this.toggleLike(postId, userId);
        }
        throw new Error(`Erro ao dar like: ${insertError.message}`);
      }

      liked = true;
    }

    // Obter o contador atualizado de likes
    const { data: postData, error: countError } = await supabase
      .from("posts")
      .select("like_count")
      .eq("id", postId)
      .single();

    if (countError) {
      throw new Error(`Erro ao obter contador de likes: ${countError.message}`);
    }

    likeCount = postData.like_count || 0;

    return { liked, likeCount };
  }

  /**
   * Verifica se um usuário deu like em um post
   * @param postId - ID do post
   * @param userId - ID do usuário
   * @returns Promise<boolean> true se deu like, false caso contrário
   */
  static async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao verificar like: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Obtém likes de um post específico (com dados dos usuários)
   * @param postId - ID do post
   * @param limit - Número máximo de likes a retornar
   * @returns Promise com array de likes e dados dos usuários
   */
  static async getPostLikes(
    postId: string,
    limit: number = 50,
  ): Promise<
    Array<{
      id: string;
      user_id: string;
      created_at: string;
      user: {
        username: string;
        avatar_url?: string;
        name?: string;
      };
    }>
  > {
    const { data, error } = await supabase
      .from("post_likes")
      .select(`
        id,
        user_id,
        created_at
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar likes do post: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Buscar dados dos usuários separadamente
    const userIds = data.map((like) => like.user_id);
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, avatar_url, name")
      .in("id", userIds);

    if (usersError) {
      throw new Error(
        `Erro ao buscar dados dos usuários: ${usersError.message}`,
      );
    }

    // Criar mapa de usuários para acesso rápido
    const userMap = new Map(
      (usersData || []).map((user) => [user.id, user]),
    );

    // Combinar dados
    return data.map((like) => {
      const user = userMap.get(like.user_id);
      return {
        id: like.id,
        user_id: like.user_id,
        created_at: like.created_at,
        user: {
          username: user?.username || "",
          avatar_url: user?.avatar_url,
          name: user?.name,
        },
      };
    });
  }

  /**
   * Incrementa contador de visualizações de um post
   * @param postId - ID do post
   * @returns Promise com novo contador de visualizações
   */
  static async incrementViewCount(postId: string): Promise<number> {
    const { data, error } = await supabase.rpc("increment_post_view", {
      post_id: postId,
    });

    if (error) {
      // Fallback: tentar atualização manual se a função não existe
      console.warn(
        "Função increment_post_view não encontrada, usando fallback manual",
      );

      const { data: currentData, error: selectError } = await supabase
        .from("posts")
        .select("view_count")
        .eq("id", postId)
        .single();

      if (selectError) {
        throw new Error(
          `Erro ao buscar contador atual: ${selectError.message}`,
        );
      }

      const newViewCount = (currentData?.view_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("posts")
        .update({ view_count: newViewCount })
        .eq("id", postId);

      if (updateError) {
        throw new Error(
          `Erro ao incrementar visualizações: ${updateError.message}`,
        );
      }

      return newViewCount;
    }

    return data;
  }
}
