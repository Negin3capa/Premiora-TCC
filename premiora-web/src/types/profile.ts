/**
 * Tipos relacionados à página de perfil do criador (estilo Patreon)
 */

/**
 * Perfil do criador exibido na página de perfil
 */
export interface CreatorProfile {
  /** Nome do criador */
  name: string;

  /** Total de posts publicados */
  totalPosts: number;

  /** Descrição/biografia do criador */
  description: string;

  /** URL da imagem de banner (opcional) */
  bannerImage?: string;
}

/**
 * Post individual exibido na página de perfil
 */
export interface Post {
  /** ID único do post */
  id: string;

  /** Título do post */
  title: string;

  /** Descrição curta do post (opcional) */
  description?: string;

  /** URL da thumbnail do vídeo/post */
  thumbnailUrl: string;

  /** Data de criação no formato ISO */
  createdAt: string;

  /** Número de visualizações (opcional) */
  views?: number;

  /** Número de likes/curtidas (opcional) */
  likes?: number;

  /** Número de comentários (opcional) */
  comments?: number;

  /** Indica se o post está bloqueado (requer assinatura) */
  locked?: boolean;
}
