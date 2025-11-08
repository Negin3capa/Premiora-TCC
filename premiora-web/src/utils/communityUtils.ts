/**
 * Utilitários para operações com comunidades
 * Centraliza todas as funções relacionadas ao sistema de comunidades
 */
import { supabase } from './supabaseClient';
import type { Community, CommunityMember } from '../types/community';

/**
 * Busca todas as comunidades disponíveis
 */
export async function getCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });

  if (error) {
    console.error('Erro ao buscar comunidades:', error);
    return [];
  }

  return data.map(community => ({
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
    updatedAt: community.updated_at
  }));
}

/**
 * Busca uma comunidade específica por ID
 */
export async function getCommunityById(id: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar comunidade:', error);
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
    updatedAt: data.updated_at
  };
}

/**
 * Busca uma comunidade por nome
 */
export async function getCommunityByName(name: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error('Erro ao buscar comunidade por nome:', error);
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
    updatedAt: data.updated_at
  };
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
async function uploadCommunityImage(file: File, type: 'banner' | 'avatar', communityName: string): Promise<string | null> {
  try {
    // Importar FileUploadService dinamicamente para evitar dependências circulares
    const { FileUploadService } = await import('../services/content/FileUploadService');

    // Usar o FileUploadService existente para fazer upload
    const uploadResult = await FileUploadService.uploadFile(file, 'posts', communityName);

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
    console.error('Usuário não autenticado');
    return null;
  }

  // Fazer upload das imagens se fornecidas
  let bannerUrl: string | undefined;
  let avatarUrl: string | undefined;

  if (communityData.bannerFile) {
    const uploadedBannerUrl = await uploadCommunityImage(communityData.bannerFile, 'banner', communityData.name);
    if (uploadedBannerUrl) {
      bannerUrl = uploadedBannerUrl;
    }
  }

  if (communityData.avatarFile) {
    const uploadedAvatarUrl = await uploadCommunityImage(communityData.avatarFile, 'avatar', communityData.name);
    if (uploadedAvatarUrl) {
      avatarUrl = uploadedAvatarUrl;
    }
  }

  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: communityData.name,
      display_name: communityData.displayName,
      description: communityData.description,
      cover_image_url: bannerUrl,
      avatar_url: avatarUrl,
      creator_id: user.id,
      is_private: communityData.isPrivate
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar comunidade:', error);
    return null;
  }

  // Adicionar o criador como membro
  await joinCommunity(data.id);

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
    updatedAt: data.updated_at
  };
}

/**
 * Junta-se a uma comunidade
 */
export async function joinCommunity(communityId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('Usuário não autenticado');
    return false;
  }

  // Use a transaction to insert member and update count
  const { error } = await supabase.rpc('join_community', {
    p_community_id: communityId,
    p_user_id: user.id
  });

  if (error) {
    console.error('Erro ao juntar-se à comunidade:', error);
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
    console.error('Usuário não autenticado');
    return false;
  }

  // Use a transaction to remove member and update count
  const { error } = await supabase.rpc('leave_community', {
    p_community_id: communityId,
    p_user_id: user.id
  });

  if (error) {
    console.error('Erro ao sair da comunidade:', error);
    return false;
  }

  return true;
}

/**
 * Verifica se o usuário é membro de uma comunidade
 */
export async function isCommunityMember(communityId: string, userId?: string): Promise<boolean> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return false;

  const { data, error } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', targetUserId)
    .single();

  if (error) return false;
  return !!data;
}

/**
 * Busca membros de uma comunidade
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar membros da comunidade:', error);
    return [];
  }

  return data.map(member => ({
    id: member.id,
    communityId: member.community_id,
    userId: member.user_id,
    role: member.role,
    joinedAt: member.joined_at
  }));
}

/**
 * Busca comunidades do usuário
 */
export async function getUserCommunities(userId?: string): Promise<Community[]> {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from('community_members')
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
    .eq('user_id', targetUserId);

  if (error) {
    console.error('Erro ao buscar comunidades do usuário:', error);
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
    updatedAt: item.communities.updated_at
  }));
}

/**
 * Busca comunidades por termo de pesquisa
 */
export async function searchCommunities(query: string, limit: number = 20): Promise<Community[]> {
  if (!query.trim()) {
    return getCommunities();
  }

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .or(`name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_private', false) // Only search public communities
    .order('member_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar comunidades:', error);
    return [];
  }

  return data.map(community => ({
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
    updatedAt: community.updated_at
  }));
}
