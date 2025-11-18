import React, { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import SearchModal from '../modals/SearchModal';
import { useModal } from '../../hooks/useModal';
import { joinCommunity, leaveCommunity, isCommunityMember, getCommunityByName } from '../../utils/communityUtils';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/FeedSidebar.css';

/**
 * Componente CommunityPostSidebar - Sidebar específica para posts de comunidade
 * Exibe informações da comunidade, regras e botão de participar
 * Mantém a barra de pesquisa no topo, similar ao SidebarFeed
 */
const CommunityPostSidebar: React.FC<{ communityName: string }> = ({ communityName }) => {
  const [community, setCommunity] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isModalOpen } = useModal();
  const { user } = useAuth();

  /**
   * Carrega dados da comunidade
   */
  const loadCommunityData = async () => {
    if (!communityName) return;

    try {
      setLoading(true);
      const communityData = await getCommunityByName(communityName);

      if (communityData) {
        setCommunity(communityData);
        // Verificar se o usuário é membro
        const isMember = await isCommunityMember(communityData.id);
        setIsJoined(isMember);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da comunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadCommunityData();
  }, [communityName]);

  /**
   * Handler para participar/sair da comunidade
   */
  const handleJoinCommunity = async () => {
    if (!community || !user) return;

    try {
      setLoading(true);

      let success = false;
      if (isJoined) {
        success = await leaveCommunity(community.id);
        if (success) {
          setIsJoined(false);
          setCommunity((prev: any) => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
        }
      } else {
        success = await joinCommunity(community.id);
        if (success) {
          setIsJoined(true);
          setCommunity((prev: any) => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
        }
      }

      if (success) {
        // Recarregar dados da comunidade após mudança de status
        await loadCommunityData();
      }
    } catch (error) {
      console.error('Erro ao alterar participação na comunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!community) {
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

          {isModalOpen('search') && searchQuery.trim() && (
            <SearchModal
              isOpen={true}
              onClose={() => {}}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Loading state */}
        <div className="feed-sidebar-section">
          <div className="feed-sidebar-loading">Carregando comunidade...</div>
        </div>
      </aside>
    );
  }

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

        {isModalOpen('search') && searchQuery.trim() && (
          <SearchModal
            isOpen={true}
            onClose={() => {}}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Community Info Card */}
      <div className="feed-sidebar-section community-sidebar-info-card">
        <h3 className="feed-sidebar-title">Sobre a comunidade</h3>
        <p className="community-description">{community.description}</p>

        <div className="community-stats">
          <div className="stat-item">
            <span className="stat-icon"><Users size={14} /></span>
            <span>{community.memberCount?.toLocaleString('pt-BR')} membros</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><Calendar size={14} /></span>
            <span>Criada em {new Date(community.createdAt || community.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="community-metrics">
          <div className="metric">
            <span className="metric-number">{Math.floor((community.memberCount || 0) * 0.05)}</span>
            <span className="metric-label">Online</span>
          </div>
          <div className="metric">
            <span className="metric-number">{Math.floor((community.memberCount || 0) / 30)}</span>
            <span className="metric-label">Hoje</span>
          </div>
          <div className="metric">
            <span className="metric-number">{Math.floor((community.memberCount || 0) / 7)}</span>
            <span className="metric-label">Esta semana</span>
          </div>
        </div>

        {/* Botão de Participar */}
        {user && (
          <button
            className={`join-community-button ${isJoined ? 'joined' : ''}`}
            onClick={handleJoinCommunity}
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isJoined ? 'Membro' : 'Participar')}
          </button>
        )}
      </div>

      {/* Regras da Comunidade */}
      <div className="feed-sidebar-section rules-section">
        <h4 className="feed-sidebar-title">Regras da comunidade</h4>
        <div className="rule-item">
          <div className="rule-header">
            <span className="rule-number">1</span>
            <span className="rule-title">Seja respeitoso</span>
            <span className="rule-toggle">▼</span>
          </div>
          <div className="rule-content">
            Trate todos os membros com respeito. Não toleramos assédio, discriminação ou conteúdo ofensivo.
          </div>
        </div>
        <div className="rule-item">
          <div className="rule-header">
            <span className="rule-number">2</span>
            <span className="rule-title">Conteúdo relevante</span>
            <span className="rule-toggle">▼</span>
          </div>
          <div className="rule-content">
            Mantenha as discussões relevantes ao tema da comunidade. Posts off-topic podem ser removidos.
          </div>
        </div>
        <div className="rule-item">
          <div className="rule-header">
            <span className="rule-number">3</span>
            <span className="rule-title">Sem spam</span>
            <span className="rule-toggle">▼</span>
          </div>
          <div className="rule-content">
            Evite postar repetidamente ou promover conteúdo comercial sem relevância.
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CommunityPostSidebar;
