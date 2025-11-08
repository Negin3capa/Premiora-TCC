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
