import React, { useState, useEffect } from 'react';
import { Lock, X, Heart, Share } from 'lucide-react';
import type { ContentItem } from '../../types/content';

interface PostViewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  userTier?: string; // Tier do usuário atual
}

/**
 * Modal para visualização detalhada de posts com controle de acesso Patreon-like
 */
const PostViewModal: React.FC<PostViewModalProps> = ({
  item,
  isOpen,
  onClose,
  userTier
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  // Gerencia o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      // Salva a posição atual de scroll
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      setSavedScrollPosition(currentScroll);
      document.body.classList.add('modal-open');
    } else {
      // Restaura a posição de scroll salva
      document.body.classList.remove('modal-open');
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        window.scrollTo(0, savedScrollPosition);
      }, 0);
    }

    // Cleanup: remove a classe quando o componente é desmontado
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, savedScrollPosition]);

  if (!isOpen || !item || item.type !== 'post') {
    return null;
  }

  /**
   * Verifica se o usuário tem acesso ao conteúdo completo
   */
  const hasFullAccess = () => {
    if (item.accessLevel === 'public') return true;
    if (!userTier) return false;

    // Lógica de acesso baseada no tier
    const tierHierarchy = { 'supporters': 1, 'premium': 2 };
    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[item.requiredTier as keyof typeof tierHierarchy] || 0;

    return userTierLevel >= requiredTierLevel;
  };

  /**
   * Renderiza o conteúdo baseado no nível de acesso
   */
  const renderContent = () => {
    const canAccess = hasFullAccess();

    if (canAccess) {
      return (
        <div className="post-full-content">
          <h2 className="post-title">{item.title}</h2>
          <div className="post-body">
            {item.fullContent || item.content}
          </div>
          {item.thumbnail && (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="post-view-image clickable-image"
              loading="lazy"
              onClick={() => setIsImageModalOpen(true)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      );
    } else {
      return (
        <div className="post-preview-content">
          <h2 className="post-title">{item.title}</h2>
          <div className="post-preview">
            {item.previewContent || item.content?.substring(0, 200) + '...'}
          </div>
          <div className="access-required">
            <div className="lock-icon"><Lock size={24} /></div>
            <p>Este conteúdo é exclusivo para {item.requiredTier || 'assinantes'}</p>
            <button className="upgrade-button">
              Fazer Upgrade
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content post-view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="author-info">
              <img
                src={item.authorAvatar}
                alt={item.author}
                className="author-avatar"
                loading="lazy"
              />
              <div className="author-details">
                <span className="author-name">{item.author}</span>
                <span className="post-timestamp">{item.timestamp}</span>
              </div>
            </div>
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            {renderContent()}
          </div>

          <div className="modal-footer">
            <div className="post-stats">
              <span className="views">{item.views?.toLocaleString('pt-BR')} visualizações</span>
              <span className="likes">{item.likes?.toLocaleString('pt-BR')} curtidas</span>
            </div>
            <div className="post-actions">
              <button className="action-btn like-btn">
                <span className="action-icon"><Heart size={16} /></span>
                Curtir
              </button>
              <button className="action-btn share-btn">
                <span className="action-icon"><Share size={16} /></span>
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagem ampliada */}
      {isImageModalOpen && item.thumbnail && (
        <div
          className="image-modal-overlay"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Fechar imagem ampliada"
            >
              <X size={16} />
            </button>
            <img
              src={item.thumbnail}
              alt={item.title}
              className="image-modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostViewModal;
