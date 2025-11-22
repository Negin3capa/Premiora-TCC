/**
 * Utilitários para operações com comunidades
 * Centraliza todas as funções relacionadas ao sistema de comunidades
 */
import { supabase } from "./supabaseClient";
import { supabaseAdmin } from "./supabaseAdminClient";
import type {
  Community,
  CommunityFlair,
  CommunityMember,
  UserFlair,
} from "../types/community";

/**
 * Contexto da comunidade atual
 * Usado para detectar comunidade ativa e verificar membership
 */
export interface CurrentCommunityContext {
  community: Community | null;
  isMember: boolean;
  isLoading: boolean;
}

/**
 * Busca todas as comunidades disponíveis
 */
export async function getCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("member_count", { ascending: false });

  if (error) {
    console.error("Erro ao buscar comunidades:", error);
    return [];
  }

  return data.map((community) => ({
    id: community.id,
    name: community.name,
    displayName: community.display_name,
    description: community.description,
    bannerUrl: community.cover_image_url,
    avatarUrl: community.avatar_url,
    creatorId: community.creator_id,
    isPrivate: community.is_private,
    memberCount: community.member_count,
    createdAt: community.created_at,
    updatedAt: community.updated_at,
  }));
}

/**
 * Busca uma comunidade específica por ID
 */
export async function getCommunityById(id: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar comunidade:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    description: data.description,
    bannerUrl: data.cover_image_url,
    avatarUrl: data.avatar_url,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    memberCount: data.member_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Busca uma comunidade por nome
 */
export async function getCommunityByName(
  name: string,
): Promise<Community | null> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("name", name)
    .single();

  if (error) {
    console.error("Erro ao buscar comunidade por nome:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    description: data.description,
    bannerUrl: data.cover_image_url,
    avatarUrl: data.avatar_url,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    memberCount: data.member_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
async function uploadCommunityImage(
  file: File,
  type: "banner" | "avatar",
  communityName: string,
): Promise<string | null> {
  try {
    // Importar FileUploadService dinamicamente para evitar dependências circulares
    const { FileUploadService } = await import(
      "../services/content/FileUploadService"
    );

    // Usar o FileUploadService existente para fazer upload
    const uploadResult = await FileUploadService.uploadFile(
      file,
      "posts",
      communityName,
    );

    return uploadResult.url;
  } catch (error) {
    console.error(`Erro ao fazer upload da imagem ${type}:`, error);
    return null;
  }
}

/**
 * Cria uma nova comunidade
 */
export async function createCommunity(communityData: {
  name: string;
  displayName: string;
  description?: string;
  bannerFile?: File | null;
  avatarFile?: File | null;
  isPrivate: boolean;
}): Promise<Community | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");
    return null;
  }

  // Primeiro, buscar dados do usuário (necessários para criar o creator se necessário)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("name, username, avatar_url, is_creator")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Erro ao buscar dados do usuário:", userError);
    return null;
  }

  // Verificar se o usuário tem um registro de creator
  const { data: existingCreator, error: creatorCheckError } = await supabase
    .from("creators")
    .select("id")
    .eq("id", user.id)
    .single();

  if (creatorCheckError && creatorCheckError.code !== "PGRST116") {
    // PGRST116 = no rows returned, which is expected
    console.error("Erro ao verificar creator:", creatorCheckError);
    return null;
  }

  // Se não existe creator, criar um automaticamente
  if (!existingCreator) {
    console.log(
      "Criando registro de creator para usuário ao criar comunidade:",
      user.id,
    );

    const { error: createCreatorError } = await supabaseAdmin
      .from("creators")
      .insert({
        id: user.id,
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
      console.error("Erro ao criar creator:", createCreatorError);
      return null;
    }

    // Atualizar o usuário para marcar como creator
    await supabase
      .from("users")
      .update({ is_creator: true })
      .eq("id", user.id);
  }

  // Fazer upload das imagens se fornecidas
  let bannerUrl: string | undefined;
  let avatarUrl: string | undefined;

  if (communityData.bannerFile) {
    const uploadedBannerUrl = await uploadCommunityImage(
      communityData.bannerFile,
      "banner",
      communityData.name,
    );
    if (uploadedBannerUrl) {
      bannerUrl = uploadedBannerUrl;
    }
  }

  if (communityData.avatarFile) {
    const uploadedAvatarUrl = await uploadCommunityImage(
      communityData.avatarFile,
      "avatar",
      communityData.name,
    );
    if (uploadedAvatarUrl) {
      avatarUrl = uploadedAvatarUrl;
    }
  }

  const { data, error } = await supabase
    .from("communities")
    .insert({
      name: communityData.name,
      display_name: communityData.displayName,
      description: communityData.description,
      cover_image_url: bannerUrl,
      avatar_url: avatarUrl,
      creator_id: user.id,
      is_private: communityData.isPrivate,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar comunidade:", error);

    // Verificar se é erro de duplicata de nome
    if (error.code === "23505" && error.message.includes("name")) {
      console.error("Nome da comunidade já existe");
      // Este erro deve ser tratado na validação do frontend
    }

    return null;
  }

  // Adicionar o criador como membro diretamente (evitando RPC que pode falhar)
  try {
    await supabase
      .from("community_members")
      .insert({
        community_id: data.id,
        user_id: user.id,
        role: "owner", // O criador deve ser owner, não member
      });
  } catch (memberError) {
    console.error("Erro ao adicionar criador como membro:", memberError);
    // Mesmo se falhar, continuamos pois a comunidade foi criada
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    description: data.description,
    bannerUrl: data.cover_image_url,
    avatarUrl: data.avatar_url,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    memberCount: data.member_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Junta-se a uma comunidade
 */
export async function joinCommunity(communityId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");
    return false;
  }

  // Use a transaction to insert member and update count
  const { error } = await supabase.rpc("join_community", {
    p_community_id: communityId,
    p_user_id: user.id,
  });

  if (error) {
    console.error("Erro ao juntar-se à comunidade:", error);
    return false;
  }

  return true;
}

/**
 * Sai de uma comunidade
 */
export async function leaveCommunity(communityId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");
    return false;
  }

  // Use a transaction to remove member and update count
  const { error } = await supabase.rpc("leave_community", {
    p_community_id: communityId,
    p_user_id: user.id,
  });

  if (error) {
    console.error("Erro ao sair da comunidade:", error);
    return false;
  }

  return true;
}

/**
 * Verifica se o usuário é membro de uma comunidade
 */
export async function isCommunityMember(
  communityId: string,
  userId?: string,
): Promise<boolean> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return false;

  const { data, error } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", targetUserId)
    .single();

  if (error) return false;
  return !!data;
}

/**
 * Busca membros de uma comunidade
 */
export async function getCommunityMembers(
  communityId: string,
): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from("community_members")
    .select("*")
    .eq("community_id", communityId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar membros da comunidade:", error);
    return [];
  }

  return data.map((member) => ({
    id: member.id,
    communityId: member.community_id,
    userId: member.user_id,
    role: member.role,
    joinedAt: member.joined_at,
  }));
}

