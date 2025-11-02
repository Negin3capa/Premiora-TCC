/**
 * Utilitários para operações com comunidades
 * Centraliza todas as funções relacionadas ao sistema de comunidades
 */
import { supabase } from './supabaseClient';
import type {
  Community,
  CommunityMember,
  CommunityTier,
  CommunityContent,
  PostFlair,
  CommunityTag
} from '../types/community';

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
    bannerUrl: community.banner_url,
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
    bannerUrl: data.banner_url,
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
    bannerUrl: data.banner_url,
    avatarUrl: data.avatar_url,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    memberCount: data.member_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Cria uma nova comunidade
 */
export async function createCommunity(communityData: {
  name: string;
  displayName: string;
  description?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  isPrivate: boolean;
}): Promise<Community | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('Usuário não autenticado');
    return null;
  }

  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: communityData.name,
      display_name: communityData.displayName,
      description: communityData.description,
      banner_url: communityData.bannerUrl,
      avatar_url: communityData.avatarUrl,
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
    bannerUrl: data.banner_url,
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

  const { error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member'
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

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);

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
        banner_url,
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
    bannerUrl: item.communities.banner_url,
    avatarUrl: item.communities.avatar_url,
    creatorId: item.communities.creator_id,
    isPrivate: item.communities.is_private,
    memberCount: item.communities.member_count,
    createdAt: item.communities.created_at,
    updatedAt: item.communities.updated_at
  }));
}

/**
 * Busca tiers de uma comunidade
 */
export async function getCommunityTiers(communityId: string): Promise<CommunityTier[]> {
  const { data, error } = await supabase
    .from('community_tiers')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar tiers da comunidade:', error);
    return [];
  }

  return data.map(tier => ({
    id: tier.id,
    communityId: tier.community_id,
    name: tier.name,
    description: tier.description,
    requiredCreatorTier: tier.required_creator_tier,
    color: tier.color,
    permissions: tier.permissions,
    createdAt: tier.created_at
  }));
}

/**
 * Busca flairs de posts de uma comunidade
 */
export async function getCommunityPostFlairs(communityId: string): Promise<PostFlair[]> {
  const { data, error } = await supabase
    .from('post_flairs')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar flairs de posts:', error);
    return [];
  }

  return data.map(flair => ({
    id: flair.id,
    communityId: flair.community_id,
    name: flair.name,
    text: flair.text,
    color: flair.color,
    backgroundColor: flair.background_color,
    minTierId: flair.min_tier_id,
    createdBy: flair.created_by,
    isActive: flair.is_active,
    createdAt: flair.created_at
  }));
}

/**
 * Busca tags de uma comunidade
 */
export async function getCommunityTags(communityId: string): Promise<CommunityTag[]> {
  const { data, error } = await supabase
    .from('community_tags')
    .select('*')
    .eq('community_id', communityId)
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Erro ao buscar tags da comunidade:', error);
    return [];
  }

  return data.map(tag => ({
    id: tag.id,
    communityId: tag.community_id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    isModeratorOnly: tag.is_moderator_only,
    usageCount: tag.usage_count,
    createdAt: tag.created_at
  }));
}

/**
 * Publica conteúdo em uma comunidade
 */
export async function publishToCommunity(
  communityId: string,
  contentId: string,
  contentType: 'post' | 'video'
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('Usuário não autenticado');
    return false;
  }

  const { error } = await supabase
    .from('community_content')
    .insert({
      community_id: communityId,
      content_id: contentId,
      content_type: contentType,
      author_id: user.id
    });

  if (error) {
    console.error('Erro ao publicar conteúdo na comunidade:', error);
    return false;
  }

  return true;
}

/**
 * Busca conteúdo de uma comunidade
 */
export async function getCommunityContent(communityId: string): Promise<CommunityContent[]> {
  const { data, error } = await supabase
    .from('community_content')
    .select('*')
    .eq('community_id', communityId)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar conteúdo da comunidade:', error);
    return [];
  }

  return data.map(content => ({
    id: content.id,
    communityId: content.community_id,
    contentId: content.content_id,
    contentType: content.content_type,
    authorId: content.author_id,
    publishedAt: content.published_at,
    isPinned: content.is_pinned
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
    bannerUrl: community.banner_url,
    avatarUrl: community.avatar_url,
    creatorId: community.creator_id,
    isPrivate: community.is_private,
    memberCount: community.member_count,
    createdAt: community.created_at,
    updatedAt: community.updated_at
  }));
}
