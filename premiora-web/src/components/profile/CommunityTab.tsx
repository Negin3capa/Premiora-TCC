import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import type { Community } from '../../types/community';
import type { CreatorProfile } from '../../types/profile';
import { Users, MessageCircle, Calendar, ExternalLink } from 'lucide-react';
import '../../styles/CommunityTab.css';

/**
 * Props do componente CommunityTab
 */
interface CommunityTabProps {
  /** Perfil do criador */
  creatorProfile: CreatorProfile;
}

/**
 * Componente CommunityTab - Aba de comunidade do perfil
 * Exibe a comunidade do criador caso ele tenha uma
 */
const CommunityTab: React.FC<CommunityTabProps> = ({ creatorProfile }) => {
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca a comunidade do criador
   */
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!creatorProfile?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar comunidade do criador diretamente no Supabase
        const { data, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('creator_id', creatorProfile.user.id)
          .single();

        if (communityError) {
          if (communityError.code === 'PGRST116') {
            // Comunidade não encontrada - criador não tem comunidade
            setCommunity(null);
          } else {
            throw communityError;
          }
        } else {
          // Comunidade encontrada
          const creatorCommunity: Community = {
            id: data.id,
            name: data.name,
            displayName: data.display_name,
            description: data.description,
            bannerUrl: data.cover_image_url,
            avatarUrl: data.avatar_url,
            creatorId: data.creator_id,
            isPrivate: data.is_private,
            memberCount: data.member_count,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          setCommunity(creatorCommunity);
        }
      } catch (err) {
        console.error('Erro ao buscar comunidade:', err);
        setError('Erro ao carregar comunidade');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [creatorProfile.user?.id]);

  /**
   * Handler para navegar para a página da comunidade
   */
  const handleNavigateToCommunity = () => {
    if (community) {
      navigate(`/c/${community.name}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="community-tab">
        <div className="loading-community">
          <p>Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="community-tab">
        <div className="error-community">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No community state
  if (!community) {
    return (
      <div className="community-tab">
        <div className="no-community">
          <div className="no-community-icon">
            <Users size={48} />
          </div>
          <h3>Sem comunidade</h3>
          <p>Este criador ainda não criou uma comunidade.</p>
          <p>As comunidades permitem que criadores se conectem com seus seguidores de forma mais próxima.</p>
        </div>
      </div>
    );
  }

  // Community display
  return (
    <div className="community-tab">
      <div className="community-header">
        <div className="community-avatar">
          <img
            src={community.avatarUrl}
            alt={community.displayName}
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(community.displayName)}&background=FF424D&color=fff&bold=true`;
            }}
          />
        </div>
        <div className="community-info">
          <h2 className="community-name">{community.displayName}</h2>
          <p className="community-tag">r/{community.name}</p>
        </div>
        <button
          className="visit-community-button"
          onClick={handleNavigateToCommunity}
          title="Visitar comunidade"
        >
          <ExternalLink size={16} />
          Visitar
        </button>
      </div>

      <div className="community-description">
        <p>{community.description}</p>
      </div>

      <div className="community-stats">
        <div className="stat-item">
          <Users size={16} />
          <span className="stat-value">{community.memberCount.toLocaleString()}</span>
          <span className="stat-label">membros</span>
        </div>
        <div className="stat-item">
          <Calendar size={16} />
          <span className="stat-value">
            {new Date(community.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <span className="stat-label">criada em</span>
        </div>
      </div>

      <div className="community-actions">
        <button
          className="action-button primary"
          onClick={handleNavigateToCommunity}
        >
          <MessageCircle size={16} />
          Participar da conversa
        </button>
      </div>

      <div className="community-preview">
        <h4>Sobre esta comunidade</h4>
        <p>
          Esta é a comunidade oficial de {creatorProfile.user?.name || creatorProfile.user?.username}.
          Aqui você pode interagir diretamente com o criador, discutir conteúdo,
          compartilhar ideias e fazer parte de uma comunidade exclusiva.
        </p>
      </div>
    </div>
  );
};

export default CommunityTab;
