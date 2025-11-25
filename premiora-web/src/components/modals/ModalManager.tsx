import React from 'react';
import { useModal } from '../../hooks/useModal';
import CreatePostModal from './CreatePostModal';
import CreateCommunityModal from './CreateCommunityModal';
import PostViewModal from './PostViewModal';
import CreateVideoModal from './CreateVideoModal';
import CreateContentModal, { type ContentType } from './CreateContentModal';
import { useNavigate } from 'react-router-dom';
import { getCurrentCommunityContext } from '../../utils/communityUtils';

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
  const { modals, closeModal, getModalData, openModal } = useModal();
  const navigate = useNavigate();

  const handleContentTypeSelect = async (type: ContentType) => {
    closeModal('createContent');
    switch (type) {
      case 'post':
        // Verificar se estamos em uma página de comunidade e usuário é membro
        const communityContext = await getCurrentCommunityContext();
        if (communityContext.community && communityContext.isMember) {
          openModal('createPost', { preselectedCommunity: communityContext.community });
        } else {
          openModal('createPost');
        }
        break;
      case 'video':
        const videoCommunityContext = await getCurrentCommunityContext();
        if (videoCommunityContext.community && videoCommunityContext.isMember) {
          openModal('createVideo', { preselectedCommunity: videoCommunityContext.community });
        } else {
          openModal('createVideo');
        }
        break;
      case 'community':
        navigate('/create-community');
        break;
    }
  };

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

  if (modals.createVideo.isOpen) {
    return <CreateVideoModal isOpen={true} onClose={() => closeModal('createVideo')} />;
  }

  if (modals.createContent.isOpen) {
    return (
      <CreateContentModal 
        isOpen={true} 
        onClose={() => closeModal('createContent')} 
        onSelectContentType={handleContentTypeSelect}
      />
    );
  }

  // Adicione outros modais aqui conforme necessário

  return null;
};

export default ModalManager;