/**
 * Busca comunidades do usuário
 */
export async function getUserCommunities(
  userId?: string,
): Promise<Community[]> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from("community_members")
    .select(`
      communities (
        id,
        name,
        display_name,
        description,
        cover_image_url,
        avatar_url,
        creator_id,
        is_private,
        member_count,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("Erro ao buscar comunidades do usuário:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.communities.id,
    name: item.communities.name,
    displayName: item.communities.display_name,
    description: item.communities.description,
    bannerUrl: item.communities.cover_image_url,
    avatarUrl: item.communities.avatar_url,
    creatorId: item.communities.creator_id,
    isPrivate: item.communities.is_private,
    memberCount: item.communities.member_count,
    createdAt: item.communities.created_at,
    updatedAt: item.communities.updated_at,
  }));
}

/**
 * Busca comunidades por termo de pesquisa
 */
export async function searchCommunities(
  query: string,
  limit: number = 20,
): Promise<Community[]> {
  if (!query.trim()) {
    return getCommunities();
  }

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .or(
      `name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`,
    )
    .eq("is_private", false) // Only search public communities
    .order("member_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar comunidades:", error);
    return [];
  }

  return data.map((community) => ({
    id: community.id,
    name: community.name,
    displayName: community.display_name,
    description: community.description,
    bannerUrl: community.cover_image_url,
    avatarUrl: community.avatar_url,
    creatorId: community.creator_id,
    isPrivate: community.is_private,
    memberCount: community.member_count,
    createdAt: community.created_at,
    updatedAt: community.updated_at,
  }));
}

/**
 * Obtém o contexto da comunidade atual baseada na URL
 * Usado para detectar automaticamente a comunidade ao abrir modais de criação
 */
export async function getCurrentCommunityContext(
  pathname?: string,
): Promise<CurrentCommunityContext> {
  // Se não foi fornecido pathname, usar o atual
  const currentPath = pathname || window.location.pathname;

  // Verificar se estamos em uma página de comunidade (padrão: /r/:communityName)
  const communityMatch = currentPath.match(/^\/r\/([^/]+)/);
  if (!communityMatch) {
    return { community: null, isMember: false, isLoading: false };
  }

  const communityName = communityMatch[1];
  if (!communityName) {
    return { community: null, isMember: false, isLoading: false };
  }

  const community = await getCommunityByName(communityName);
  if (!community) {
    return { community: null, isMember: false, isLoading: false };
  }

  const isMember = await isCommunityMember(community.id);

  return {
    community,
    isMember,
    isLoading: false,
  };
}

/**
 * Check if user is a community admin (owner or moderator)
 * @param communityId - Community ID
 * @param userId - User ID (optional, defaults to current user)
 * @returns Promise<boolean>
 */
export async function isCommunityAdmin(
  communityId: string,
  userId?: string,
): Promise<boolean> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return false;

  try {
    const { data, error } = await supabase.rpc("is_community_admin", {
      p_community_id: communityId,
      p_user_id: targetUserId,
    });

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}

/**
 * Get user's role in a community
 * @param communityId - Community ID
 * @param userId - User ID (optional, defaults to current user)
 * @returns Promise<'owner' | 'moderator' | 'member' | null>
 */
export async function getUserCommunityRole(
  communityId: string,
  userId?: string,
): Promise<"owner" | "moderator" | "member" | null> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return null;

  const { data, error } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", targetUserId)
    .single();

  if (error) return null;

  // Map 'creator' to 'owner' for backwards compatibility
  if (data.role === "creator") return "owner";

  return data.role as "owner" | "moderator" | "member";
}

/**
 * Update community information (admin only)
 * @param communityId - Community ID
 * @param updateData - Data to update
 * @returns Promise<Community | null>
 */
export async function updateCommunity(
  communityId: string,
  updateData: {
    displayName?: string;
    description?: string;
    bannerFile?: File | null;
    avatarFile?: File | null;
    isPrivate?: boolean;
    settings?: any;
  },
): Promise<Community | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  // Check if user is admin
  const isAdmin = await isCommunityAdmin(communityId, user.id);
  if (!isAdmin) {
    console.error("User is not a community admin");
    return null;
  }

  // Get community name for image uploads
  const community = await getCommunityById(communityId);
  if (!community) {
    console.error("Community not found");
    return null;
  }

  // Upload images if provided
  let bannerUrl: string | undefined;
  let avatarUrl: string | undefined;

  if (updateData.bannerFile) {
    const uploadedBannerUrl = await uploadCommunityImage(
      updateData.bannerFile,
      "banner",
      community.name,
    );
    if (uploadedBannerUrl) {
      bannerUrl = uploadedBannerUrl;
    }
  }

  if (updateData.avatarFile) {
    const uploadedAvatarUrl = await uploadCommunityImage(
      updateData.avatarFile,
      "avatar",
      community.name,
    );
    if (uploadedAvatarUrl) {
      avatarUrl = uploadedAvatarUrl;
    }
  }

  // Build update payload
  const updatePayload: any = {};
  if (updateData.displayName !== undefined) {
    updatePayload.display_name = updateData.displayName;
  }
  if (updateData.description !== undefined) {
    updatePayload.description = updateData.description;
  }
  if (bannerUrl) updatePayload.cover_image_url = bannerUrl;
  if (avatarUrl) updatePayload.avatar_url = avatarUrl;
  if (updateData.isPrivate !== undefined) {
    updatePayload.is_private = updateData.isPrivate;
  }
  if (updateData.settings !== undefined) {
    updatePayload.settings = updateData.settings;
  }

  const { data, error } = await supabase
    .from("communities")
    .update(updatePayload)
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Error updating community:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    description: data.description,
    bannerUrl: data.cover_image_url,
    avatarUrl: data.avatar_url,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    memberCount: data.member_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    settings: data.settings,
  };
}

/**
 * Pin or unpin a post in a community
 * @param postId - Post ID
 * @returns Promise<boolean> - New pinned status
 */
export async function togglePinPost(postId: string): Promise<boolean | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  try {
    const { data, error } = await supabase.rpc("toggle_pin_post", {
      p_post_id: postId,
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error toggling pin status:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to toggle pin status:", error);
    return null;
  }
}

/**
 * Get pinned posts for a community
 * @param communityName - Community name (slug)
 * @returns Promise<any[]>
 */
export async function getPinnedPosts(communityName: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
        )
      `)
      .eq("is_pinned", true)
      .eq("is_published", true)
      .eq(
        "community_id",
        supabase
          .from("communities")
          .select("id")
          .eq("name", communityName)
          .single(),
      )
      .order("pinned_at", { ascending: false });

    if (error) {
      console.error("Error fetching pinned posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch pinned posts:", error);
    return [];
  }
}

