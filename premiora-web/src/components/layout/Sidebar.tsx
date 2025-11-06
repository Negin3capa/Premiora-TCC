/**
 * Componente Sidebar
 * Barra lateral com navegação e perfil do usuário
 */
import React from 'react';
import './Sidebar.css';
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
    { icon: <Home size={20} />, label: 'Home', route: '/home', active: true },
    { icon: <Flame size={20} />, label: 'Trending', route: '/trending', active: false },
    { icon: <Bell size={20} />, label: 'Notifications', route: '/notifications', active: false },
    { icon: <MessageCircle size={20} />, label: 'Messages', route: '/messages', active: false },
    { icon: <Users size={20} />, label: 'Following', route: '/following', active: false },
    { icon: <Building2 size={20} />, label: 'Communities', route: '/communities', active: false },
    { icon: <Settings size={20} />, label: 'Settings', route: '/settings', active: false },
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
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Premiora</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.route;
            return (
              <li key={index} className={`nav-item ${isActive ? 'active' : ''}`}>
                <button
                  className="nav-button"
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleNavigation(item.route)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Botão Criar */}
      <div className="create-section" style={{
        padding: '0 var(--space-4)',
        marginBottom: 'var(--space-4)'
      }}>
        <button
          className="create-button"
          onClick={() => openModal('createContent')}
          aria-label="Criar novo conteúdo"
          title="Criar novo conteúdo"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF6B75 100%)',
            color: 'var(--color-text-white)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 4px 12px rgba(255, 66, 77, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 66, 77, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 66, 77, 0.3)';
          }}
        >
          <span className="create-icon" style={{
            fontSize: 'var(--font-size-xl)',
            width: '24px',
            textAlign: 'center',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PenTool size={20} />
          </span>
          <span className="create-label">Criar</span>
        </button>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="user-section" style={{ 
            padding: 'var(--space-3)', 
            marginBottom: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-light)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-3)',
              cursor: 'pointer'
            }}>
              <img
                src={userAvatar}
                alt={displayName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)'
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF424D&color=fff&bold=true`;
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '2px'
                }}>
                  {displayName}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)'
                }}>
                  Ver perfil
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="creator-section">
          <h3>Creators em Alta</h3>
          <div className="mini-creator-list">
            {[
              { name: 'Ana Silva', status: 'Online' },
              { name: 'João Santos', status: 'Online' },
              { name: 'Maria Costa', status: 'Online' }
            ].map((creator, i) => (
              <div key={i} className="mini-creator-item">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random&color=fff`}
                  alt={creator.name}
                  className="mini-creator-avatar"
                />
                <div className="mini-creator-info">
                  <span className="mini-creator-name">{creator.name}</span>
                  <span className="mini-creator-status">{creator.status}</span>
                </div>
              </div>
            ))}
          </div>
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
