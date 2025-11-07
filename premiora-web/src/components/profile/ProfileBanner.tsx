import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { CreatorProfile } from '../../types/profile';
import styles from './ProfileBanner.module.css';

/**
 * Componente do banner do perfil do criador
 * Exibe informações principais, avatar e botão de call-to-action
 *
 * @component
 * @param profile - Dados do perfil do criador
 */
interface ProfileBannerProps {
  profile: CreatorProfile;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({ profile }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Detecção de domínio: verifica se é o perfil do usuário logado
  const isOwnProfile = userProfile?.username === profile.username;

  const handleButtonClick = () => {
    if (isOwnProfile) {
      // Redirecionar para página de configurações ou edição de perfil
      navigate('/settings');
    } else {
      // Lógica para "Become a member" - pode ser implementada futuramente
      console.log('Become a member clicked');
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.creatorInfo}>
          <h1 className={styles.creatorName}>{profile.name}</h1>
          <p className={styles.postCount}>{profile.totalPosts} posts</p>
          <p className={styles.description}>{profile.description || 'Sem descrição disponível'}</p>
          <button className={styles.ctaButton} onClick={handleButtonClick}>
            {isOwnProfile ? 'Editar Perfil' : 'Become a member'}
          </button>
        </div>
        <div className={styles.illustration}>
          {/* Avatar do usuário */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.name}`}
              className={styles.avatar}
              onError={(e) => {
                // Fallback para avatar padrão se a imagem falhar
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback para quando não há avatar */}
          <div
            className={styles.placeholderIllustration}
            style={{ display: profile.avatar_url ? 'none' : 'flex' }}
          >
            <svg viewBox="0 0 200 200" className={styles.svgIllustration}>
              <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
              <circle cx="100" cy="80" r="20" fill="rgba(255,255,255,0.2)" />
              <rect x="85" y="110" width="30" height="40" rx="15" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
