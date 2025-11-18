/**
 * Componente Header
 * Header principal da aplicação
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Header.css';
import { Sun, LogOut, UserPlus, Menu } from 'lucide-react';

/**
 * Hook personalizado para detectar scroll e controlar visibilidade do header
 */
const useScrollVisibility = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Only apply scroll behavior on mobile devices
    if (window.innerWidth > 768) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // Minimum scroll distance to trigger hide/show

      // Determine scroll direction and distance
      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only trigger if scrolled enough
      if (scrollDifference > scrollThreshold) {
        if (isScrollingDown && currentScrollY > 100) {
          // Scrolling down - hide header
          setIsHidden(true);
        } else if (!isScrollingDown) {
          // Scrolling up - show header
          setIsHidden(false);
        }

        setLastScrollY(currentScrollY);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return isHidden;
};

/**
 * Props do componente Header
 */
interface HeaderProps {
  /** Callback para alternar estado da sidebar principal */
  onToggleSidebar?: () => void;
  /** Se está em modo perfil (sidebar compacta) */
  isProfileMode?: boolean;
  /** Se deve mostrar abas de navegação (apenas no Dashboard) */
  showTabs?: boolean;
  /** Aba ativa atual */
  activeTab?: 'forYou' | 'following';
  /** Handler para mudança de aba */
  onTabChange?: (tab: 'forYou' | 'following') => void;
  /** Se deve mostrar abas de perfil */
  showProfileTabs?: boolean;
  /** Aba ativa do perfil */
  activeProfileTab?: 'home' | 'posts' | 'community' | 'shop';
  /** Handler para mudança de aba do perfil */
  onProfileTabChange?: (tab: 'home' | 'posts' | 'community' | 'shop') => void;
  /** Se deve mostrar barra de pesquisa no centro (substitui o logo) */
  showSearchBar?: boolean;
  /** Componente de barra de pesquisa customizada */
  searchBarComponent?: React.ReactNode;
  /** Classe CSS adicional para o header */
  className?: string;
}

/**
 * Header principal da aplicação
 */
const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isProfileMode = false,
  showTabs = false,
  activeTab = 'forYou',
  onTabChange,
  showProfileTabs = false,
  activeProfileTab = 'home',
  onProfileTabChange,
  showSearchBar = false,
  searchBarComponent,
  className = ''
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, signOut } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isHeaderHidden = useScrollVisibility();

  // Define o ícone de notificações (Sun)
  const NotificationIcon = Sun;

  // Nome de exibição (usado no header) - prioriza o name do banco
  const displayName = userProfile?.name ||
                      user?.user_metadata?.full_name ||
                      user?.user_metadata?.name ||
                      userProfile?.username ||
                      user?.email?.split('@')[0] ||
                      'Usuário';

  // Helper function to extract avatar URL from user metadata
  const getAvatarUrl = () => {
    // Priorizar avatar do banco de dados (definido pelo usuário)
    if (userProfile?.avatar_url) {
      return userProfile.avatar_url;
    }

    // Fallback para avatar OAuth (apenas se não há avatar customizado)
    const metadata = user?.user_metadata;
    const possibleFields = ['avatar_url', 'picture', 'photo', 'profile_picture', 'image'];

    // Check direct metadata fields (Facebook typically stores here, Google also uses 'picture')
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

    // Final fallback to generated avatar with user initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF424D&color=fff&bold=true`;
  };

  const userAvatar = getAvatarUrl();

  /**
   * Handler para ações do header
   */
  const handleAction = (action: string) => {
    switch (action) {
      case 'notifications':
        navigate('/notifications');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  /**
   * Handler para abrir/fechar dropdown do avatar
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Handler para fazer logout
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Mesmo com erro, fechar dropdown e navegar (logout local foi feito)
      setIsDropdownOpen(false);
      navigate('/login');
    }
  };

  /**
   * Handler para adicionar conta existente
   */
  const handleAddAccount = () => {
    setIsDropdownOpen(false);
    navigate('/login');
  };

  /**
   * Fecha dropdown ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className={`header ${isProfileMode ? 'header--profile-mode' : ''} ${isHeaderHidden ? 'header--hidden' : ''} ${className}`}>
      <div className="header-content">
        {/* Left side - Hamburger menu for mobile */}
        <div className="header-left">
          {onToggleSidebar && (
            <button
              className="header-hamburger-button"
              aria-label="Menu lateral"
              title="Menu lateral"
              onClick={onToggleSidebar}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Center - Search Bar Only */}
        {showSearchBar && searchBarComponent && (
          <div className="header-center">
            {searchBarComponent}
          </div>
        )}

        {/* Feed Tabs - Only shown on Dashboard */}
        {showTabs && (
          <div className="header-tabs">
            <button
              className={`header-tab ${activeTab === 'forYou' ? 'active' : ''}`}
              onClick={() => onTabChange?.('forYou')}
              aria-label="Feed geral"
            >
              For You
            </button>
            <button
              className={`header-tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => onTabChange?.('following')}
              aria-label="Posts dos usuários seguidos"
            >
              Following
            </button>
          </div>
        )}

        {/* Profile Tabs - Only shown on Profile pages */}
        {showProfileTabs && (
          <div className="header-tabs header-tabs--profile">
            <button
              className={`header-tab ${activeProfileTab === 'home' ? 'active' : ''}`}
              onClick={() => onProfileTabChange?.('home')}
              aria-label="Página inicial do perfil"
            >
              Página Inicial
            </button>
            <button
              className={`header-tab ${activeProfileTab === 'posts' ? 'active' : ''}`}
              onClick={() => onProfileTabChange?.('posts')}
              aria-label="Posts do usuário"
            >
              Posts
            </button>
            <button
              className={`header-tab ${activeProfileTab === 'community' ? 'active' : ''}`}
              onClick={() => onProfileTabChange?.('community')}
              aria-label="Comunidade do usuário"
            >
              Comunidade
            </button>
            <button
              className={`header-tab ${activeProfileTab === 'shop' ? 'active' : ''}`}
              onClick={() => onProfileTabChange?.('shop')}
              aria-label="Loja do usuário"
            >
              Compras
            </button>
          </div>
        )}

        {/* Right side - Actions */}
        <div className="header-right">
          <button
            className="header-action-button"
            aria-label="Notificações"
            title="Notificações"
            onClick={() => handleAction('notifications')}
          >
            <NotificationIcon size={20} />
          </button>

          <div className="header-avatar-dropdown" ref={dropdownRef}>
            <button
              className="header-avatar-container"
              onClick={toggleDropdown}
              aria-label="Menu do usuário"
              title="Menu do usuário"
            >
              <img
                src={userAvatar}
                alt={displayName}
                className="header-avatar"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF424D&color=fff&bold=true`;
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="header-dropdown-menu">
                <button
                  className="header-dropdown-item"
                  onClick={handleAddAccount}
                >
                  <UserPlus size={16} />
                  <span>Adicionar conta existente</span>
                </button>
                <button
                  className="header-dropdown-item header-dropdown-item--danger"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sair da conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
