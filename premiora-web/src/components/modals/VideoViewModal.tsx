/**
 * Modal de visualização de vídeos
 * Player de vídeo completo com comentários, descrição e controles
 */
import React, { useState, useEffect } from 'react';
import type { ContentItem } from '../../types/content';
import { VideoPlayer, VideoInfo, VideoActions, CommentsSection, type Comment } from '../video';

interface VideoViewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  userTier?: string; // Tier do usuário atual
}

/**
 * Modal para visualização completa de vídeos
 * Inclui player, descrição, comentários e controles de engajamento
 */
const VideoViewModal: React.FC<VideoViewModalProps> = ({
  item,
  isOpen,
  onClose,
  userTier
}) => {

  // Estados da interface
  const [showComments, setShowComments] = useState(false);
  const [comments] = useState<Comment[]>([
    // Dados mockados para demonstração
    {
      id: '1',
      author: 'João Silva',
      authorAvatar: 'https://via.placeholder.com/40',
      content: 'Incrível vídeo! Muito bem explicado.',
      timestamp: '2 horas atrás',
      likes: 12
    },
    {
      id: '2',
      author: 'Maria Santos',
      authorAvatar: 'https://via.placeholder.com/40',
      content: 'Obrigada pelo conteúdo! Aprendi muito.',
      timestamp: '1 hora atrás',
      likes: 8
    }
  ]);

  // Estados de engajamento
  const [likes, setLikes] = useState(item?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (item) {
      setLikes(item.likes || 0);
    }
  }, [item]);

  if (!isOpen || !item || item.type !== 'video') {
    return null;
  }

  /**
   * Verifica se o usuário tem acesso ao vídeo completo
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
   * Handlers de engajamento
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    navigator.share?.({
      title: item.title,
      text: item.content || '',
      url: window.location.href
    }).catch(() => {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    });
  };

  const handleAddComment = (content: string) => {
    // TODO: Implementar API de comentários
    console.log('Novo comentário:', content);
  };

  const canAccess = hasFullAccess();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-view-modal" onClick={(e) => e.stopPropagation()}>
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
              <span className="video-timestamp">{item.timestamp}</span>
            </div>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="video-player-section">
            {canAccess ? (
              <VideoPlayer
                src="" // TODO: Adicionar source do vídeo quando disponível
                poster={item.thumbnail}
              />
            ) : (
              <div className="video-preview-container">
                <div className="video-preview">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="preview-thumbnail"
                  />
                  <div className="preview-overlay">
                    <div className="lock-icon">🔒</div>
                    <p>Este vídeo é exclusivo para {item.requiredTier || 'assinantes'}</p>
                    <button className="upgrade-button">
                      Fazer Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informações do vídeo */}
            <VideoInfo
              item={item}
              likes={likes}
            />
          </div>

          {/* Ações do vídeo */}
          <VideoActions
            likes={likes}
            isLiked={isLiked}
            commentCount={comments.length}
            showComments={showComments}
            onLike={handleLike}
            onToggleComments={() => setShowComments(!showComments)}
            onShare={handleShare}
          />

          {/* Seção de comentários */}
          <CommentsSection
            comments={comments}
            isVisible={showComments}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoViewModal;
