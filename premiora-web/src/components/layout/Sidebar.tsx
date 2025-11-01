/**
 * Componente Sidebar
 * Barra lateral com navegação e perfil do usuário
 */
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CreateContentModal, CreatePostModal, CreateVideoModal, CreateCommunityModal } from '../modals';
import type { ContentType } from '../modals/CreateContentModal';

/**
 * Sidebar de navegação principal da aplicação
 * Exibe menu de navegação, criadores em alta e perfil do usuário
 */
const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Extrai informações do perfil do usuário
  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuário';
  
  const userAvatar = user?.user_metadata?.avatar_url || 
                     user?.user_metadata?.picture || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;

  // Estados para controlar modais
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = React.useState(false);
  const [isCreateVideoModalOpen, setIsCreateVideoModalOpen] = React.useState(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = React.useState(false);

  /**
   * Handler para seleção de tipo de conteúdo no modal principal
   */
  const handleContentTypeSelect = (type: ContentType) => {
    switch (type) {
      case 'post':
        setIsCreatePostModalOpen(true);
        break;
      case 'video':
        setIsCreateVideoModalOpen(true);
        break;
      case 'community':
        setIsCreateCommunityModalOpen(true);
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
    { icon: '🏠', label: 'Home', active: true },
    { icon: '🔥', label: 'Trending', active: false },
    { icon: '📺', label: 'Videos', active: false },
    { icon: '📱', label: 'Live', active: false },
    { icon: '👥', label: 'Following', active: false },
    { icon: '❤️', label: 'Liked', active: false },
    { icon: '📚', label: 'Library', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Premiora</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
            <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <button 
                className="nav-button"
                aria-label={item.label}
                aria-current={item.active ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botão Criar */}
      <div className="create-section" style={{
        padding: '0 var(--space-4)',
        marginBottom: 'var(--space-4)'
      }}>
        <button
          className="create-button"
          onClick={() => setIsCreateModalOpen(true)}
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
            flexShrink: 0
          }}>
            ✏️
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
                alt={userName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)'
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '2px'
                }}>
                  {userName}
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectContentType={handleContentTypeSelect}
      />

      {/* Modal de criação de post */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPublish={handlePostPublish}
      />

      {/* Modal de criação de vídeo */}
      <CreateVideoModal
        isOpen={isCreateVideoModalOpen}
        onClose={() => setIsCreateVideoModalOpen(false)}
        onPublish={handleVideoPublish}
      />

      {/* Modal de criação de comunidade */}
      <CreateCommunityModal
        isOpen={isCreateCommunityModalOpen}
        onClose={() => setIsCreateCommunityModalOpen(false)}
        onCreate={handleCommunityCreate}
      />
    </aside>
  );
};

export default Sidebar;
