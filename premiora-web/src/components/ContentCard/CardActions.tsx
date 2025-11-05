/**
 * Componente CardActions
 * Ações compartilhadas para todos os tipos de cards
 */
import React from 'react';
import type { ContentItem } from '../../types/content';

interface CardActionsProps {
  item: ContentItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

/**
 * Ações compartilhadas para cards de conteúdo
 * Like, comentário e compartilhamento
 */
const CardActions: React.FC<CardActionsProps> = ({
  item,
  onLike,
  onComment,
  onShare
}) => {
  return (
    <div className="card-actions">
      <button
        className="action-btn like-btn"
        onClick={onLike}
        aria-label="Curtir"
        title="Curtir"
      >
        <span className="action-icon">❤️</span>
        <span className="action-count">{item.likes?.toLocaleString('pt-BR')}</span>
      </button>
      <button
        className="action-btn comment-btn"
        onClick={onComment}
        aria-label="Comentar"
        title="Comentar"
      >
        <span className="action-icon">💬</span>
        <span className="action-count">{Math.floor((item.likes || 0) / 5)}</span>
      </button>
      <button
        className="action-btn share-btn"
        onClick={onShare}
        aria-label="Compartilhar"
        title="Compartilhar"
      >
        <span className="action-icon">📤</span>
      </button>
    </div>
  );
};

export default CardActions;
