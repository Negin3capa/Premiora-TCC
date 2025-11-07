/**
 * Componente Header - Versão com Busca
 * Header com funcionalidade de busca global integrada
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import SearchResults from '../common/SearchResults';
import '../../styles/Header.css';
import { Search, Bell, User, X } from 'lucide-react';

/**
 * Header com funcionalidade de busca integrada
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado da busca
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    searchQuery,
    users,
    communities,
    content,
    loading,
    setSearchQuery,
    clearSearch
  } = useSearch();

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
      case 'profile':
        navigate('/profile');
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
   * Fecha busca ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <header className="header">
      <div className="header-content">
        {/* Left side - App title */}
        <div className="header-left">
          <h1 className="header-title">Premiora</h1>
        </div>

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

          <button
            className="header-action-button"
            aria-label="Perfil"
            title="Perfil"
            onClick={() => handleAction('profile')}
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
