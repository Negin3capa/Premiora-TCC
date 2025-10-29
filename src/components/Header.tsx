import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: any;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, user }) => {
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
            />
            <button className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-button">
            <span className="action-icon">🔔</span>
          </button>
          
          <button className="action-button">
            <span className="action-icon">💬</span>
          </button>

          <div className="user-profile">
            {user ? (
              <div className="profile-info">
                <img 
                  src={user.avatar || '/placeholder.svg?height=40&width=40'}
                  alt={user.name || 'User'}
                  className="profile-avatar"
                />
                <div className="profile-details">
                  <span className="profile-name">{user.name || 'Usuário'}</span>
                  <span className="profile-status">Online</span>
                </div>
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
