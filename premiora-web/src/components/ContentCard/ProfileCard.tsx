/**
 * Componente ProfileCard
 * Card específico para exibir perfis de usuário
 */
import React from 'react';
import type { ContentItem } from '../../types/content';

interface ProfileCardProps {
  item: ContentItem;
  onFollow?: () => void;
}

/**
 * Card específico para perfis de usuário
 * Exibe avatar, nome e botão de seguir
 */
const ProfileCard: React.FC<ProfileCardProps> = ({ item, onFollow }) => {
  return (
    <div className="profile-content">
      <img
        src={item.authorAvatar}
        alt={item.title}
        className="profile-image"
        loading="lazy"
      />
      <h3 className="content-title">{item.title}</h3>
      <div className="profile-stats">
        <span>{item.views?.toLocaleString('pt-BR')} seguidores</span>
      </div>
      <button className="support-button" onClick={onFollow}>
        Seguir
      </button>
    </div>
  );
};

export default ProfileCard;
