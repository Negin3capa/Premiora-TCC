/**
 * Componente SearchResults
 * Exibe resultados de busca para comunidades e conteúdo
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community } from '../../types/community';
import type { ContentItem } from '../../types/content';

interface SearchResultsProps {
  query: string;
  communities: Community[];
  content: ContentItem[];
  loading: boolean;
  onClose: () => void;
}

/**
 * Componente que exibe resultados de busca em um dropdown/modal
 */
const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  communities,
  content,
  loading,
  onClose
}) => {
  const navigate = useNavigate();

  /**
   * Handler para navegar para uma comunidade
   */
  const handleCommunityClick = (community: Community) => {
    navigate(`/r/${community.name}`);
    onClose();
  };

  /**
   * Handler para navegar para conteúdo
   */
  const handleContentClick = (item: ContentItem) => {
    // TODO: Implementar navegação para conteúdo específico
    console.log('Navegar para conteúdo:', item.id);
    onClose();
  };

  if (loading) {
    return (
      <div className="search-results" style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div style={{
          padding: 'var(--space-4)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--space-2)' }}></div>
          Buscando...
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return null;
  }

  const hasResults = communities.length > 0 || content.length > 0;

  return (
    <div className="search-results" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-light)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      {!hasResults ? (
        <div style={{
          padding: 'var(--space-4)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          Nenhum resultado encontrado para "{query}"
        </div>
      ) : (
        <>
          {/* Resultados de comunidades */}
          {communities.length > 0 && (
            <div className="search-section">
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)'
              }}>
                Comunidades
              </div>
              {communities.slice(0, 5).map(community => (
                <div
                  key={community.id}
                  onClick={() => handleCommunityClick(community)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {community.avatarUrl ? (
                    <img
                      src={community.avatarUrl}
                      alt={community.displayName}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'bold'
                    }}>
                      r/
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: '2px'
                    }}>
                      r/{community.name}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {community.displayName} • {community.memberCount} membros
                    </div>
                  </div>
                </div>
              ))}
              {communities.length > 5 && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'center',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  Ver mais comunidades...
                </div>
              )}
            </div>
          )}

          {/* Resultados de conteúdo */}
          {content.length > 0 && (
            <div className="search-section">
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)'
              }}>
                Conteúdo
              </div>
              {content.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  onClick={() => handleContentClick(item)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border-light)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '2px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <span>{item.author}</span>
                    {item.communityId && (
                      <>
                        <span>•</span>
                        <span>r/{item.communityName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
