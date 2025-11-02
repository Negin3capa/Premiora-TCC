/**
 * Tipos relacionados ao conteúdo da plataforma Premiora
 */

/**
 * Tipos de conteúdo suportados na plataforma
 */
export type ContentType = 'profile' | 'video' | 'post';

/**
 * Níveis de acesso para conteúdo (similar ao Patreon)
 */
export type AccessLevel = 'public' | 'supporters' | 'premium';

/**
 * Item de conteúdo exibido no feed
 */
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail?: string;
  content?: string;
  views?: number;
  likes?: number;
  timestamp: string;
  // Propriedades para controle de acesso Patreon-like
  accessLevel?: AccessLevel;
  isLocked?: boolean;
  previewContent?: string; // Conteúdo preview para posts bloqueados
  requiredTier?: string; // Nome do tier necessário
  fullContent?: string; // Conteúdo completo (só para usuários autorizados)
  // Propriedades de comunidade
  communityId?: string;
  communityName?: string;
  communityAvatar?: string;
  // Propriedades de flairs e tags
  postFlair?: PostFlair;
  userFlairs?: (UserFlair & { flair?: PostFlair })[];
  tags?: CommunityTag[];
  // Propriedades de engajamento da comunidade
  communityLikes?: number;
  communityComments?: number;
  isPinned?: boolean;
}

/**
 * Dados do formulário de criação de post
 */
export interface PostFormData {
  title: string;
  content: string;
  communityId?: string;
  image?: File | null;
}

/**
 * Dados do formulário de criação de vídeo
 */
export interface VideoFormData {
  title: string;
  description: string;
  communityId?: string;
  video?: File | null;
  thumbnail?: File | null;
}

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
