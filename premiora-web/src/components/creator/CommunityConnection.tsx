import React, { useState, useEffect } from 'react';
import { Search, Globe, Lock, Users } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  memberCount?: number;
  isPrivate: boolean;
  avatarUrl?: string;
}

interface CommunityConnectionProps {
  selectedCommunityId?: string;
  onCommunitySelect: (communityId: string | null) => void;
}

const CommunityConnection: React.FC<CommunityConnectionProps> = ({
  selectedCommunityId,
  onCommunitySelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    // This would fetch user's communities from the API
    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'community-tech',
        displayName: 'Tech Community',
        description: 'A community for tech enthusiasts',
        memberCount: 1250,
        isPrivate: false
      },
      {
        id: '2',
        name: 'gaming-hub',
        displayName: 'Gaming Hub',
        description: 'For gamers worldwide',
        memberCount: 3500,
        isPrivate: false
      }
    ];
    setCommunities(mockCommunities);
  }, []);

  const filteredCommunities = communities.filter(c =>
    c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p>Nenhuma comunidade encontrada</p>
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
