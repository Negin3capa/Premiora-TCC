import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Bell, Reply } from 'lucide-react';
import type { SocialNotification } from '../../types/socialNotification';

interface NotificationItemProps {
  notification: SocialNotification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const { type, actor, metadata, is_read } = notification;

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-8 h-8 text-[#f91880] fill-current" />;
      case 'comment':
        return <MessageCircle className="w-8 h-8 text-[#1d9bf0] fill-current" />;
      case 'reply':
        return <Reply className="w-8 h-8 text-[#1d9bf0] fill-current" />;
      case 'follow':
        return <UserPlus className="w-8 h-8 text-[#1d9bf0] fill-current" />;
      case 'subscribe':
        return <Bell className="w-8 h-8 text-[#794bc4] fill-current" />;
      default:
        return <Bell className="w-8 h-8 text-[#71767b]" />;
    }
  };

  const getLink = () => {
    // Redirecionamento para Post (Like, Comment, Reply)
    // Tenta obter o ID do post do metadata ou do entity_id (fallback)
    const postId = metadata?.post_id || (['like', 'comment', 'reply'].includes(type) ? notification.entity_id : undefined);

    if (postId) {
      // Determine commentId for highlighting
      const commentId = metadata?.comment_id || (['comment', 'reply'].includes(type) ? notification.entity_id : undefined);
      const queryParams = commentId ? `?commentId=${commentId}` : '';

      // Se tiver o username do autor no metadata, usa ele
      if (metadata?.post_author_username) {
        return `/u/${metadata.post_author_username}/status/${postId}${queryParams}`;
      }
      // Fallback: assume que o post é do usuário atual (para likes/comments no meu post)
      return `/u/me/status/${postId}${queryParams}`; 
    }
    
    // Redirecionamento para Perfil (Follow)
    if (type === 'follow' && actor?.username) {
      return `/u/${actor.username}`;
    }

    // Fallback para Perfil se houver actor
    if (actor?.username) {
      return `/u/${actor.username}`;
    }

    return '#';
  };

  const name = actor?.name || 'Usuário';
  const avatarUrl = actor?.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=random`;

  return (
    <Link 
      to={getLink()} 
      className={`notification-item ${!is_read ? 'unread' : ''}`}
      onClick={() => !is_read && onMarkAsRead(notification.id)}
    >
      {/* Left Gutter: Icon */}
      <div className="notification-left-gutter">
        {getIcon()}
      </div>

      {/* Right Content */}
      <div className="notification-content-wrapper">
        {/* Actor Avatar */}
        <div className="mb-1">
          <img 
            src={avatarUrl} 
            alt={name} 
            className="notification-avatar"
          />
        </div>

        {/* Notification Text */}
        <div className="notification-text">
          <span className="actor-name">{name}</span>
          <span className="action-desc">
            {type === 'like' && 'curtiu sua publicação'}
            {type === 'comment' && 'comentou na sua publicação'}
            {type === 'reply' && 'respondeu ao seu comentário'}
            {type === 'follow' && 'começou a seguir você'}
            {type === 'subscribe' && 'se inscreveu no seu canal'}
          </span>
        </div>

        {/* Content Preview (if applicable) */}
        {metadata.content && (
          <div className="notification-preview">
            {metadata.content}
          </div>
        )}
      </div>
    </Link>
  );
};
