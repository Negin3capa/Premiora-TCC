/**
 * Componente Header - Versão com Busca
 * Header com funcionalidade de busca global integrada
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../../hooks/useAuth';
import SearchResults from '../common/SearchResults';
import '../../styles/Header.css';
import { Search, Bell, X, LogOut, UserPlus, Menu } from 'lucide-react';

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
}

/**
 * Header com funcionalidade de busca integrada
 */
const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isProfileMode = false,
  showTabs = false,
  activeTab = 'forYou',
  onTabChange
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, signOut } = useAuth();

  // Estado da busca
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    searchQuery,
    users,
    communities,
    content,
    loading,
    setSearchQuery,
    clearSearch
  } = useSearch();

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
      case 'search':
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  /**
   * Fecha a busca
   */
  const closeSearch = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  /**
   * Handler para mudança no input de busca
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handler para tecla Enter no input
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeSearch();
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
   * Fecha busca ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isSearchOpen || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, isDropdownOpen]);

  return (
    <header className={`header ${isProfileMode ? 'header--profile-mode' : ''}`}>
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

        {/* Center - Logo */}
        <div className="header-center">
          <h1 className="header-title">Premiora</h1>
        </div>

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

        {/* Center - Search */}
        {isSearchOpen && (
          <div className="header-search" ref={searchRef}>
            <div className="search-input-container">
              <Search size={18} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar usuários, comunidades e conteúdo..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  className="search-clear-button"
                  onClick={clearSearch}
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Resultados da busca */}
            <SearchResults
              query={searchQuery}
              users={users}
              communities={communities}
              content={content}
              loading={loading}
              onClose={closeSearch}
            />
          </div>
        )}

        {/* Right side - Actions */}
        <div className="header-right">
          {!isSearchOpen && (
            <button
              className="header-action-button"
              aria-label="Buscar"
              title="Buscar"
              onClick={() => handleAction('search')}
            >
              <Search size={20} />
            </button>
          )}

          <button
            className="header-action-button"
            aria-label="Notificações"
            title="Notificações"
            onClick={() => handleAction('notifications')}
          >
            <Bell size={20} />
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
