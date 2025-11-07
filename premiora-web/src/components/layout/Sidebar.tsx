/**
 * Componente Sidebar
 * Barra lateral com navegação e perfil do usuário
 */
import React from 'react';
import '../../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Flame, Bell, MessageCircle, Users, Building2, Settings, PenTool } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import { CreateContentModal, CreatePostModal, CreateVideoModal, CreateCommunityModal } from '../modals';
import type { ContentType } from '../modals/CreateContentModal';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar de navegação principal da aplicação
 * Exibe menu de navegação, criadores em alta e perfil do usuário
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, userProfile } = useAuth();
  const { openModal, closeModal, isModalOpen } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Nome de exibição (usado na sidebar) - prioriza o name do banco
  const displayName = userProfile?.name ||
                      user?.user_metadata?.full_name ||
                      user?.user_metadata?.name ||
                      userProfile?.username ||
                      user?.email?.split('@')[0] ||
                      'Usuário';

  // Helper function to extract avatar URL from user metadata
  const getAvatarUrl = () => {
    const metadata = user?.user_metadata;

    // Try different possible avatar field names from OAuth providers
    const possibleFields = ['avatar_url', 'picture', 'photo', 'profile_picture', 'image'];

    // Check direct metadata fields first (Facebook typically stores here, Google also uses 'picture')
    for (const field of possibleFields) {
      if (metadata?.[field]) {
        return metadata[field];
      }
    }

    // Check nested identities data (common for some OAuth setups)
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF424D&color=fff&bold=true`;
  };

  const userAvatar = getAvatarUrl();

  /**
   * Handler para seleção de tipo de conteúdo no modal principal
   */
  const handleContentTypeSelect = (type: ContentType) => {
    closeModal('createContent'); // Fecha o modal principal
    switch (type) {
      case 'post':
        openModal('createPost');
        break;
      case 'video':
        openModal('createVideo');
        break;
      case 'community':
        openModal('createCommunity');
        break;
      default:
        console.warn(`Tipo de conteúdo não suportado: ${type}`);
    }
  };

  /**
   * Handler para publicação de post (callback do CreatePostModal)
   */
  const handlePostPublish = (postData: any) => {
    console.log('Post publicado:', postData);
    // TODO: Integrar com API quando implementado
  };

  /**
   * Handler para publicação de vídeo (callback do CreateVideoModal)
   */
  const handleVideoPublish = (videoData: any) => {
    console.log('Vídeo publicado:', videoData);
    // TODO: Integrar com API quando implementado
  };

  /**
   * Handler para criação de comunidade (callback do CreateCommunityModal)
   */
  const handleCommunityCreate = (communityData: any) => {
    console.log('Comunidade criada:', communityData);
    // TODO: Integrar com API quando implementado
  };

  const navigationItems = [
    { icon: <Home size={20} />, label: 'Home', route: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: <Flame size={20} />, label: 'Trending', route: '/dashboard', active: false }, // TODO: Add trending page
    { icon: <Bell size={20} />, label: 'Notifications', route: '/notifications', active: location.pathname === '/notifications' },
    { icon: <MessageCircle size={20} />, label: 'Messages', route: '/messages', active: location.pathname === '/messages' },
    { icon: <Users size={20} />, label: 'Following', route: '/dashboard', active: false }, // TODO: Add following page
    { icon: <Building2 size={20} />, label: 'Communities', route: '/communities', active: location.pathname === '/communities' },
    { icon: <Settings size={20} />, label: 'Settings', route: '/settings', active: location.pathname === '/settings' },
  ];

  /**
   * Handler para navegação entre páginas
   */
  const handleNavigation = (route: string) => {
    navigate(route);
    // Fecha sidebar em dispositivos móveis após navegação
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handler para fechar sidebar ao clicar no overlay
   */
  const handleOverlayClick = () => {
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handler para prevenir fechamento ao clicar no conteúdo da sidebar
   */
  const handleSidebarContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} onClick={handleSidebarContentClick}>
        <div className="sidebar-content">
          {/* User Avatar Section */}
          <div className="sidebar-avatar-section">
            <button
              className="sidebar-avatar-container"
              onClick={() => handleNavigation('/profile')}
              aria-label="Ir para perfil"
              title="Ir para perfil"
            >
              <img
                src={userAvatar}
                alt={displayName}
                className="sidebar-avatar"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF424D&color=fff&bold=true`;
                }}
              />
            </button>
          </div>

          {/* Navigation Icons */}
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {navigationItems.map((item, index) => (
                <li key={index} className="sidebar-nav-item">
                  <button
                    className={`sidebar-nav-button ${item.active ? 'active' : ''}`}
                    aria-label={item.label}
                    title={item.label}
                    onClick={() => handleNavigation(item.route)}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Create Button */}
          <div className="sidebar-create-section">
            <button
              className="sidebar-create-button"
              onClick={() => openModal('createContent')}
              aria-label="Criar novo conteúdo"
              title="Criar novo conteúdo"
            >
              <PenTool size={20} />
            </button>
          </div>
        </div>

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
        onPublish={handlePostPublish}
      />

      {/* Modal de criação de vídeo */}
      <CreateVideoModal
        isOpen={isModalOpen('createVideo')}
        onClose={() => closeModal('createVideo')}
        onPublish={handleVideoPublish}
      />

      {/* Modal de criação de comunidade */}
      <CreateCommunityModal
        isOpen={isModalOpen('createCommunity')}
        onClose={() => closeModal('createCommunity')}
        onCreate={handleCommunityCreate}
      />
    </aside>
    </>
  );
};

export default Sidebar;
