/**
 * Serviço de gerenciamento de posts
 * Responsável por operações CRUD de posts
 */
import { supabase } from "../../utils/supabaseClient";
import { supabaseAdmin } from "../../utils/supabaseAdminClient";
import { FileUploadService } from "./FileUploadService";
import type { PostFormData } from "../../types/content";

/**
 * Classe de serviço para operações de posts
 */
export class PostService {
  /**
   * Cria um novo post no banco de dados
   * @param postData - Dados do post
   * @param userId - ID do usuário (será convertido para creator_id)
   * @returns Promise com dados do post criado
   */
  static async createPost(
    postData: PostFormData,
    userId: string,
  ): Promise<any> {
    let mediaUrls: string[] = [];

    // Upload de imagens se existirem
    if (postData.images && postData.images.length > 0) {
      try {
        const uploadPromises = postData.images.map((file) =>
          FileUploadService.uploadFile(file, "posts", userId)
        );

        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map((result) => result.url);
      } catch (error) {
        console.warn(
          "Erro no upload de imagens (continuando sem imagens):",
          error,
        );
        // Não falhar a criação do post se o upload falhar
      }
    }

    // Primeiro, buscar dados do usuário (sempre necessário para o username)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, username, avatar_url")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
    }

    // Verificar se o usuário tem um registro de creator
    let creatorId = userId;

    const { data: existingCreator, error: creatorCheckError } = await supabase
      .from("creators")
      .select("id")
      .eq("id", userId)
      .single();

    if (creatorCheckError && creatorCheckError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is expected
      throw new Error(
        `Erro ao verificar creator: ${creatorCheckError.message}`,
      );
    }

    // Se não existe creator, criar um automaticamente
    if (!existingCreator) {
      console.log("Criando registro de creator para usuário:", userId);

      // Usar admin client para criar creator (bypassing RLS if needed, though users can create their own)
      // Mas para garantir, vamos usar o admin como era antes
      const { error: createCreatorError } = await supabaseAdmin
        .from("creators")
        .insert({
          id: userId,
          display_name: userData.name || userData.username || "Usuário",
          bio: null,
          profile_image_url: userData.avatar_url,
          cover_image_url: null,
          website: null,
          social_links: {},
          is_active: true,
          total_subscribers: 0,
          total_earnings: 0,
        });

      if (createCreatorError) {
        throw new Error(`Erro ao criar creator: ${createCreatorError.message}`);
      }

      // Atualizar o usuário para marcar como creator (usando admin para garantir)
      await supabaseAdmin
        .from("users")
        .update({ is_creator: true })
        .eq("id", userId);
    }

    // Agora inserir o post

