/**
 * Componente de ações do vídeo
 * Botões de engajamento: curtir, comentar, compartilhar
 */
import React from 'react';

/**
 * Props do componente VideoActions
 */
interface VideoActionsProps {
  /** Número de curtidas */
  likes: number;
  /** Se o vídeo está curtido */
  isLiked: boolean;
  /** Número de comentários */
  commentCount: number;
  /** Se a seção de comentários está visível */
  showComments: boolean;
  /** Handler para curtir/descurtir */
  onLike: () => void;
  /** Handler para toggle comentários */
  onToggleComments: () => void;
  /** Handler para compartilhar */
  onShare: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente VideoActions - Ações de engajamento do vídeo
 */
export const VideoActions: React.FC<VideoActionsProps> = ({
  likes,
  isLiked,
  commentCount,
  showComments,
  onLike,
  onToggleComments,
  onShare,
  className = ''
}) => {
  return (
    <div className={`video-actions ${className}`}>
      <button
        className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
        onClick={onLike}
      >
        <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
        {likes?.toLocaleString('pt-BR')}
      </button>

      <button
        className={`action-btn comment-btn ${showComments ? 'active' : ''}`}
        onClick={onToggleComments}
      >
        <span className="action-icon">💬</span>
        {commentCount}
      </button>

      <button
        className="action-btn share-btn"
        onClick={onShare}
      >
        <span className="action-icon">📤</span>
        Compartilhar
      </button>
    </div>
  );
};
