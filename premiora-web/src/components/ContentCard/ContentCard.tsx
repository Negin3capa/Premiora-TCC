/**
 * Componente ContentCard
 * Card de conteúdo que exibe posts, vídeos e perfis
 */
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { ContentItem } from '../../types/content';
import { PostViewModal, VideoViewModal } from '../modals';
import { PostCard, VideoCard, ProfileCard, CardActions } from './index';

interface ContentCardProps {
  item: ContentItem;
}

/**
 * Card de conteúdo reutilizável para diferentes tipos de mídia
 * Suporta: posts, vídeos e perfis de criadores
 */
const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const { userProfile } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  /**
   * Handler para visualizar post detalhado
   */
  const handleViewPost = () => {
    if (item.type === 'post') {
      setIsPostModalOpen(true);
    }
  };

  /**
   * Handler para fechar modal do post
   */
  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
  };

  /**
   * Handler para reproduzir vídeo
   */
  const handlePlay = () => {
    if (item.type === 'video') {
      setIsVideoModalOpen(true);
    }
  };

  /**
   * Handler para fechar modal do vídeo
   */
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  /**
   * Handler para curtir conteúdo
   */
  const handleLike = () => {
    console.log(`Liked ${item.title}`);
    // TODO: Implementar lógica de like com API
  };

  /**
   * Handler para compartilhar conteúdo
   */
  const handleShare = () => {
    console.log(`Shared ${item.title}`);
    // TODO: Implementar lógica de compartilhamento
  };

  /**
   * Handler para abrir comentários
   */
  const handleComment = () => {
    console.log(`Opening comments for ${item.title}`);
    // TODO: Implementar modal de comentários
  };

  /**
   * Renderiza o conteúdo específico baseado no tipo usando componentes especializados
   */
  const renderContentSpecific = () => {
    switch (item.type) {
      case 'profile':
        return <ProfileCard item={item} onFollow={() => console.log('Follow clicked')} />;

      case 'video':
        return <VideoCard item={item} onPlay={handlePlay} />;

      case 'post':
        return <PostCard item={item} onClick={handleViewPost} />;

      default:
        return null;
    }
  };

  return (
    <>
      <article className={`content-card ${item.type}-card`}>
        <div className="card-header">
          <div className="author-info">
            {item.authorAvatar ? (
              <img
                src={item.authorAvatar}
                alt={item.author}
                className="author-avatar"
                loading="lazy"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {item.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="author-details">
              <span className="author-name">{item.author}</span>
              <span className="content-type">{item.type}</span>
            </div>
          </div>

          {/* Flair do post */}
          {item.postFlair && (
            <div
              className="post-flair"
              style={{
                backgroundColor: item.postFlair.backgroundColor,
                color: item.postFlair.color,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                marginRight: '8px'
              }}
            >
              {item.postFlair.text}
            </div>
          )}

          <button
            className="card-menu"
            aria-label="Mais opções"
            title="Mais opções"
          >
            ⋯
          </button>
        </div>

        {/* Informações da comunidade */}
        {item.communityId && (
          <div className="community-info" style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-border-light)',
            backgroundColor: 'var(--color-bg-secondary)',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {item.communityAvatar && (
              <img
                src={item.communityAvatar}
                alt={item.communityName}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%'
                }}
              />
            )}
            <span>r/{item.communityName}</span>
            {item.userFlairs && item.userFlairs.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                {item.userFlairs.map((userFlair, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: userFlair.flair?.backgroundColor || '#e5e7eb',
                      color: userFlair.flair?.color || '#374151',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}
                  >
                    {userFlair.flair?.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card-content">
          {renderContentSpecific()}
        </div>

        <CardActions
          item={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </article>

      <PostViewModal
        item={isPostModalOpen ? item : null}
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
        userTier={userProfile?.tier}
      />

      <VideoViewModal
        item={isVideoModalOpen ? item : null}
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        userTier={userProfile?.tier}
      />
    </>
  );
};

export default ContentCard;
