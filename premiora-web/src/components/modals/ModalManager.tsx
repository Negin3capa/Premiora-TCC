import React from 'react';
import { useModal } from '../../hooks/useModal';
import CreatePostModal from './CreatePostModal';
import CreateCommunityModal from './CreateCommunityModal';
import PostViewModal from './PostViewModal';

/**
 * Gerenciador de Modais
 * 
 * Este componente centraliza a renderização de todos os modais da aplicação.
 * Ele utiliza o `useModal` hook para verificar qual modal deve ser exibido
 * e renderiza o componente correspondente. Isso ajuda a evitar dependências
 * circulares e mantém o código de modais organizado.
 *
 * @component
 */
const ModalManager: React.FC = () => {
  const { modals, closeModal, getModalData } = useModal();

  if (modals.createPost.isOpen) {
    return <CreatePostModal isOpen={true} onClose={() => closeModal('createPost')} />;
  }

  if (modals.createCommunity.isOpen) {
    return <CreateCommunityModal isOpen={true} onClose={() => closeModal('createCommunity')} />;
  }
  
  if (modals.postView.isOpen) {
    const postData = getModalData('postView');
    return <PostViewModal isOpen={true} onClose={() => closeModal('postView')} item={postData} />;
  }

  // Adicione outros modais aqui conforme necessário

  return null;
};

export default ModalManager;
