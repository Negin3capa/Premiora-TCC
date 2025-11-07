/**
 * Tipos relacionados ao perfil de criador na plataforma Premiora
 */

/**
 * Dados do perfil de um criador
 */
export type CreatorProfile = {
  name: string;
  totalPosts: number;
  description: string | null;
  bannerImage?: string | null; // optional background
  avatar_url?: string | null; // avatar do usuário
  username?: string | null; // username do usuário
};

/**
 * Informações de mídia anexada a um post
 */
export type MediaInfo = {
  url: string;
  path?: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
  };
};

/**
 * Estrutura de mídia para posts
 */
export type PostMedia = {
  video?: MediaInfo;
  thumbnail?: MediaInfo;
} | string; // Pode ser uma string (URL direta) ou objeto estruturado

/**
 * Dados de um post individual
 */
export type Post = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  mediaUrls?: PostMedia[]; // Array de mídias anexadas
  createdAt: string;
  views?: number;
  likes?: number;
  comments?: number;
  locked?: boolean; // for "locked" posts (like Patreon)
  contentType?: 'text' | 'image' | 'video'; // Tipo de conteúdo
};
