import React, { useState, useRef } from 'react';
import { Search, Flame, TrendingUp, Rocket, Users, X } from 'lucide-react';
import UserSuggestions from '../content/UserSuggestions';
import SearchResults from '../common/SearchResults';
import { useSearch } from '../../hooks/useSearch';
import '../../styles/FeedSidebar.css';

/**
 * Interface para tópicos em tendência
 */
interface TrendingTopic {
  /** ID único do tópico */
  id: string;
  /** Nome do tópico/hashtag */
  name: string;
  /** Número de posts relacionados */
  postCount: number;
  /** Categoria do tópico */
  category?: string;
}

/**
 * Props do componente FeedSidebar
 */
interface FeedSidebarProps {
  /** Indica se a sidebar está aberta (para mobile) */
  isOpen?: boolean;
  /** Callback para fechar a sidebar */
  onClose?: () => void;
}

/**
 * Componente FeedSidebar - Barra lateral do feed
 * Exibe tópicos em tendência, sugestões de usuários e conteúdo relacionado ao feed
 *
 * @component
 */
const FeedSidebar: React.FC<FeedSidebarProps> = ({ isOpen = false, onClose }) => {
  // Estado para controle do foco da busca
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hook de busca
  const {
    searchQuery,
    users,
    communities,
    content,
    loading,
    setSearchQuery,
    clearSearch
  } = useSearch();

  // Dados mockados para tópicos em tendência (reduzido para caber melhor)
  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: '#Premiora', postCount: 1250, category: 'Tecnologia' },
    { id: '2', name: '#ReactJS', postCount: 890, category: 'Programação' },
    { id: '3', name: '#DesignDigital', postCount: 654, category: 'Design' },
  ];

  /**
   * Formata o número de posts para exibição
   */
  const formatPostCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  /**
   * Handler para clique em tópico em tendência
   */
  const handleTopicClick = (topic: TrendingTopic) => {
    console.log('Tópico clicado:', topic.name);
    // TODO: Implementar navegação para tópico
  };

  /**
   * Handler para clique no overlay (mobile)
   */
  const handleOverlayClick = () => {
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handler para foco na busca
   */
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  /**
   * Handler para perda de foco na busca
   */
  const handleSearchBlur = () => {
    // Delay para permitir cliques nos resultados
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150);
  };

  /**
   * Handler para mudança no input de busca
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search input changed:', e.target.value);
    setSearchQuery(e.target.value);
  };

  /**
   * Handler para limpar busca
   */
  const handleClearSearch = () => {
    clearSearch();
    searchInputRef.current?.focus();
  };

  /**
   * Handler para fechar resultados de busca
   */
  const handleCloseSearchResults = () => {
    setIsSearchFocused(false);
    clearSearch();
  };

  /**
   * Handler para prevenir fechamento ao clicar no conteúdo
   */
  const handleSidebarContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="feed-sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside
        className={`feed-sidebar ${isOpen ? 'mobile-open' : ''}`}
        onClick={handleSidebarContentClick}
      >
        <div className="feed-sidebar-content">
          {/* Barra de Busca */}
          <section className="feed-sidebar-section search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar comunidades, usuários e conteúdo..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="search-input"
                  aria-label="Campo de busca"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                    aria-label="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Resultados da Busca */}
              {(isSearchFocused || searchQuery) && (
                <div className="search-results-container">
                  <SearchResults
                    query={searchQuery}
                    users={users}
                    communities={communities}
                    content={content}
                    loading={loading}
                    onClose={handleCloseSearchResults}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Tópicos em Tendência */}
          <section className="feed-sidebar-section">
            <div className="section-header">
              <h3 className="section-title">Tópicos em Tendência</h3>
              <Flame className="section-icon" size={18} />
            </div>

            <div className="trending-topics">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="trending-topic-item"
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="topic-info">
                    <span className="topic-name">{topic.name}</span>
                    {topic.category && (
                      <span className="topic-category">{topic.category}</span>
                    )}
                  </div>
                  <span className="topic-post-count">
                    {formatPostCount(topic.postCount)} posts
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Sugestões de Usuários */}
          <section className="feed-sidebar-section">
            <UserSuggestions suggestions={[]} />
          </section>

          {/* O que está acontecendo */}
          <section className="feed-sidebar-section">
            <div className="section-header">
              <h3 className="section-title">O que está acontecendo</h3>
              <TrendingUp className="section-icon" size={18} />
            </div>

            <div className="happening-items">
              <div className="happening-item">
                <Rocket className="happening-icon" size={20} />
                <div className="happening-content">
                  <p className="happening-text">
                    <strong>Novos recursos</strong> chegando em breve
                  </p>
                  <span className="happening-time">2h atrás</span>
                </div>
              </div>

              <div className="happening-item">
                <Users className="happening-icon" size={20} />
                <div className="happening-content">
                  <p className="happening-text">
                    <strong>+500 usuários</strong> se juntaram hoje
                  </p>
                  <span className="happening-time">4h atrás</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

export default FeedSidebar;
