/**
 * Componente reutilizável para seleção de comunidade
 * Reduz duplicação entre CreatePostModal e CreateVideoModal
 */
import React, { useState, useEffect } from 'react';
import { getUserCommunities } from '../../utils/communityUtils';
import type { Community } from '../../types/content';

/**
 * Props do componente CommunityDropdown
 */
interface CommunityDropdownProps {
  /** ID da comunidade selecionada */
  selectedCommunityId?: string;
  /** Callback chamado quando uma comunidade é selecionada */
  onCommunitySelect: (communityId: string) => void;
  /** Indica se o dropdown está desabilitado */
  disabled?: boolean;
}

/**
 * Componente dropdown para seleção de comunidade
 * Reutilizável em diferentes modais de criação de conteúdo
 */
const CommunityDropdown: React.FC<CommunityDropdownProps> = ({
  selectedCommunityId,
  onCommunitySelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar comunidades do usuário
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

  /**
   * Handler para seleção de comunidade
   */
  const handleSelect = (communityId: string) => {
    onCommunitySelect(communityId);
    setIsOpen(false);
  };

  /**
   * Obtém nome da comunidade selecionada
   */
  const getSelectedCommunityName = () => {
    if (!selectedCommunityId) return 'Selecionar comunidade';
    const community = communities.find(c => c.id === selectedCommunityId);
    return community ? community.displayName : 'Selecionar comunidade';
  };

  return (
    <div className="dropdown-container">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="dropdown-button"
        disabled={disabled || loading}
      >
        <span>{loading ? 'Carregando...' : getSelectedCommunityName()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div
            onClick={() => handleSelect('')}
            className="dropdown-item"
          >
            Publicar no feed geral
          </div>
          {communities.length > 0 ? (
            communities.map(community => (
              <div
                key={community.id}
                onClick={() => handleSelect(community.id)}
                className={`dropdown-item ${selectedCommunityId === community.id ? 'selected' : ''}`}
              >
                <div className="dropdown-item-name">{community.displayName}</div>
                <div className="dropdown-item-description">
                  r/{community.name} • {community.memberCount} membros
                </div>
              </div>
            ))
          ) : (
            <div className="dropdown-item disabled">
              Nenhuma comunidade encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityDropdown;
