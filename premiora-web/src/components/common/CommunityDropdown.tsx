/**
 * Componente reutilizável para seleção de comunidade
 * Reduz duplicação entre CreatePostModal e CreateVideoModal
 */
import React, { useState } from 'react';

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
 * Dados de uma comunidade
 */
interface Community {
  id: string;
  name: string;
  description: string;
}

/**
 * Lista de comunidades disponíveis (dados mockados)
 * TODO: Buscar comunidades do usuário da API
 */
const mockCommunities: Community[] = [
  { id: 'general', name: 'Geral', description: 'Discussões gerais' },
  { id: 'tech', name: 'Tecnologia', description: 'Tecnologia e inovação' },
  { id: 'art', name: 'Arte', description: 'Arte e criatividade' },
  { id: 'gaming', name: 'Gaming', description: 'Jogos e entretenimento' }
];

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
    const community = mockCommunities.find(c => c.id === selectedCommunityId);
    return community ? community.name : 'Selecionar comunidade';
  };

  return (
    <div className="dropdown-container">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="dropdown-button"
        disabled={disabled}
      >
        <span>{getSelectedCommunityName()}</span>
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
            Remover comunidade selecionada
          </div>
          {mockCommunities.map(community => (
            <div
              key={community.id}
              onClick={() => handleSelect(community.id)}
              className={`dropdown-item ${selectedCommunityId === community.id ? 'selected' : ''}`}
            >
              <div className="dropdown-item-name">{community.name}</div>
              <div className="dropdown-item-description">{community.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityDropdown;
