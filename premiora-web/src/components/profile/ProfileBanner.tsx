/**
 * Componente ProfileBanner
 * Banner do perfil do criador com gradiente e informações principais
 */
import React from 'react';
import type { CreatorProfile } from '../../types/profile';
import '../../styles/ProfileBanner.css';

interface ProfileBannerProps {
  /** Dados do perfil do criador */
  profile: CreatorProfile;
}

/**
 * Banner do perfil do criador com gradiente de fundo
 * Exibe nome, total de posts, descrição e botão de ação
 */
const ProfileBanner: React.FC<ProfileBannerProps> = ({ profile }) => {
  /**
   * Handler para o botão "Join" ou "Become a member"
   */
  const handleJoinClick = () => {
    console.log('Join button clicked');
    // TODO: Implementar lógica de assinatura/join
  };

  return (
    <section className="profile-banner">
      <div className="banner-content">
        <div className="creator-info">
          <h1 className="creator-name">{profile.name}</h1>
          <p className="creator-stats">{profile.totalPosts} posts</p>
          <p className="creator-description">{profile.description}</p>
          <button
            className="join-button"
            onClick={handleJoinClick}
            aria-label="Tornar-se membro"
          >
            Become a member
          </button>
        </div>

        {/* Ilustração placeholder no lado direito */}
        <div className="banner-illustration">
          <svg
            viewBox="0 0 200 200"
            className="illustration-svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="illustrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF424D" />
                <stop offset="100%" stopColor="#E63946" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#illustrationGradient)" opacity="0.1" />
            <circle cx="100" cy="100" r="60" fill="url(#illustrationGradient)" opacity="0.2" />
            <circle cx="100" cy="100" r="40" fill="url(#illustrationGradient)" opacity="0.3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default ProfileBanner;
