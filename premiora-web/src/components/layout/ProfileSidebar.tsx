/**
 * Componente ProfileSidebar - Sidebar compacta para perfis
 * Inclui navegação e ações do perfil quando visualizando perfil de terceiros
 */
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Compass, Bell, MessageCircle, Users, Building2, Settings,
  Share2, Flag, PenTool
} from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { CreateContentModal, CreatePostModal, CreateVideoModal } from '../modals';
import type { ContentType } from '../modals/CreateContentModal';
import '../../styles/ProfileSidebar.css';

interface ProfileSidebarProps {
  /** Username do perfil sendo visualizado */
  username: string;
  /** Callback para compartilhar */
  onShare?: () => void;
  /** Callback para denunciar */
  onReport?: () => void;
}

/**
 * Sidebar compacta para perfis de terceiros
 * Inclui navegação principal + ações específicas do perfil
 */
const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  username,
  onShare,
  onReport
}) => {
  const { openModal, closeModal, isModalOpen } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handler para seleção de tipo de conteúdo no modal principal
   */
  const handleContentTypeSelect = (type: ContentType) => {
    closeModal('createContent');
    switch (type) {
      case 'post':
        openModal('createPost');
        break;
      case 'video':
        openModal('createVideo');
        break;
      default:
        console.warn(`Tipo de conteúdo não suportado: ${type}`);
    }
  };

  /**
   * Handler para navegação entre páginas
   */
  const handleNavigation = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const navigationItems = [
    { icon: <Home size={20} />, route: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: <Compass size={20} />, route: '/explore', active: location.pathname === '/explore' },
    { icon: <Bell size={20} />, route: '/notifications', active: location.pathname === '/notifications' },
    { icon: <MessageCircle size={20} />, route: '/messages', active: location.pathname === '/messages' },
    { icon: <Users size={20} />, route: '/dashboard', active: false }, // TODO: Add following page
    { icon: <Building2 size={20} />, route: '/communities', active: location.pathname === '/communities' },
    {
      icon: <Settings size={20} />,
      route: '/settings',
      active: location.pathname === '/settings'
    },
  ];

  return (
    <>
      <aside className="profile-sidebar">
        <div className="profile-sidebar-content">
          {/* Navigation Icons */}
          <nav className="profile-sidebar-nav">
            <ul className="profile-sidebar-nav-list">
              {navigationItems.map((item, index) => (
                <li key={index} className="profile-sidebar-nav-item">
                  <button
                    className={`profile-sidebar-nav-button ${item.active ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.route)}
                    aria-label={item.route.split('/')[1] || 'home'}
                    title={item.route.split('/')[1] || 'home'}
                  >
                    <span className="profile-sidebar-nav-icon">{item.icon}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile Actions */}
          <div className="profile-sidebar-actions">
            {/* Botão Compartilhar */}
            <button
              className="profile-sidebar-button share-button"
              onClick={onShare}
              aria-label={`Compartilhar perfil de ${username}`}
              title={`Compartilhar perfil de ${username}`}
            >
              <Share2 size={20} />
            </button>

            {/* Botão Denunciar */}
            <button
              className="profile-sidebar-button report-button"
              onClick={onReport}
              aria-label={`Denunciar perfil de ${username}`}
              title={`Denunciar perfil de ${username}`}
            >
              <Flag size={20} />
            </button>
          </div>

          {/* Create Button */}
          <div className="profile-sidebar-create-section">
            <button
              className="profile-sidebar-create-button"
              onClick={() => openModal('createContent')}
              aria-label="Criar novo conteúdo"
              title="Criar novo conteúdo"
            >
              <PenTool size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de criação de conteúdo */}
      <CreateContentModal
        isOpen={isModalOpen('createContent')}
        onClose={() => closeModal('createContent')}
        onSelectContentType={handleContentTypeSelect}
      />

      {/* Modal de criação de post */}
      <CreatePostModal
        isOpen={isModalOpen('createPost')}
        onClose={() => closeModal('createPost')}
        onPublish={() => {}}
      />

      {/* Modal de criação de vídeo */}
      <CreateVideoModal
        isOpen={isModalOpen('createVideo')}
        onClose={() => closeModal('createVideo')}
        onPublish={() => {}}
      />
    </>
  );
};

export default ProfileSidebar;