    const isPremium = postData.visibility === "subscribers" ||
      postData.visibility === "tier";

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: postData.title,
        content: postData.content,
        content_type: mediaUrls.length > 0 ? "image" : "text",
        media_urls: mediaUrls,
        community_id: postData.communityId || null,
        creator_id: creatorId,
        username: userData.username, // Foreign key direta para users.username
        is_premium: isPremium,
        required_tier_id: postData.requiredTierId || null,
        is_published: true,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Erro ao criar post: ${error.message}`);
    }

    // Insert flair if provided
    if (postData.flairId) {
      const { error: flairError } = await supabase.from("post_flairs").insert({
        post_id: data.id,
        flair_id: postData.flairId,
      });
      if (flairError) {
        console.error("Erro ao adicionar flair ao post:", flairError);
      }
    }

    // Fetch full post data
    const { data: fullPost, error: fetchError } = await supabase
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
        post_flairs (
            community_flairs (
              flair_text,
              flair_color,
              flair_background_color
            )
        )
      `)
      .eq("id", data.id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar post criado: ${fetchError.message}`);
    }

    return fullPost;
  }

  /**
   * Busca um post específico por ID
   * @param postId - ID do post
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com dados do post
   */
  static async getPostById(postId: string, userId?: string): Promise<any> {
    // Busca o post usando admin client para garantir acesso a dados premium para verificação
    let { data: post, error } = await supabaseAdmin
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
        required_tier:required_tier_id (
          id,
          name,
          tier_order
        )
      `)
      .eq("id", postId)
      .eq("is_published", true)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar post: ${error.message}`);
    }

    // Se o post não é premium, retorna direto
    if (!post.is_premium) {
      return post;
    }

    // Se é premium e usuário é o criador, retorna direto
    if (userId && post.creator_id === userId) {
      return post;
    }

    // Verificação de acesso para usuários inscritos
    let hasAccess = false;

    if (userId) {
      // Check subscriptions
      const { data: userSubs } = await supabase
        .from("user_subscriptions")
        .select("plan_id")
        .eq("user_id", userId)
        .eq("status", "active");

      const planIds = userSubs?.map((s) => s.plan_id) || [];

      if (planIds.length > 0) {
        const requiredTierOrder = post.required_tier?.tier_order || 0;
        // Fetch tiers
        const { data: tiers } = await supabase
          .from("subscription_tiers")
          .select("id, tier_order, creator_channel_id")
          .in("id", planIds)
          .eq("creator_channel_id", post.creator_id);

        if (tiers && tiers.some((t) => t.tier_order >= requiredTierOrder)) {
          hasAccess = true;
        }
      }
    }

    // Se não tem acesso, sanitizar o conteúdo
    if (!hasAccess) {
      return {
        ...post,
        content: null, // Remove conteúdo
        media_urls: [], // Remove mídia
        isLocked: true, // Flag para UI
        requiredTier: post.required_tier?.name, // Nome do tier para UI
      };
    }

    return post;
  }

  /**
   * Atualiza um post existente
   * @param postId - ID do post
   * @param updateData - Dados para atualizar
   * @param userId - ID do usuário (para verificação de permissão)
   * @returns Promise com dados do post atualizado
   */
  static async updatePost(
    postId: string,
    updateData: Partial<PostFormData>,
    userId: string,
  ): Promise<any> {
    // Verificar se o usuário é o criador do post
    const { data: existingPost, error: checkError } = await supabase
      .from("posts")
      .select("creator_id, media_urls, content_type, community_id")
      .eq("id", postId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar permissões: ${checkError.message}`);
    }

    if (existingPost.creator_id !== userId) {
      throw new Error("Você não tem permissão para editar este post");
    }

    let mediaUrls = existingPost.media_urls || [];

    // Upload de novas imagens se fornecidas
    if (updateData.images && updateData.images.length > 0) {
      try {
        const uploadPromises = updateData.images.map((file) =>
          FileUploadService.uploadFile(file, "posts", userId)
        );

        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map((result) => result.url);
      } catch (error) {
        console.warn("Erro no upload das novas imagens:", error);
      }
    }

    // Update flair if provided
    if (updateData.flairId !== undefined) {
      // Remove existing flair
      await supabase.from("post_flairs").delete().eq("post_id", postId);

      // Add new flair if not empty string
      if (updateData.flairId) {
        await supabase.from("post_flairs").insert({
          post_id: postId,
          flair_id: updateData.flairId,
        });
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        title: updateData.title,
        content: updateData.content,
        content_type: (updateData.images && updateData.images.length > 0)
          ? "image"
          : existingPost.content_type,
        media_urls: mediaUrls,
        community_id: updateData.communityId || existingPost.community_id,
        is_premium: updateData.visibility
          ? (updateData.visibility === "subscribers" ||
            updateData.visibility === "tier")
          : undefined,
        required_tier_id: updateData.requiredTierId !== undefined
          ? updateData.requiredTierId
          : undefined,
      })
      .eq("id", postId)
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
        post_flairs (
            community_flairs (
              flair_text,
              flair_color,
              flair_background_color
            )
        )

      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar post: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove um post
   * @param postId - ID do post
   * @param userId - ID do usuário (para verificação de permissão)
   * @returns Promise void
   */
  static async deletePost(postId: string, userId: string): Promise<void> {
    // Verificar se o usuário é o criador do post
    const { data: existingPost, error: checkError } = await supabase
      .from("posts")
      .select("creator_id")
      .eq("id", postId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar permissões: ${checkError.message}`);
    }

    if (existingPost.creator_id !== userId) {
      throw new Error("Você não tem permissão para excluir este post");
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      throw new Error(`Erro ao excluir post: ${error.message}`);
    }
  }
}
