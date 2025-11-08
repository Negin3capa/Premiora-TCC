/**
 * Página de criação de comunidades
 * Mostra um preview interativo da comunidade para edição antes da criação
 */
import React from 'react';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { CommunityBannerEditable } from '../components/profile/CommunityBannerEditable';
import { CommunityRulesEditable } from '../components/profile/CommunityRulesEditable';
import { useCommunityCreate } from '../hooks/useCommunityCreate';
import '../styles/CommunityPage.css';

/**
 * Página de criação de comunidades
 * Permite edição interativa da comunidade com preview em tempo real
 *
 * @component
 */
const CreateCommunityPage: React.FC = () => {
  const {
    community,
    isCreating,
    isUploading,
    error,
    hasChanges,
    updateName,
    updateDisplayName,
    updateDescription,
    updateBanner,
    updateAvatar,
    updateRules,
    create,
    cancel,
    clearError
  } = useCommunityCreate();

  // State for description editing
  const [editingDescription, setEditingDescription] = React.useState(false);
  const [tempDescription, setTempDescription] = React.useState('');



  return (
    <div className="community-page">
      <Sidebar />
      <div className="main-content">
        <Header />

        {/* Community Banner Editable - Full screen width */}
        <div style={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginTop: '64px', /* Account for header height */
        }}>
          <CommunityBannerEditable
            community={community}
            isUploading={isUploading}
            onUpdateName={updateName}
            onUpdateDisplayName={updateDisplayName}
            onUpdateDescription={updateDescription}
            onUpdateAvatar={updateAvatar}
            onUpdateBanner={updateBanner}
            onSave={create}
            onCancel={cancel}
            hasChanges={hasChanges}
            isSaving={isCreating}
          />
        </div>

        {/* Main content container - adjusted for fixed sidebar and header */}
        <div style={{
          marginLeft: '80px', /* Account for sidebar width */
          marginTop: '0', /* Banner now handles the top spacing */
          padding: '2rem 1rem',
          overflow: 'visible', /* Changed from hidden to visible to allow button to show */
        }}>
          {/* Content container */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            overflow: 'hidden',
          }}>
            <div className="community-layout">
              <div className="community-main-content">
                {/* Community Highlights */}
                <div className="community-highlights">
                  <div className="highlights-header">
                    <span className="highlights-icon">✨</span>
                    Destaques da comunidade
                    <button className="expand-button">▼</button>
                  </div>
                  <div style={{
                    padding: '1rem',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '8px',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      Esta é uma prévia de como sua comunidade ficará. Publique posts para ver destaques aqui!
                    </p>
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="sort-controls">
                  <button className="sort-button active">
                    <span style={{ fontSize: '16px' }}>🔥</span>
                    Quente
                  </button>
                  <button className="sort-button">
                    <span style={{ fontSize: '16px' }}>✨</span>
                    Novo
                  </button>
                  <button className="sort-button">
                    <span style={{ fontSize: '16px' }}>📈</span>
                    Mais votado
                  </button>
                  <button className="sort-button">
                    <span style={{ fontSize: '16px' }}>💬</span>
                    Comentado
                  </button>
                </div>

                {/* Posts Feed Preview */}
                <div className="posts-feed">
                  <div className="empty-community-message">
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: '12px',
                      border: '2px dashed var(--color-border-medium)'
                    }}>
                      <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        opacity: 0.6
                      }}>
                        📝
                      </div>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        color: 'var(--color-text-primary)',
                        fontSize: '1.25rem'
                      }}>
                        Sua comunidade está quase pronta!
                      </h3>
                      <p style={{
                        margin: '0',
                        color: 'var(--color-text-secondary)',
                        fontSize: '1rem',
                        lineHeight: 1.5
                      }}>
                        Após criar a comunidade, você poderá publicar posts e convidar membros.
                        <br />
                        Esta área mostrará os posts mais recentes da sua comunidade.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Sidebar */}
              <div className="community-sidebar">
                {/* Community Info Card */}
                <div className="sidebar-section community-info-card">
                  <h3 className="sidebar-title">Sobre a comunidade</h3>
                  <div style={{ position: 'relative' }}>
                    <p
                      className="community-description"
                      onClick={() => setEditingDescription(true)}
                      style={{
                        cursor: 'pointer',
                        opacity: community.description ? 1 : 0.6
                      }}
                      title="Clique para editar a descrição da comunidade"
                    >
                      {community.description || 'Descrição da comunidade'}
                    </p>
                    {editingDescription && (
                      <input
                        type="text"
                        value={tempDescription}
                        onChange={(e) => {
                          setTempDescription(e.target.value);
                          updateDescription(e.target.value);
                        }}
                        onBlur={() => {
                          setEditingDescription(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingDescription(false);
                          } else if (e.key === 'Escape') {
                            setEditingDescription(false);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          padding: '0',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          textShadow: '0 0 8px rgba(0,0,0,0.8)'
                        }}
                        autoFocus
                        maxLength={500}
                      />
                    )}
                  </div>

                  <div className="community-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👥</span>
                      <span>1 membro</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📅</span>
                      <span>Criada agora</span>
                    </div>
                  </div>

                  <div className="community-metrics">
                    <div className="metric">
                      <span className="metric-number">1</span>
                      <span className="metric-label">Online</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">0</span>
                      <span className="metric-label">Hoje</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">0</span>
                      <span className="metric-label">Esta semana</span>
                    </div>
                  </div>
                </div>

                {/* User Flair Section */}
                <div className="sidebar-section user-flair-section">
                  <h4 className="sidebar-subtitle">Seu flair nesta comunidade</h4>
                  <div className="user-flair-preview">
                    <span className="flair-icon">🏷️</span>
                    <span className="flair-text">Criador</span>
                    <span className="flair-badge">Especial</span>
                  </div>
                </div>

                {/* Rules Section - Editable */}
                <CommunityRulesEditable
                  rules={community.rules}
                  onUpdateRules={updateRules}
                  isSaving={isCreating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomBar />

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCommunityPage;
