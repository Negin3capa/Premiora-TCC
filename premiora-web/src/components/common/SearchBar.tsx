import React from 'react';
import { Search, Filter } from 'lucide-react';

/**
 * Props do componente SearchBar
 */
interface SearchBarProps {
  /** Valor atual da busca */
  searchQuery: string;
  /** Handler para mudança na busca */
  onSearchChange: (query: string) => void;
  /** Placeholder do input */
  placeholder?: string;
  /** Se deve mostrar o botão de filtros */
  showFilters?: boolean;
  /** Estado dos filtros expandidos */
  showFiltersExpanded?: boolean;
  /** Handler para toggle dos filtros */
  onToggleFilters?: () => void;
}

/**
 * Componente SearchBar - Barra de pesquisa reutilizável
 * Baseado na implementação do PostsTab com ícone de busca e botão de filtros opcional
 *
 * @component
 */
const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar conteúdo",
  showFilters = false,
  showFiltersExpanded = false,
  onToggleFilters
}) => {
  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <div className="search-input-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        {showFilters && onToggleFilters && (
          <button
            className={`filter-toggle-btn ${showFiltersExpanded ? 'active' : ''}`}
            onClick={onToggleFilters}
          >
            <Filter size={16} />
            Filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
