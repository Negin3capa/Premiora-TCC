import { useContext } from 'react';
import { ModalContext } from '../contexts/ModalContext';
import type { ModalContextType, ModalType } from '../types/modal';

/**
 * Hook personalizado para acesso ao contexto de modais
 * Fornece acesso centralizado às funções de gerenciamento de modais
 *
 * @returns Contexto de modais com todas as funções disponíveis
 * @throws Error se usado fora do ModalProvider
 *
 * @example
 * ```typescript
 * const { openModal, closeModal, isModalOpen } = useModal();
 *
 * // Abrir modal de criação de post
 * openModal('createPost', { communityId: '123' });
 *
 * // Verificar se modal está aberto
 * if (isModalOpen('createPost')) {
 *   // Modal está aberto
 * }
 *
 * // Fechar modal
 * closeModal('createPost');
 * ```
 */
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }

  return context;
};

/**
 * Hook específico para um tipo de modal
 * Retorna estado e ações específicas para um modal
 *
 * @param type - Tipo do modal
 * @returns Estado e ações do modal específico
 *
 * @example
 * ```typescript
 * const { isOpen, data, open, close } = useModalState('createPost');
 *
 * // Verificar se modal está aberto
 * if (isOpen) {
 *   // Modal está aberto
 * }
 *
 * // Abrir modal com dados
 * open({ communityId: '123' });
 *
 * // Fechar modal
 * close();
 * ```
 */
export const useModalState = (type: ModalType) => {
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();

  return {
    /** Indica se o modal está aberto */
    isOpen: isModalOpen(type),
    /** Dados do modal */
    data: getModalData(type),
    /** Função para abrir o modal */
    open: (data?: any) => openModal(type, data),
    /** Função para fechar o modal */
    close: () => closeModal(type),
  };
};
