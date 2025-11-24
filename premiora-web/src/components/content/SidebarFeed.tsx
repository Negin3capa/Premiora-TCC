import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingService, type TrendingTopic, type TrendingStats } from '../../services/content/TrendingService';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, TrendingUp, BarChart3, Hash } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import SearchModal from '../modals/SearchModal';
import { useModal } from '../../hooks/useModal';
import '../../styles/FeedSidebar.css';

/**
 * Componente SidebarFeed - Sidebar para o feed do dashboard
 * Contém seções de "Seja um criador", "O que está acontecendo" e estatísticas
 * Atualizado para usar o sistema de tendências em tempo real
 *
 * @component
 */
const SidebarFeed: React.FC = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingStats, setTrendingStats] = useState<TrendingStats | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { isModalOpen } = useModal();
  const navigate = useNavigate();

  /**
   * Carrega dados da sidebar (tendências e estatísticas)
   */
  const loadSidebarData = async () => {
    try {
      setSidebarLoading(true);

      // Carregar tendências personalizadas ou globais
      const trendingResult = user?.id
        ? await TrendingService.getPersonalizedTrending(user.id, { limit: 5 })
        : await TrendingService.getTrendingTopics({ limit: 5 });

      const stats = await TrendingService.getTrendingStats();

      setTrendingTopics(trendingResult.topics);
      setTrendingStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados da sidebar:', error);
      // Em caso de erro, manter dados vazios
      setTrendingTopics([]);
      setTrendingStats(null);
    } finally {
      setSidebarLoading(false);
    }
  };

  // Carregar dados da sidebar ao montar o componente
  useEffect(() => {
    loadSidebarData();
  }, [user?.id]); // Recarregar quando usuário mudar

  return (
    <aside className="feed-sidebar">
      {/* Barra de Pesquisa */}
      <div className="search-bar-container">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Buscar no feed"
          openSearchModal={true}
        />

        {/* Search Dropdown */}
        {isModalOpen('search') && searchQuery.trim() && (
          <SearchModal
            isOpen={true}
            onClose={() => {}} // Handled by the modal itself
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Seja um criador */}
      <div className="feed-sidebar-section gift-section">
        <h3 className="feed-sidebar-title">
          <Sparkles size={20} />
          Seja um criador
        </h3>
        <div className="gift-content">
          <p>Compartilhe seu talento e crie conteúdo exclusivo para seus seguidores</p>
          <button 
            className="gift-btn"
            onClick={() => navigate('/creator/setup')}
          >
            <Sparkles size={16} />
            Começar
          </button>
        </div>
      </div>

      {/* O que está acontecendo */}
      <div className="feed-sidebar-section trending-section">
        <h3 className="feed-sidebar-title">
          <TrendingUp size={20} />
          O que está acontecendo
        </h3>
        {sidebarLoading ? (
          <div className="feed-sidebar-loading">Carregando tendências...</div>
        ) : (
          <div className="trending-list">
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic) => (
                <div key={topic.id} className="trending-item">
                  <div className="trending-header">
                    <Hash size={14} className="trending-hash" />
                    <span className="trending-reason">
                      {topic.trendReason === 'personalized' && 'Para você'}
                      {topic.trendReason === 'burst' && 'Em alta'}
                      {topic.trendReason === 'growing' && 'Crescendo'}
                      {topic.trendReason === 'high_engagement' && 'Popular'}
                    </span>
                  </div>
                  <div className="trending-content">
                    <div className="trending-title">{topic.title}</div>
                    <div className="trending-category">{topic.category}</div>
                    <div className="trending-stats">
                      <span className="trending-mentions">{topic.totalMentions} menções</span>
                      {topic.zScore && topic.zScore > 2 && (
                        <span className="trending-burst">🔥</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feed-sidebar-empty">Nenhuma tendência encontrada</div>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas do Sistema */}
      {trendingStats && (
        <div className="feed-sidebar-section stats-section">
          <h3 className="feed-sidebar-title">
            <BarChart3 size={20} />
            Sistema
          </h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-label">Tópicos ativos:</span>
              <span className="stat-value">{trendingStats.activeTopics}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Em tendência:</span>
              <span className="stat-value">{trendingStats.trendingTopics}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Score médio:</span>
              <span className="stat-value">{trendingStats.avgScore}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarFeed;
