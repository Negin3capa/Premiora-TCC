/**
 * Componente Header
 * Barra superior com busca, notificações, perfil do usuário e logout
 */
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth';
import { searchCommunities } from '../../utils/communityUtils';
import SearchResults from '../common/SearchResults';
import type { Community } from '../../types/community';
import type { ContentItem } from '../../types/content';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User | null;
  onToggleSidebar?: () => void;
}

/**
 * Header da aplicação com busca e perfil do usuário
 * @param searchQuery - Query atual da busca
 * @param onSearchChange - Callback para atualizar a query de busca
 * @param user - Objeto do usuário autenticado do Supabase
 */
const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, user, onToggleSidebar }) => {
  const { signOut, userProfile } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    communities: Community[];
    content: ContentItem[];
  }>({ communities: [], content: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Extrai informações do perfil do usuário
  const userName = user?.user_metadata?.full_name ||
                   user?.user_metadata?.name ||
                   userProfile?.name ||
                   user?.email?.split('@')[0] ||
                   'Usuário';

  /**
   * Helper function to extract avatar URL from user metadata
   * Handles different OAuth provider structures (Google, Facebook, etc.)
   */
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
  };

  const userAvatar = getAvatarUrl();

  /**
   * Effect para buscar resultados quando a query muda
   */
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setSearchLoading(true);
      setShowSearchResults(true);

      searchTimeoutRef.current = window.setTimeout(async () => {
        try {
          const communities = await searchCommunities(searchQuery);
          // TODO: Implementar busca de conteúdo quando disponível
          setSearchResults({
            communities,
            content: [] // Por enquanto, apenas comunidades
          });
        } catch (error) {
          console.error('Erro na busca:', error);
          setSearchResults({ communities: [], content: [] });
        } finally {
          setSearchLoading(false);
        }
      }, 300); // Debounce de 300ms
    } else {
      setShowSearchResults(false);
      setSearchResults({ communities: [], content: [] });
      setSearchLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  /**
   * Effect para fechar resultados ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Effect para detectar scroll e mostrar/ocultar header no mobile
   */
  useEffect(() => {
    const handleScroll = () => {
      // Only apply on mobile devices (screens <= 768px)
      if (window.innerWidth > 768) return;

      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Determine scroll direction with minimum threshold to avoid jitter
      const scrollDifference = Math.abs(currentScrollY - previousScrollY);

      if (scrollDifference > 5) { // Minimum scroll difference to avoid jitter
        if (currentScrollY > previousScrollY && currentScrollY > 30) {
          // Scrolling down and past threshold - hide header
          setIsHeaderVisible(false);
        } else if (currentScrollY < previousScrollY) {
          // Scrolling up - show header immediately
          setIsHeaderVisible(true);
        }
      }

      // Update last scroll position
      lastScrollY.current = currentScrollY;

      // Auto-show header after 2 seconds of no scrolling
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsHeaderVisible(true);
      }, 2000);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handler para fechar resultados de busca
   */
  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  /**
   * Handler para realizar logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className={`header ${!isHeaderVisible ? 'header-hidden' : ''}`}>
      <div className="header-content">
        {/* Mobile user avatar menu */}
        {onToggleSidebar && (
          <button
            className="mobile-menu-button"
            onClick={onToggleSidebar}
            aria-label="Abrir menu lateral"
            title="Menu"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="mobile-avatar"
              onError={(e) => {
                // Fallback caso a imagem falhe ao carregar
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
              }}
            />
          </button>
        )}
        <div className="header-spacer"></div>
        <div className="search-section" ref={searchContainerRef}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar comunidades, criadores, vídeos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2 && (searchResults.communities.length > 0 || searchResults.content.length > 0)) {
                  setShowSearchResults(true);
                }
              }}
              className="search-input"
              aria-label="Buscar conteúdo"
            />
            <button
              className="search-button"
              aria-label="Realizar busca"
              onClick={() => {
                // TODO: Implementar busca avançada
                console.log('Buscando:', searchQuery);
              }}
            >
              <span className="search-icon">🔍</span>
            </button>
          </div>

          {showSearchResults && (
            <SearchResults
              query={searchQuery}
              communities={searchResults.communities}
              content={searchResults.content}
              loading={searchLoading}
              onClose={handleCloseSearchResults}
            />
          )}
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button
              className="action-button"
              aria-label="Notificações"
              title="Notificações"
            >
              <span className="action-icon">🔔</span>
            </button>

            <button
              className="action-button"
              aria-label="Mensagens"
              title="Mensagens"
            >
              <span className="action-icon">💬</span>
            </button>

            <div className="user-profile">
              {user ? (
                <div className="profile-dropdown">
                  <div
                    className="profile-info"
                    title={`Perfil de ${userName}`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="profile-avatar"
                      onError={(e) => {
                        // Fallback caso a imagem falhe ao carregar
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF424D&color=fff&bold=true`;
                      }}
                    />
                    <div className="profile-details">
                      <span className="profile-name">{userName}</span>
                      <span className="profile-status">Online</span>
                    </div>
                    <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
                  </div>

                  {showProfileMenu && (
                    <div className="profile-menu">
                      <div className="profile-menu-header">
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="profile-menu-avatar"
                        />
                        <div>
                          <div className="profile-menu-name">{userName}</div>
                          <div className="profile-menu-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="profile-menu-divider" />
                      <button className="profile-menu-item">
                        <span>👤</span>
                        Ver Perfil
                      </button>
                      <button className="profile-menu-item">
                        <span>⚙️</span>
                        Configurações
                      </button>
                      <div className="profile-menu-divider" />
                      <button
                        className="profile-menu-item logout-item"
                        onClick={handleLogout}
                      >
                        <span>🚪</span>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="login-button">Entrar</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
