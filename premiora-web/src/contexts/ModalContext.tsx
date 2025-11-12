import React, { createContext, useCallback, useState } from 'react';
import type { ModalContextType, ModalType, ModalState } from '../types/modal';

/**
 * Contexto para gerenciamento centralizado de modais
 * Centraliza estado e ações de todos os modais da aplicação
 */
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Estado inicial de todos os modais (todos fechados)
 */
const initialModalState: Record<ModalType, ModalState> = {
  createPost: { isOpen: false },
  createVideo: { isOpen: false },
  createCommunity: { isOpen: false },
  postView: { isOpen: false },
  videoView: { isOpen: false },
  createContent: { isOpen: false },
  search: { isOpen: false },
};

/**
 * Provider de modais que gerencia estado global de todos os modais
 * Centraliza abertura, fechamento e estado dos modais através da aplicação
 *
 * @component
 */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Record<ModalType, ModalState>>(initialModalState);

  /**
   * Abre um modal específico com dados opcionais
   * @param type - Tipo do modal a ser aberto
   * @param data - Dados específicos do modal (opcional)
   */
  const openModal = useCallback((type: ModalType, data?: any) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, data }
    }));
  }, []);

  /**
   * Fecha um modal específico
   * @param type - Tipo do modal a ser fechado
   */
  const closeModal = useCallback((type: ModalType) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, data: undefined }
    }));
  }, []);

  /**
   * Fecha todos os modais abertos
   */
  const closeAllModals = useCallback(() => {
    setModals(initialModalState);
  }, []);

  /**
   * Verifica se um modal específico está aberto
   * @param type - Tipo do modal a verificar
   * @returns true se o modal estiver aberto
   */
  const isModalOpen = useCallback((type: ModalType): boolean => {
    return modals[type]?.isOpen || false;
  }, [modals]);

  /**
   * Obtém os dados de um modal específico
   * @param type - Tipo do modal
   * @returns Dados do modal ou undefined se não houver dados
   */
  const getModalData = useCallback((type: ModalType): any => {
    return modals[type]?.data;
  }, [modals]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
