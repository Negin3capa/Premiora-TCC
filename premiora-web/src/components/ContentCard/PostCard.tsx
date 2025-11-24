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
  onImageClick?: (e: React.MouseEvent, index?: number) => void;
}

/**
 * Card específico para posts
 * Exibe título, conteúdo, imagem e informações do post
 */
const PostCard: React.FC<PostCardProps> = ({ item, onClick, onImageClick }) => {
  // Determine images to display
  const images = item.mediaUrls && item.mediaUrls.length > 0 
    ? item.mediaUrls 
    : item.thumbnail ? [item.thumbnail] : [];

  const displayImages = images.slice(0, 4); // Max 4 images
  const remainingImages = images.length - 4;

  const handleImageClickWrapper = (e: React.MouseEvent, index: number) => {
    if (onImageClick) {
      onImageClick(e, index);
    }
  };

  return (
    <div
      className="post-content"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3 className="content-title">
        {item.title}
      </h3>
      <div className="post-body">
        {item.isLocked && item.previewContent
          ? item.previewContent
          : item.content?.substring(0, 150) + (item.content && item.content.length > 150 ? '...' : '')}
      </div>
      
      {images.length === 1 ? (
        <div className="post-single-image-container">
          <img
            src={images[0]}
            alt={item.title}
            loading="lazy"
            onClick={(e) => handleImageClickWrapper(e, 0)}
            style={{ cursor: onImageClick ? 'pointer' : 'inherit' }}
          />
        </div>
      ) : images.length > 0 ? (
        <div className={`post-images-grid grid-${Math.min(displayImages.length, 4)}`}>
          {displayImages.map((url, index) => (
            <div key={index} style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={url}
                alt={`${item.title} - ${index + 1}`}
                loading="lazy"
                onClick={(e) => handleImageClickWrapper(e, index)}
                style={{ cursor: onImageClick ? 'pointer' : 'inherit' }}
              />
              {index === 3 && remainingImages > 0 && (
                <div 
                  className="remaining-images-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}
                >
                  +{remainingImages}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

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
