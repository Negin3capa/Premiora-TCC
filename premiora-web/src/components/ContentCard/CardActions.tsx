/**
 * Componente CardActions
 * Ações compartilhadas para todos os tipos de cards
 */
import React from 'react';
import { Heart, MessageCircle, Send, Eye } from 'lucide-react';
import type { ContentItem } from '../../types/content';

interface CardActionsProps {
  item: ContentItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  liked?: boolean;
  isLoading?: boolean;
}

/**
 * Ações compartilhadas para cards de conteúdo
 * Like, comentário, compartilhamento e visualizações
 */
const CardActions: React.FC<CardActionsProps> = ({
  item,
  onLike,
  onComment,
  onShare,
  liked = false,
  isLoading = false
}) => {
  return (
    <div className="card-actions">
      <button
        className={`action-btn like-btn ${liked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={onLike}
        disabled={isLoading}
        aria-label={liked ? "Remover curtida" : "Curtir"}
        title={liked ? "Remover curtida" : "Curtir"}
      >
        <span className="action-icon">
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </span>
        <span className="action-count">{item.likes?.toLocaleString('pt-BR') || 0}</span>
      </button>

      {/* Exibir visualizações para posts com views */}
      {item.views !== undefined && item.views > 0 && (
        <div className="action-btn view-display">
          <span className="action-icon"><Eye size={16} /></span>
          <span className="action-count">{item.views.toLocaleString('pt-BR')}</span>
        </div>
      )}

      <button
        className="action-btn comment-btn"
        onClick={onComment}
        aria-label="Comentar"
        title="Comentar"
      >
        <span className="action-icon"><MessageCircle size={16} /></span>
        <span className="action-count">{item.comments?.toLocaleString('pt-BR') || 0}</span>
      </button>

      <button
        className="action-btn share-btn"
        onClick={onShare}
        aria-label="Compartilhar"
        title="Compartilhar"
      >
        <span className="action-icon"><Send size={16} /></span>
      </button>
    </div>
  );
};

export default CardActions;
