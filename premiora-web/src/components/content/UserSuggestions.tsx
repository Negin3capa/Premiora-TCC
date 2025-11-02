import React from 'react';
import '../../styles/UserSuggestions.css';

/**
 * Representa uma sugestão de usuário para seguir
 */
interface UserSuggestion {
  /** ID único do usuário */
  id: string;
  /** Nome de usuário exibido */
  username: string;
  /** Handle do usuário (@username) */
  handle: string;
  /** URL do avatar do usuário */
  avatar: string;
  /** Descrição opcional do usuário */
  description?: string;
  /** Último post do usuário */
  latestPost?: string;
  /** Indica se o usuário é verificado */
  isVerified?: boolean;
}

/**
 * Props do componente UserSuggestions
 */
interface UserSuggestionsProps {
  /** Array de sugestões de usuários */
  suggestions: UserSuggestion[];
}

/**
 * Componente que exibe sugestões de usuários para seguir
 *
 * @component
 * @example
 * <UserSuggestions suggestions={userSuggestions} />
 */
const UserSuggestions: React.FC<UserSuggestionsProps> = ({ suggestions }) => {
  const mockSuggestions: UserSuggestion[] = [
    {
      id: '1',
      username: 'promo out of con...',
      handle: '@ofcpro...',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
      latestPost: 'MOLETOM POR MENOS DE 50 CONTO',
      description: 'Moletom Liso Algodão Unissex...',
      isVerified: true
    },
    {
      id: '2',
      username: 'lobão das prom...',
      handle: '@lobao...',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
      latestPost: 'É galera... NOVEMBRO CHEGOU!',
      description: 'E sabe o que isso significa? CHEIRINHO...',
      isVerified: true
    },
    {
      id: '3',
      username: 'tech creator',
      handle: '@techcreator',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format',
      latestPost: 'New coding tutorial is live!',
      description: 'Learn React hooks in 10 minutes...',
      isVerified: false
    },
    {
      id: '4',
      username: 'design guru',
      handle: '@designguru',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format',
      latestPost: 'UI/UX trends for 2024',
      description: 'Minimalism is making a comeback...',
      isVerified: true
    }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

  return (
    <div className="user-suggestions">
      <div className="suggestions-header">
        <h3 className="suggestions-title">Users you might like</h3>
        <button className="suggestions-arrow">
          <span>→</span>
        </button>
      </div>
      
      <div className="suggestions-container">
        <div className="suggestions-scroll">
          {displaySuggestions.map((user) => (
            <div key={user.id} className="suggestion-card">
              <div className="suggestion-header">
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="suggestion-avatar"
                />
                <div className="suggestion-info">
                  <div className="suggestion-name">
                    <span className="suggestion-username">{user.username}</span>
                    {user.isVerified && (
                      <span className="verification-badge">✓</span>
                    )}
                  </div>
                  <span className="suggestion-handle">{user.handle}</span>
                </div>
              </div>
              
              <div className="suggestion-content">
                {user.latestPost && (
                  <div className="suggestion-post">
                    <strong>{user.latestPost}</strong>
                  </div>
                )}
                {user.description && (
                  <div className="suggestion-description">
                    {user.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSuggestions;
