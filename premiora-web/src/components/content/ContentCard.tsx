/**
 * Componente ContentCard
 * Card de conteúdo que exibe posts, vídeos, lives e perfis
 */
import React from 'react';
import type { ContentItem } from '../../types/content';

interface ContentCardProps {
  item: ContentItem;
}

/**
 * Card de conteúdo reutilizável para diferentes tipos de mídia
 * Suporta: posts, vídeos, transmissões ao vivo e perfis de criadores
 */
const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  /**
   * Handler para reproduzir vídeo ou live
   */
  const handlePlay = () => {
    console.log(`Playing ${item.type}: ${item.title}`);
    // TODO: Implementar lógica de reprodução
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
   * Renderiza o conteúdo específico baseado no tipo
   */
  const renderContentSpecific = () => {
    switch (item.type) {
      case 'profile':
        return (
          <div className="profile-content">
            <img 
              src={item.authorAvatar}
              alt={item.title}
              className="profile-image"
              loading="lazy"
            />
            <h3 className="content-title">{item.title}</h3>
            <div className="profile-stats">
              <span>{item.views?.toLocaleString('pt-BR')} seguidores</span>
            </div>
            <button className="support-button">
              Seguir
            </button>
          </div>
        );

      case 'video':
        return (
          <div className="video-content">
            <div className="video-thumbnail" onClick={handlePlay}>
              <img 
                src={item.thumbnail} 
                alt={item.title}
                loading="lazy"
              />
              <div className="play-overlay">
                <span className="play-icon">▶️</span>
              </div>
              <div className="video-duration">
                {Math.floor(Math.random() * 20) + 1}:{(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="video-info">
              <h3 className="content-title">{item.title}</h3>
              <p className="content-stats">
                {item.views?.toLocaleString('pt-BR')} visualizações • {item.timestamp}
              </p>
            </div>
          </div>
        );

      case 'live':
        return (
          <div className="live-content">
            <div className="live-thumbnail" onClick={handlePlay}>
              <img 
                src={item.thumbnail} 
                alt={item.title}
                loading="lazy"
              />
              {item.isLive && (
                <div className="live-badge">
                  🔴 AO VIVO
                </div>
              )}
              <div className="play-overlay">
                <span className="play-icon">▶️</span>
              </div>
            </div>
            <div className="live-info">
              <h3 className="content-title">{item.title}</h3>
              <p className="content-stats">
                {item.views?.toLocaleString('pt-BR')} assistindo agora
              </p>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="post-content">
            <h3 className="content-title">{item.title}</h3>
            <p className="post-body">{item.content}</p>
            {item.thumbnail && (
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="post-image"
                loading="lazy"
              />
            )}
            <p className="content-stats">
              {item.timestamp}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className={`content-card ${item.type}-card`}>
      <div className="card-header">
        <div className="author-info">
          <img 
            src={item.authorAvatar}
            alt={item.author}
            className="author-avatar"
            loading="lazy"
          />
          <div className="author-details">
            <span className="author-name">{item.author}</span>
            <span className="content-type">{item.type}</span>
          </div>
        </div>
        <button 
          className="card-menu" 
          aria-label="Mais opções"
          title="Mais opções"
        >
          ⋯
        </button>
      </div>

      <div className="card-content">
        {renderContentSpecific()}
      </div>

      <div className="card-actions">
        <button 
          className="action-btn like-btn" 
          onClick={handleLike}
          aria-label="Curtir"
          title="Curtir"
        >
          <span className="action-icon">❤️</span>
          <span className="action-count">{item.likes?.toLocaleString('pt-BR')}</span>
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={handleComment}
          aria-label="Comentar"
          title="Comentar"
        >
          <span className="action-icon">💬</span>
          <span className="action-count">{Math.floor(Math.random() * 50)}</span>
        </button>
        <button 
          className="action-btn share-btn" 
          onClick={handleShare}
          aria-label="Compartilhar"
          title="Compartilhar"
        >
          <span className="action-icon">📤</span>
        </button>
      </div>
    </article>
  );
};

export default ContentCard;
