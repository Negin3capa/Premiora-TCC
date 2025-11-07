/**
 * Componente Header - Versão Minimalista
 * Header simplificado similar ao ProfileMiniHeader
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Header.css';
import { Search, Bell, User } from 'lucide-react';

/**
 * Header minimalista da aplicação
 */
const Header: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handler para ações do header
   */
  const handleAction = (action: string) => {
    switch (action) {
      case 'search':
        // TODO: Implement search functionality
        console.log('Search clicked');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Left side - App title */}
        <div className="header-left">
          <h1 className="header-title">Premiora</h1>
        </div>

        {/* Right side - Actions */}
        <div className="header-right">
          <button
            className="header-action-button"
            aria-label="Buscar"
            title="Buscar"
            onClick={() => handleAction('search')}
          >
            <Search size={20} />
          </button>

          <button
            className="header-action-button"
            aria-label="Notificações"
            title="Notificações"
            onClick={() => handleAction('notifications')}
          >
            <Bell size={20} />
          </button>

          <button
            className="header-action-button"
            aria-label="Perfil"
            title="Perfil"
            onClick={() => handleAction('profile')}
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
