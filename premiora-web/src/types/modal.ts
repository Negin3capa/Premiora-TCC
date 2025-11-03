/**
 * Tipos relacionados ao gerenciamento centralizado de modais
 */

/**
 * Tipos de modal disponíveis no sistema
 */
export type ModalType =
  | 'createPost'
  | 'createVideo'
  | 'createCommunity'
  | 'postView'
  | 'videoView'
  | 'createContent';

/**
 * Estado de um modal individual
 */
export interface ModalState {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Dados específicos do modal (opcional) */
  data?: any;
}

/**
 * Estado global de todos os modais
 */
export interface ModalContextState {
  /** Estados de cada modal */
  modals: Record<ModalType, ModalState>;
}

/**
 * Ações disponíveis para gerenciamento de modais
 */
export interface ModalActions {
  /** Abre um modal específico */
  openModal: (type: ModalType, data?: any) => void;
  /** Fecha um modal específico */
  closeModal: (type: ModalType) => void;
  /** Fecha todos os modais */
  closeAllModals: () => void;
  /** Verifica se um modal está aberto */
  isModalOpen: (type: ModalType) => boolean;
  /** Obtém dados de um modal */
  getModalData: (type: ModalType) => any;
}

/**
 * Interface completa do contexto de modais
 */
export interface ModalContextType extends ModalContextState, ModalActions {}

/**
 * Dados para criação de post via modal
 */
export interface CreatePostModalData {
  communityId?: string;
  initialContent?: string;
}

/**
 * Dados para criação de vídeo via modal
 */
export interface CreateVideoModalData {
  communityId?: string;
  initialTitle?: string;
}

/**
 * Dados para visualização de post
 */
export interface PostViewModalData {
  postId: string;
  communityId?: string;
}

/**
 * Dados para visualização de vídeo
 */
export interface VideoViewModalData {
  videoId: string;
  communityId?: string;
}

/**
 * Dados para criação de comunidade
 */
export interface CreateCommunityModalData {
  initialName?: string;
  initialDescription?: string;
}

/**
 * Dados para modal de criação de conteúdo genérico
 */
export interface CreateContentModalData {
  contentType: 'post' | 'video' | 'community';
  communityId?: string;
}
