/**
 * Componente PostCard
 * Card específico para exibir posts
 */
import React from 'react';
import { Lock } from 'lucide-react';
import type { ContentItem } from '../../types/content';

interface PostCardProps {
  item: ContentItem;
  onClick?: () => void;
}

/**
 * Card específico para posts
 * Exibe título, conteúdo, imagem e informações do post
 */
const PostCard: React.FC<PostCardProps> = ({ item, onClick }) => {
  return (
    <div className="post-content" onClick={onClick} style={{ cursor: 'pointer' }}>
      <h3 className="content-title">{item.title}</h3>
      <p className="post-body">
        {item.isLocked && item.previewContent
          ? item.previewContent
          : item.content?.substring(0, 150) + (item.content && item.content.length > 150 ? '...' : '')}
      </p>
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title}
          className="post-image"
          loading="lazy"
        />
      )}
      {item.isLocked && (
        <div className="locked-indicator">
          <span className="lock-icon"><Lock size={16} /></span>
          <span className="lock-text">
            {item.requiredTier ? `${item.requiredTier}` : 'Exclusivo'}
          </span>
        </div>
      )}
      <p className="content-stats">
        {item.timestamp}
      </p>
    </div>
  );
};

export default PostCard;
