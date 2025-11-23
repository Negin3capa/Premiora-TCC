/**
 * Componente ProfileSidebar - Sidebar compacta para perfis
 * Inclui navegação e ações do perfil quando visualizando perfil de terceiros
 */
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Bell, MessageCircle, Building2, Settings,
  Share2, Flag, PenTool, User
} from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../hooks/useAuth';
import { CreateContentModal, CreatePostModal, CreateVideoModal } from '../modals';
import { getCurrentCommunityContext } from '../../utils/communityUtils';
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
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handler para seleção de tipo de conteúdo no modal principal
   */
  const handleContentTypeSelect = async (type: ContentType) => {
    closeModal('createContent');
    switch (type) {
      case 'post':
        // Verificar se estamos em uma página de comunidade e usuário é membro
        const communityContext = await getCurrentCommunityContext();
        if (communityContext.community && communityContext.isMember) {
          // Abrir modal de post com comunidade pré-selecionada
          openModal('createPost', { preselectedCommunity: communityContext.community });
        } else {
          // Abrir modal normalmente
          openModal('createPost');
        }
        break;
      case 'video':
        // Verificar se estamos em uma página de comunidade e usuário é membro
        const videoCommunityContext = await getCurrentCommunityContext();
        if (videoCommunityContext.community && videoCommunityContext.isMember) {
          // Abrir modal de vídeo com comunidade pré-selecionada
          openModal('createVideo', { preselectedCommunity: videoCommunityContext.community });
        } else {
          // Abrir modal normalmente
          openModal('createVideo');
        }
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

  // Navigation items matching the main Sidebar order
  const navigationItems = [
    { icon: <Home size={20} />, label: 'Home', route: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: <Bell size={20} />, label: 'Notifications', route: '/notifications', active: location.pathname === '/notifications' },
    { icon: <MessageCircle size={20} />, label: 'Messages', route: '/messages', active: location.pathname === '/messages' },
    { icon: <Building2 size={20} />, label: 'Communities', route: '/communities', active: location.pathname === '/communities' },
    {
      icon: <User size={20} />,
      label: 'Profile',
      route: '/profile',
      active: location.pathname === '/profile' || location.pathname === `/u/${userProfile?.username}`
    },
    { icon: <Settings size={20} />, label: 'Settings', route: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <>
      <aside className="profile-sidebar">
        <div className="profile-sidebar-content">
          {/* Logo/Brand */}
          <div className="profile-sidebar-header">
            <img src="/assets/premiora-logo.png" alt="Premiora" className="profile-sidebar-logo" />
          </div>

          {/* Navigation Icons */}
          <nav className="profile-sidebar-nav">
            <ul className="profile-sidebar-nav-list">
              {navigationItems.map((item, index) => (
                <li key={index} className="profile-sidebar-nav-item">
                  <button
                    className={`profile-sidebar-nav-button ${item.active ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.route)}
                    aria-label={item.label}
                    title={item.label}
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
