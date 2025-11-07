import React from 'react';
import type { CreatorProfile } from '../../types/profile';
import styles from './ProfileBanner.module.css';

/**
 * Componente do banner do perfil do criador
 * Exibe informações principais e botão de call-to-action
 *
 * @component
 * @param profile - Dados do perfil do criador
 */
interface ProfileBannerProps {
  profile: CreatorProfile;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({ profile }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.creatorInfo}>
          <h1 className={styles.creatorName}>{profile.name}</h1>
          <p className={styles.postCount}>{profile.totalPosts} posts</p>
          <p className={styles.description}>{profile.description}</p>
          <button className={styles.ctaButton}>
            Become a member
          </button>
        </div>
        <div className={styles.illustration}>
          {/* Placeholder para ilustração SVG */}
          <div className={styles.placeholderIllustration}>
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
