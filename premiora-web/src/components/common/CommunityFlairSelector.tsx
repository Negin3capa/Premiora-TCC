import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { getUserCommunities } from '../../utils/communityUtils';
import type { Community } from '../../types/community';

interface CommunityFlairSelectorProps {
  selectedCommunityId?: string;
  onCommunitySelect: (communityId: string) => void;
  disabled?: boolean;
}

export const CommunityFlairSelector: React.FC<CommunityFlairSelectorProps> = ({
  selectedCommunityId,
  onCommunitySelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const userCommunities = await getUserCommunities();
        setCommunities(userCommunities);
      } catch (error) {
        console.error('Erro ao carregar comunidades:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!disabled) {
      loadCommunities();
    }
  }, [disabled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (communityId: string) => {
    onCommunitySelect(communityId);
    setIsOpen(false);
  };

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  return (
    <div className="community-flair-selector" style={{ position: 'relative' }} ref={dropdownRef}>
      {selectedCommunity ? (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flair-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid var(--primary-color)',
            background: 'rgba(var(--primary-rgb), 0.1)',
            color: 'var(--primary-color)',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {selectedCommunity.avatarUrl && (
            <img
              src={selectedCommunity.avatarUrl}
              alt={selectedCommunity.displayName}
              style={{ width: '16px', height: '16px', borderRadius: '50%' }}
            />
          )}
          <span>r/{selectedCommunity.name}</span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flair-button-empty"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px dashed var(--text-tertiary)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={14} />
          <span>Adicionar Comunidade</span>
        </button>
      )}

      {isOpen && (
        <div className="flair-dropdown" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          width: '280px',
          maxHeight: '300px',
          overflowY: 'auto',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          padding: '8px 0'
        }}>
          <div
            onClick={() => handleSelect('')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              borderBottom: '1px solid var(--border-color)'
            }}
            className="hover:bg-[var(--bg-hover)]"
          >
            Publicar no feed geral
          </div>
          
          {loading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Carregando...
            </div>
          ) : communities.length > 0 ? (
            communities.map(community => (
              <div
                key={community.id}
                onClick={() => handleSelect(community.id)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: selectedCommunityId === community.id ? 'var(--bg-hover)' : 'transparent'
                }}
                className="hover:bg-[var(--bg-hover)]"
              >
                {community.avatarUrl ? (
                  <img src={community.avatarUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    {community.displayName}
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    r/{community.name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Você não participa de nenhuma comunidade
            </div>
          )}
        </div>
      )}
    </div>
  );
};
