/**
 * Tipos relacionados ao perfil de criador na plataforma Premiora
 */

/**
 * Dados do perfil de um criador
 */
export type CreatorProfile = {
  name: string;
  totalPosts: number;
  description: string;
  bannerImage?: string; // optional background
};

/**
 * Dados de um post individual
 */
export type Post = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  createdAt: string;
  views?: number;
  likes?: number;
  comments?: number;
  locked?: boolean; // for "locked" posts (like Patreon)
};
