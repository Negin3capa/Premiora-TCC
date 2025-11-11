import React from 'react';
import '../../styles/UserSuggestions.css';
import { useUserSuggestions } from '../../hooks/useUserSuggestions';
import type { UserSuggestion } from '../../services/content';

/**
 * Componente que exibe sugestões de usuários para seguir
 * Agora usa dados reais do backend através do hook useUserSuggestions
 *
 * @component
 */
const UserSuggestions: React.FC = () => {
  const { suggestions, loading, error, followUser } = useUserSuggestions();

  /**
   * Trata o clique no botão de seguir
   * @param userId - ID do usuário a ser seguido
   */
  const handleFollowClick = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (err) {
      console.error('Erro ao seguir usuário:', err);
      // TODO: Mostrar notificação de erro
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <div className="user-suggestions">
        <div className="suggestions-header">
          <h3 className="suggestions-title">Users you might like</h3>
        </div>
        <div className="suggestions-container">
          <div className="suggestions-loading">
            <div className="spinner"></div>
            <p>Carregando sugestões...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="user-suggestions">
        <div className="suggestions-header">
          <h3 className="suggestions-title">Users you might like</h3>
        </div>
        <div className="suggestions-container">
          <div className="suggestions-error">
            <p>Erro ao carregar sugestões</p>
            <button
              onClick={() => window.location.reload()}
              className="suggestions-retry-btn"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sem sugestões
  if (suggestions.length === 0) {
    return (
      <div className="user-suggestions">
        <div className="suggestions-header">
          <h3 className="suggestions-title">Users you might like</h3>
        </div>
        <div className="suggestions-container">
          <div className="suggestions-empty">
            <p>Nenhuma sugestão disponível no momento</p>
          </div>
        </div>
      </div>
    );
  }

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
          {suggestions.map((user: UserSuggestion) => (
            <div key={user.id} className="suggestion-card">
              <div className="suggestion-header">
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="suggestion-avatar"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40x40?text=U';
                  }}
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
                <button
                  className="suggestion-follow-btn"
                  onClick={() => handleFollowClick(user.id)}
                  aria-label={`Seguir ${user.username}`}
                >
                  Seguir
                </button>
              </div>

              <div className="suggestion-content">
                {user.reason && (
                  <div className="suggestion-reason">
                    <small>{user.reason}</small>
                  </div>
                )}
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
