import React, { useState, useEffect } from 'react';
import { Search, Globe, Lock, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CreatorChannelService } from '../../services/content/CreatorChannelService';
import type { Community } from '../../types/community';
import '../../styles/CommunityConnection.css';

interface CommunityConnectionProps {
  selectedCommunityId?: string;
  onCommunitySelect: (communityId: string | null) => void;
}

const CommunityConnection: React.FC<CommunityConnectionProps> = ({
  selectedCommunityId,
  onCommunitySelect
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!userProfile?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await CreatorChannelService.getUserCommunities(userProfile.id);
        setCommunities(data);
      } catch (err) {
        console.error('Erro ao buscar comunidades:', err);
        setError('Não foi possível carregar suas comunidades. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [userProfile?.id]);

  const filteredCommunities = communities.filter(c =>
    c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="community-connection">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Carregando suas comunidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-connection">
        <div className="flex flex-col items-center justify-center py-12 text-red-400">
          <AlertCircle className="mb-2" size={32} />
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="community-connection">
      <div className="info-card">
        <h3 className="info-title">Conectar Comunidade</h3>
        <p className="info-text">
          Conecte uma de suas comunidades ao seu canal de criador. Membros de níveis superiores
          terão acesso automático aos canais privados da comunidade conectada.
        </p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar suas comunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="communities-list">
        {filteredCommunities.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <p>Nenhuma comunidade encontrada para "{searchTerm}"</p>
            ) : (
              <>
                <Users size={48} className="mb-4 opacity-50" />
                <p className="font-semibold mb-2">Você ainda não tem comunidades</p>
                <p className="text-sm opacity-70">Crie uma comunidade primeiro para conectá-la ao seu canal.</p>
              </>
            )}
          </div>
        ) : (
          filteredCommunities.map(community => (
            <div
              key={community.id}
              className={`community-item ${selectedCommunityId === community.id ? 'selected' : ''}`}
              onClick={() => onCommunitySelect(
                selectedCommunityId === community.id ? null : community.id
              )}
            >
              <div className="community-avatar">
                {community.avatarUrl ? (
                  <img src={community.avatarUrl} alt={community.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {community.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="community-info">
                <h4 className="community-name">{community.displayName}</h4>
                <p className="community-handle">@{community.name}</p>
                {community.description && (
                  <p className="community-description">{community.description}</p>
                )}
                <div className="community-meta">
                  {community.isPrivate ? (
                    <span className="meta-badge">
                      <Lock size={14} /> Privada
                    </span>
                  ) : (
                    <span className="meta-badge">
                      <Globe size={14} /> Pública
                    </span>
                  )}
                  {community.memberCount !== undefined && (
                    <span className="meta-badge">
                      <Users size={14} /> {community.memberCount.toLocaleString()} membros
                    </span>
                  )}
                </div>
              </div>

              {selectedCommunityId === community.id && (
                <div className="selected-indicator">
                  <div className="checkmark">✓</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedCommunityId && (
        <button
          onClick={() => onCommunitySelect(null)}
          className="disconnect-btn"
        >
          Desconectar Comunidade
        </button>
      )}
    </div>
  );
};

export default CommunityConnection;
