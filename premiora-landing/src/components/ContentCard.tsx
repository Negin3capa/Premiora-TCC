import React from 'react';
import type { ContentItem } from './HomePage';

interface ContentCardProps {
  item: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const handlePlay = () => {
    console.log(`Playing ${item.type}: ${item.title}`);
  };

  const handleLike = () => {
    console.log(`Liked ${item.title}`);
  };

  const handleShare = () => {
    console.log(`Shared ${item.title}`);
  };

  const renderContentSpecific = () => {
    switch (item.type) {
      case 'profile':
        return (
          <div className="profile-content">
            <img 
              src={item.authorAvatar}
              alt={item.title}
              className="profile-image"
            />
            <div className="profile-stats">
              <span>{item.views} seguidores</span>
            </div>
            <button className="support-button">Seguir</button>
          </div>
        );

      case 'video':
        return (
          <div className="video-content">
            <div className="video-thumbnail" onClick={handlePlay}>
              <img src={item.thumbnail} alt={item.title} />
              <div className="play-overlay">
                <span className="play-icon">▶️</span>
              </div>
            </div>
            <div className="video-info">
              <h3 className="content-title">{item.title}</h3>
              <p className="content-stats">{item.views} visualizações • {item.timestamp}</p>
            </div>
          </div>
        );

      case 'live':
        return (
          <div className="live-content">
            <div className="live-thumbnail" onClick={handlePlay}>
              <img src={item.thumbnail} alt={item.title} />
              {item.isLive && <div className="live-badge">🔴 AO VIVO</div>}
              <div className="play-overlay">
                <span className="play-icon">▶️</span>
              </div>
            </div>
            <div className="live-info">
              <h3 className="content-title">{item.title}</h3>
              <p className="content-stats">{item.views} assistindo agora</p>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="post-content">
            {item.thumbnail && (
              <img src={item.thumbnail} alt={item.title} className="post-image" />
            )}
            <div className="post-text">
              <h3 className="content-title">{item.title}</h3>
              <p className="post-body">{item.content}</p>
              <p className="content-stats">{item.likes} curtidas • {item.timestamp}</p>
            </div>
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
          />
          <div className="author-details">
            <span className="author-name">{item.author}</span>
            <span className="content-type">{item.type}</span>
          </div>
        </div>
        <button className="card-menu">⋯</button>
      </div>

      <div className="card-content">
        {renderContentSpecific()}
      </div>

      <div className="card-actions">
        <button className="action-btn like-btn" onClick={handleLike}>
          <span className="action-icon">❤️</span>
          <span className="action-count">{item.likes}</span>
        </button>
        <button className="action-btn comment-btn">
          <span className="action-icon">💬</span>
          <span className="action-count">12</span>
        </button>
        <button className="action-btn share-btn" onClick={handleShare}>
          <span className="action-icon">📤</span>
        </button>
      </div>
    </article>
  );
};

export default ContentCard;
