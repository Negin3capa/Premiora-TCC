/**
 * Componente Header
 * Barra superior com busca, notificações, perfil do usuário e logout
 */
import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User | null;
}

/**
 * Header da aplicação com busca e perfil do usuário
 * @param searchQuery - Query atual da busca
 * @param onSearchChange - Callback para atualizar a query de busca
 * @param user - Objeto do usuário autenticado do Supabase
 */
const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, user }) => {
  const { signOut, userProfile } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Extrai informações do perfil do usuário
  const userName = user?.user_metadata?.full_name ||
                   user?.user_metadata?.name ||
                   userProfile?.name ||
                   user?.email?.split('@')[0] ||
                   'Usuário';

  /**
   * Helper function to extract avatar URL from user metadata
   * Handles different OAuth provider structures (Google, Facebook, etc.)
   */
  const getAvatarUrl = () => {
    const metadata = user?.user_metadata;

    // Try different possible avatar field names from OAuth providers
    const possibleFields = ['avatar_url', 'picture', 'photo', 'profile_picture', 'image'];

    // Check direct metadata fields first (Facebook typically stores here)
    for (const field of possibleFields) {
      if (metadata?.[field]) {
        return metadata[field];
      }
    }

    // Check nested identities data (common for Google OAuth)
    if (metadata?.identities && Array.isArray(metadata.identities)) {
      for (const identity of metadata.identities) {
        if (identity?.identity_data) {
          for (const field of possibleFields) {
            if (identity.identity_data[field]) {
              return identity.identity_data[field];
            }
          }
        }
      }
    }

    // Fallback to database profile (stored user profile)
    if (userProfile?.avatar_url) {
      return userProfile.avatar_url;
    }

    // Final fallback to generated avatar with user initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
  };

  const userAvatar = getAvatarUrl();

  /**
   * Handler para realizar logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar criadores, vídeos, posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
              aria-label="Buscar conteúdo"
            />
            <button 
              className="search-button" 
              aria-label="Realizar busca"
              onClick={() => {
                // TODO: Implementar lógica de busca
                console.log('Buscando:', searchQuery);
              }}
            >
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="action-button" 
            aria-label="Notificações"
            title="Notificações"
          >
            <span className="action-icon">🔔</span>
          </button>
          
          <button 
            className="action-button" 
            aria-label="Mensagens"
            title="Mensagens"
          >
            <span className="action-icon">💬</span>
          </button>

          <div className="user-profile">
            {user ? (
              <div className="profile-dropdown">
                <div 
                  className="profile-info" 
                  title={`Perfil de ${userName}`}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img 
                    src={userAvatar}
                    alt={userName}
                    className="profile-avatar"
                    onError={(e) => {
                      // Fallback caso a imagem falhe ao carregar
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
                    }}
                  />
                  <div className="profile-details">
                    <span className="profile-name">{userName}</span>
                    <span className="profile-status">Online</span>
                  </div>
                  <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
                </div>
                
                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <img 
                        src={userAvatar}
                        alt={userName}
                        className="profile-menu-avatar"
                      />
                      <div>
                        <div className="profile-menu-name">{userName}</div>
                        <div className="profile-menu-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="profile-menu-divider" />
                    <button className="profile-menu-item">
                      <span>👤</span>
                      Ver Perfil
                    </button>
                    <button className="profile-menu-item">
                      <span>⚙️</span>
                      Configurações
                    </button>
                    <div className="profile-menu-divider" />
                    <button 
                      className="profile-menu-item logout-item" 
                      onClick={handleLogout}
                    >
                      <span>🚪</span>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-button">Entrar</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
