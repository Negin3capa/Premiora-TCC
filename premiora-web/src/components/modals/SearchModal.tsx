/**
 * Dropdown de resultados de busca global
 * Mostra resultados de busca abaixo da barra de pesquisa
 */
import React, { useEffect, useRef } from 'react';
import { useModal } from '../../hooks/useModal';
import { useSearch } from '../../hooks/useSearch';
import SearchResults from '../common/SearchResults';
import '../../styles/modals.css';

/**
 * Props do componente SearchModal
 */
interface SearchModalProps {
  /** Indica se o dropdown está aberto */
  isOpen: boolean;
  /** Callback chamado ao fechar o dropdown */
  onClose: () => void;
  /** Query de busca atual */
  searchQuery: string;
}

/**
 * Dropdown para resultados de busca global
 * Aparece abaixo da barra de busca mostrando apenas os resultados
 */
const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery
}) => {
  const { closeModal } = useModal();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    users,
    communities,
    content,
    loading,
    clearSearch,
    performSearch
  } = useSearch();

  /**
   * Handler para fechar o dropdown
   */
  const handleClose = () => {
    clearSearch();
    closeModal('search');
    onClose();
  };

  /**
   * Handler para tecla Escape
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  /**
   * Handler para clique fora do dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Effect para executar busca quando searchQuery muda
   */
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  // Não renderiza se o dropdown não estiver aberto ou não houver query
  if (!isOpen || !searchQuery.trim()) return null;

  return (
    <div className="search-dropdown" ref={dropdownRef}>
      {/* Resultados da busca */}
      <div className="search-dropdown-results">
        <SearchResults
          query={searchQuery}
          users={users}
          communities={communities}
          content={content}
          loading={loading}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default SearchModal;
