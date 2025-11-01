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
  description: string;
}
