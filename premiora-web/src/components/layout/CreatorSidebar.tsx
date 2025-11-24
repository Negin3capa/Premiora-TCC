/**
 * Componente CreatorSidebar - Sidebar para a área do criador
 */
import React from 'react';
import {
  LayoutDashboard, Library, Users, BarChart2, DollarSign,
  Megaphone, MessageSquare, Bell, Settings, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../hooks/useUI';
import '../../styles/ProfileSidebar.css'; // Reusing ProfileSidebar styles for consistency

interface CreatorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onBackToProfile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const CreatorSidebar: React.FC<CreatorSidebarProps> = ({
  activeSection,
  onSectionChange,
  onBackToProfile,
  isCollapsed,
  onToggleCollapse
}) => {
  const { isDark } = useTheme();

  const navigationItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Painel' },
    { id: 'library', icon: <Library size={20} />, label: 'Biblioteca' },
    { id: 'audience', icon: <Users size={20} />, label: 'Público' },
    { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Informações' },
    { id: 'payments', icon: <DollarSign size={20} />, label: 'Pagamentos' },
    { id: 'promotions', icon: <Megaphone size={20} />, label: 'Promoções', badge: 'NOVIDADE' },
    { id: 'chats', icon: <MessageSquare size={20} />, label: 'Chats' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notificações' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <aside className={`profile-sidebar ${!isCollapsed ? 'expanded' : ''}`}>
      <button 
        className="sidebar-toggle-button"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="profile-sidebar-content">
        {/* Logo/Brand */}
        <div className="profile-sidebar-header">
          <img 
            src={isDark ? "/assets/premiora-logo.png" : "/assets/premiora-logo-light.png"} 
            alt="Premiora" 
            className="profile-sidebar-logo" 
          />
        </div>

        {/* Navigation Icons */}
        <nav className="profile-sidebar-nav">
          <ul className="profile-sidebar-nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className="profile-sidebar-nav-item">
                <button
                  className={`profile-sidebar-nav-button ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => onSectionChange(item.id)}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="profile-sidebar-nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="profile-sidebar-nav-label">{item.label}</span>
                      {item.badge && (
                        <span style={{ 
                          fontSize: '0.6rem', 
                          backgroundColor: 'var(--color-accent)', 
                          color: 'white', 
                          padding: '2px 4px', 
                          borderRadius: '4px',
                          marginLeft: 'auto'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Back to Profile Action */}
        <div className="profile-sidebar-actions">
          <button
            className="profile-sidebar-button"
            onClick={onBackToProfile}
            aria-label="Voltar ao perfil"
            title={isCollapsed ? "Voltar ao perfil" : ''}
          >
            <ArrowLeft size={20} />
            {!isCollapsed && <span style={{ fontSize: '0.9rem' }}>Voltar</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CreatorSidebar;
