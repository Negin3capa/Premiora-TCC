/**
 * Componente CardActions
 * Ações compartilhadas para todos os tipos de cards
 */
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Eye } from 'lucide-react';
import type { ContentItem } from '../../types/content';

/**
 * Componente de efeito de partículas para likes
 */
const LikeParticles: React.FC<{ show: boolean }> = ({ show }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Criar 6-8 particulas com posições aleatórias
      const newParticles = Array.from({ length: Math.floor(Math.random() * 3) + 6 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 80, // -40px a +40px
        y: (Math.random() - 0.5) * 80, // -40px a +40px
        delay: Math.random() * 0.3   // delay aleatório até 0.3s
      }));

      setParticles(newParticles);

      // Remover particulas após 1 segundo
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="like-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="like-particle"
          style={{
            '--x': `${particle.x}px`,
            '--y': `${particle.y}px`,
            '--delay': `${particle.delay}s`
          } as React.CSSProperties}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

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
  const [showParticles, setShowParticles] = useState(false);

  /**
   * Handler personalizado para like que inclui efeito de partículas
   */
  const handleLikeClick = () => {
    const wasLiked = liked;

    // Disparar efeito de particulas apenas quando está dando like (não removendo)
    if (!wasLiked && !isLoading) {
      setShowParticles(true);
    }

    // Chamar handler original
    onLike?.();
  };

  return (
    <div className="card-actions">
      <div className="like-btn-container">
        <LikeParticles show={showParticles} />
        <button
          className={`action-btn like-btn ${liked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleLikeClick}
          disabled={isLoading}
          aria-label={liked ? "Remover curtida" : "Curtir"}
          title={liked ? "Remover curtida" : "Curtir"}
        >
          <span className="action-icon">
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </span>
          <span className="action-count">{item.likes?.toLocaleString('pt-BR') || 0}</span>
        </button>
      </div>

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
export { LikeParticles };
