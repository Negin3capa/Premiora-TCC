import React, { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import { joinCommunity, leaveCommunity, isCommunityMember, getCommunityByName } from '../../utils/communityUtils';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/FeedSidebar.css';

interface CommunityInfoSectionProps {
  communityName: string;
}

const CommunityInfoSection: React.FC<CommunityInfoSectionProps> = ({ communityName }) => {
  const [community, setCommunity] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadCommunityData = async () => {
    if (!communityName) return;

    try {
      setLoading(true);
      const communityData = await getCommunityByName(communityName);

      if (communityData) {
        setCommunity(communityData);
        // Verificar se o usuário é membro
        if (user) {
          const isMember = await isCommunityMember(communityData.id);
          setIsJoined(isMember);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da comunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [communityName, user]);

  const handleJoinCommunity = async () => {
    if (!community || !user) return;

    try {
      setLoading(true);

      let success = false;
      if (isJoined) {
        success = await leaveCommunity(community.id);
        if (success) {
          setIsJoined(false);
          setCommunity((prev: any) => prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : null);
        }
      } else {
        success = await joinCommunity(community.id);
        if (success) {
          setIsJoined(true);
          setCommunity((prev: any) => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar participação na comunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!community) {
    if (loading) {
      return (
        <div className="feed-sidebar-section">
          <div className="feed-sidebar-loading">Carregando comunidade...</div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
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
    </>
  );
};

export default CommunityInfoSection;
