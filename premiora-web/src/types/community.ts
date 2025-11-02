/**
 * Tipos relacionados a comunidades e funcionalidades sociais
 */

/**
 * Comunidade disponível na plataforma
 */
export interface Community {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  creatorId: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Membro de uma comunidade
 */
export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'creator' | 'moderator' | 'member';
  joinedAt: string;
}

/**
 * Tier dentro de uma comunidade
 */
export interface CommunityTier {
  id: string;
  communityId: string;
  name: string;
  description?: string;
  requiredCreatorTier?: string;
  color: string;
  permissions: Record<string, any>;
  createdAt: string;
}

/**
 * Conteúdo publicado em uma comunidade
 */
export interface CommunityContent {
  id: string;
  communityId: string;
  contentId: string;
  contentType: 'post' | 'video';
  authorId: string;
  publishedAt: string;
  isPinned: boolean;
}

/**
 * Flair de post
 */
export interface PostFlair {
  id: string;
  communityId: string;
  name: string;
  text: string;
  color: string;
  backgroundColor: string;
  minTierId?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Flair de usuário
 */
export interface UserFlair {
  id: string;
  communityId: string;
  userId: string;
  flairId: string;
  assignedBy: string;
  assignedAt: string;
}

/**
 * Tag de comunidade
 */
export interface CommunityTag {
  id: string;
  communityId: string;
  name: string;
  description?: string;
  color: string;
  isModeratorOnly: boolean;
  usageCount: number;
  createdAt: string;
}

/**
 * Tag aplicada ao conteúdo
 */
export interface ContentTag {
  id: string;
  communityId: string;
  contentId: string;
  contentType: 'post' | 'video';
  tagId: string;
  taggedBy: string;
  taggedAt: string;
}
