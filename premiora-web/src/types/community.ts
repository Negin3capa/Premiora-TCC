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
  pinnedPostCount?: number;
  settings?: CommunitySettings;
}

/**
 * Membro de uma comunidade
 */
export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: "owner" | "moderator" | "member"; // Updated from 'creator'
  joinedAt: string;
}

/**
 * Regra de uma comunidade
 */
export interface CommunityRule {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  ruleOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Template de flair criado por admins
 */
export interface CommunityFlair {
  id: string;
  communityId: string;
  flairText: string;
  flairColor: string;
  flairBackgroundColor: string;
  flairType: "user" | "post";
  isModOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flair atribuído a um usuário em uma comunidade
 */
export interface UserFlair {
  id: string;
  communityId: string;
  userId: string;
  flairId?: string;
  customText?: string;
  flair?: CommunityFlair; // Populated via join
  createdAt: string;
  updatedAt: string;
}

/**
 * Flair atribuído a um post
 */
export interface PostFlair {
  id: string;
  postId: string;
  flairId: string;
  flair?: CommunityFlair; // Populated via join
  createdAt: string;
}

/**
 * Métricas em tempo real de uma comunidade
 */
export interface CommunityMetrics {
  onlineNow: number; // Users active in last 15 minutes
  activeToday: number; // Users active in last 24 hours
  activeThisWeek: number; // Users active in last 7 days
  totalPosts: number;
  totalMembers: number;
}

/**
 * Configurações de uma comunidade
 */
export interface CommunitySettings {
  allowUserFlairs: boolean;
  requirePostFlair: boolean;
  allowImagePosts: boolean;
  allowVideoPosts: boolean;
  restrictPosting: "anyone" | "members" | "approved";
}

/**
 * Métodos de ordenação de posts
 */
export type SortMethod = "hot" | "new" | "top";

/**
 * Períodos de tempo para ordenação "Top"
 */
export type TopTimePeriod = "hour" | "day" | "week" | "month" | "year" | "all";

/**
 * Parâmetros para criação de regra
 */
export interface CreateRuleData {
  title: string;
  description?: string;
  ruleOrder: number;
}

/**
 * Parâmetros para atualização de regra
 */
export interface UpdateRuleData {
  title?: string;
  description?: string;
  ruleOrder?: number;
}

/**
 * Parâmetros para criação de flair
 */
export interface CreateFlairData {
  flairText: string;
  flairColor?: string;
  flairBackgroundColor?: string;
  flairType: "user" | "post";
  isModOnly?: boolean;
}

/**
 * Parâmetros para atualização de flair
 */
export interface UpdateFlairData {
  flairText?: string;
  flairColor?: string;
  flairBackgroundColor?: string;
  isModOnly?: boolean;
}

/**
 * Parâmetros para atribuição de flair a usuário
 */
export interface AssignUserFlairData {
  flairId?: string;
  customText?: string;
}
