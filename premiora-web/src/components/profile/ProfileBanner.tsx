import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFollow } from '../../hooks/useFollow';
import { useNavigate } from 'react-router-dom';
import type { CreatorProfile } from '../../types/profile';
import styles from '../../styles/ProfileBanner.module.css';

/**
 * Componente do banner do perfil do criador
 * Exibe informações principais, avatar e botão de call-to-action
 *
 * @component
 * @param profile - Dados do perfil do criador
 * @param userId - ID do usuário do perfil (para operações de follow)
 */
interface ProfileBannerProps {
  profile: CreatorProfile;
  userId?: string;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({ profile, userId }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Hook para gerenciar follow/unfollow
  const { isFollowing, loading: followLoading, toggleFollow } = useFollow(userId);

  // Detecção de domínio: verifica se é o perfil do usuário logado
  const isOwnProfile = userProfile?.username === profile.username;

  const handleEditProfileClick = () => {
    // Redirecionar para página de edição de perfil
    navigate(`/u/${profile.username}/edit`);
  };

  const handleBecomeMemberClick = () => {
    // Lógica para "Become a member" - pode ser implementada futuramente
    console.log('Become a member clicked');
  };

  const handleFollowClick = async () => {
    if (!userId) return;
    await toggleFollow(userId);
  };

  return (
    <div
      className={styles.banner}
      style={{
        backgroundImage: profile.bannerImage ? `url(${profile.bannerImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className={styles.bannerContent}>
        <div className={styles.creatorInfo}>
          <h1 className={styles.creatorName}>{profile.name}</h1>
          <p className={styles.postCount}>{profile.totalPosts} posts</p>
          <p className={styles.description}>{profile.description || 'Sem descrição disponível'}</p>

          {/* Botões de ação */}
          {isOwnProfile ? (
            <button className={styles.ctaButton} onClick={handleEditProfileClick}>
              Editar Perfil
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Botão Become a member */}
              <button
                className={styles.ctaButton}
                onClick={handleBecomeMemberClick}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#DADADA'
                }}
              >
                Become a member
              </button>

              {/* Botão Follow (ícone de coração) */}
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(192, 192, 192, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: followLoading ? 'not-allowed' : 'pointer',
                  opacity: followLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  if (!followLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!followLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.2)';
                  }
                }}
                title={isFollowing ? 'Deixar de seguir' : 'Seguir'}
                aria-label={isFollowing ? 'Deixar de seguir' : 'Seguir'}
              >
                <Heart
                  size={24}
                  fill={isFollowing ? '#FF424D' : 'none'}
                  color={isFollowing ? '#FF424D' : '#DADADA'}
                  style={{
                    transition: 'all 0.2s ease'
                  }}
                />
              </button>
            </div>
          )}
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
