/**
 * Componente MobileBottomBar
 * Barra de navegação inferior para dispositivos móveis
 * Fornece acesso rápido aos itens principais: Home, Notificações, Mensagens, Comunidades e Configurações
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bell, MessageCircle, Users, Settings } from 'lucide-react';

interface MobileBottomBarProps {
  className?: string;
}

/**
 * Barra de navegação móvel inferior
 * Exibe apenas os itens essenciais de navegação para dispositivos móveis
 */
const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Itens de navegação para a barra móvel (apenas os essenciais)
  const mobileNavigationItems = [
    { icon: <Home size={20} />, label: 'Home', route: '/home' },
    { icon: <Bell size={20} />, label: 'Notificações', route: '/notifications' },
    { icon: <MessageCircle size={20} />, label: 'Mensagens', route: '/messages' },
    { icon: <Users size={20} />, label: 'Comunidades', route: '/communities' },
    { icon: <Settings size={20} />, label: 'Configurações', route: '/settings' },
  ];

  /**
   * Handler para navegação entre páginas
   */
  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <nav className={`mobile-bottom-bar ${className}`}>
      <div className="mobile-bottom-bar-content">
        {mobileNavigationItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <button
              key={item.route}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.route)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomBar;
