/**
 * Tipos relacionados ao conteúdo da plataforma Premiora
 */

/**
 * Tipos de conteúdo suportados na plataforma
 */
export type ContentType = 'profile' | 'video' | 'post' | 'live';

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
  isLive?: boolean;
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
