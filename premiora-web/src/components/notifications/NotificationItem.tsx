import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Reply, Bell } from 'lucide-react';
import type { SocialNotification } from '../../types/socialNotification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItemProps {
  notification: SocialNotification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const { type, actor, created_at, is_read, metadata } = notification;

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />;
      case 'reply':
        return <Reply className="w-5 h-5 text-blue-400" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'subscribe':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMessage = () => {
    const name = actor?.name || 'Alguém';
    switch (type) {
      case 'like':
        return (
          <span>
            <strong>{name}</strong> curtiu sua publicação.
          </span>
        );
      case 'comment':
        return (
          <span>
            <strong>{name}</strong> comentou: "{metadata.content}"
          </span>
        );
      case 'reply':
        return (
          <span>
            <strong>{name}</strong> respondeu ao seu comentário: "{metadata.content}"
          </span>
        );
      case 'follow':
        return (
          <span>
            <strong>{name}</strong> começou a seguir você.
          </span>
        );
      case 'subscribe':
        return (
          <span>
            <strong>{name}</strong> se inscreveu no seu canal.
          </span>
        );
      default:
        return <span>Nova notificação de <strong>{name}</strong></span>;
    }
  };

  const getLink = () => {
    if (metadata.post_id) return `/post/${metadata.post_id}`;
    if (type === 'follow' && actor?.username) return `/profile/${actor.username}`;
    return '#';
  };

  return (
    <div 
      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!is_read ? 'bg-blue-500/5' : ''}`}
      onClick={() => !is_read && onMarkAsRead(notification.id)}
    >
      <Link to={getLink()} className="flex items-start gap-4">
        <div className="relative">
          <img 
            src={actor?.avatar_url || `https://ui-avatars.com/api/?name=${actor?.name || 'User'}&background=random`} 
            alt={actor?.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#0f0f0f] rounded-full p-1">
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-200 mb-1">
            {getMessage()}
          </p>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>

        {!is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
        )}
      </Link>
    </div>
  );
};