/**
 * Get pinned posts by community ID
 * @param communityId - Community ID
 * @returns Promise<any[]>
 */
export async function getPinnedPostsByCommunityId(
  communityId: string,
): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
        )
      `)
      .eq("community_id", communityId)
      .eq("is_pinned", true)
      .eq("is_published", true)
      .order("pinned_at", { ascending: false });

    if (error) {
      console.error("Error fetching pinned posts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch pinned posts:", error);
    return [];
  }
}

/**
 * Get flairs for a community
 * @param communityId - Community ID
 * @param type - Flair type (post or user)
 * @returns Promise<CommunityFlair[]>
 */
export async function getCommunityFlairs(
  communityId: string,
  type: "post" | "user" = "post",
): Promise<CommunityFlair[]> {
  const { data, error } = await supabase
    .from("community_flairs")
    .select("*")
    .eq("community_id", communityId)
    .eq("flair_type", type)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching community flairs:", error);
    return [];
  }

  return data.map((flair) => ({
    id: flair.id,
    communityId: flair.community_id,
    flairText: flair.flair_text,
    flairColor: flair.flair_color,
    flairBackgroundColor: flair.flair_background_color,
    flairType: flair.flair_type,
    isModOnly: flair.is_mod_only,
    createdAt: flair.created_at,
    updatedAt: flair.updated_at,
  }));
}

/**
 * Get user's flair in a community
 */
export async function getUserCommunityFlair(
  communityId: string,
  userId: string,
): Promise<UserFlair | null> {
  const { data, error } = await supabase
    .from("user_flairs")
    .select(
      `
      *,
      flair:flair_id (*)
    `,
    )
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching user flair:", error);
    }
    return null;
  }

  // Map to UserFlair interface
  return {
    id: data.id,
    communityId: data.community_id,
    userId: data.user_id,
    flairId: data.flair_id,
    customText: data.custom_text,
    flair: data.flair
      ? {
        id: data.flair.id,
        communityId: data.flair.community_id,
        flairText: data.flair.flair_text,
        flairColor: data.flair.flair_color,
        flairBackgroundColor: data.flair.flair_background_color,
        flairType: data.flair.flair_type,
        isModOnly: data.flair.is_mod_only,
        createdAt: data.flair.created_at,
        updatedAt: data.flair.updated_at,
      }
      : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update user's flair in a community
 */
export async function updateUserCommunityFlair(
  communityId: string,
  userId: string,
  flairId: string,
): Promise<boolean> {
  // Check if user already has a flair assignment
  const { data: existing } = await supabase
    .from("user_flairs")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Update
    const { error } = await supabase
      .from("user_flairs")
      .update({ flair_id: flairId || null })
      .eq("id", existing.id);
    return !error;
  } else {
    // Insert
    const { error } = await supabase
      .from("user_flairs")
      .insert({
        community_id: communityId,
        user_id: userId,
        flair_id: flairId || null,
      });
    return !error;
  }
}
