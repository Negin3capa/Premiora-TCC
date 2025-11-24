/**
 * Tipos relacionados ao conteúdo da plataforma Premiora
 */

/**
 * Tipos de conteúdo suportados na plataforma
 */
export type ContentType = "profile" | "video" | "post";

/**
 * Níveis de acesso para conteúdo (similar ao Patreon)
 */
export type AccessLevel = "public" | "supporters" | "premium";

/**
 * Item de conteúdo exibido no feed
 */
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  author: string;
  authorUsername?: string; // Username real da tabela users
  authorAvatar: string;
  thumbnail?: string;
  mediaUrls?: string[];
  content?: string;
  views?: number;
  likes?: number;
  comments?: number;
  timestamp: string;
  // Propriedades para controle de acesso Patreon-like
  accessLevel?: AccessLevel;
  isLocked?: boolean;
  previewContent?: string; // Conteúdo preview para posts bloqueados
  requiredTier?: string; // Nome do tier necessário
  requiredTierId?: string; // ID do tier necessário
  fullContent?: string; // Conteúdo completo (só para usuários autorizados)
  // Propriedades de comunidade
  communityId?: string;
  communityName?: string; // URL slug (name field from database)
  communityDisplayName?: string; // Human-readable name (display_name field)
  communityAvatar?: string;
  // Propriedades de engajamento da comunidade
  communityLikes?: number;
  communityComments?: number;
  isPinned?: boolean;
  flair?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  // Propriedades específicas para vídeos
  videoUrl?: string;
  duration?: number;
  resolution?: string;
  fileSize?: number;
  creatorId?: string;
}

/**
 * Dados do formulário de criação de post
 */
export interface PostFormData {
  title: string;
  content: string;
  communityId?: string;
  flairId?: string;
  images?: File[]; // Array de imagens/GIFs
  visibility?: 'public' | 'subscribers' | 'tier'; // Nível de visibilidade
  requiredTierId?: string; // ID do tier específico se visibility == 'tier'
}

/**
 * Dados do formulário de criação de vídeo
 */
export interface VideoFormData {
  title: string;
  description: string;
  communityId?: string;
  video?: File | null;
  youtubeUrl?: string;
  thumbnail?: File | null;
  visibility?: 'public' | 'subscribers' | 'tier';
  requiredTierId?: string;
}

/**
 * Interface para um comentário de post
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string | null; // Para comentários aninhados
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  // Dados expandidos do usuário (preenchidos por query)
  author: {
    username: string;
    name?: string;
    avatarUrl?: string;
  };
  // Para comentários aninhados
  replies?: Comment[];
  // Metadados para UI
  depth?: number; // Profundidade na árvore de comentários
  isAuthor?: boolean; // Se o usuário atual é o autor do comentário
}

/**
 * Dados para criação de um novo comentário
 */
export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string; // Para respostas a comentários
}

/**
 * Dados para atualização de comentário
 */
export interface UpdateCommentData {
  content: string;
}

/**
 * Filtros para busca de comentários
 */
export interface CommentFilters {
  postId: string;
  parentCommentId?: string | null; // null para comentários raiz, string para respostas
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

/**
 * Estatísticas de comentários para um post
 */
export interface CommentStats {
  totalComments: number;
  topLevelComments: number; // Comentários raiz (não respostas)
  lastCommentAt?: string;
}

/**
 * Opções de ordenação para feeds
 */
export type SortOption = "hot" | "new" | "top";

/**
 * Filtros de tempo para ordenação "Top"
 */
export type TimeRange = "all" | "year" | "month" | "week" | "day";
