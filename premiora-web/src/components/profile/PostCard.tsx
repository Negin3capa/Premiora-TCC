import React from 'react';
import type { Post } from '../../types/profile';
import styles from './PostCard.module.css';

/**
 * Componente de cartão de post
 * Usado na seção de posts recentes com suporte a posts bloqueados
 *
 * @component
 * @param post - Dados do post
 */
interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return `${Math.floor(diffDays / 30)}mo`;
  };

  return (
    <div className={`${styles.postCard} ${post.locked ? styles.locked : ''}`}>
      <div className={styles.thumbnail}>
        <div className={styles.thumbnailPlaceholder}>
          {post.locked && (
            <div className={styles.lockOverlay}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                  fill="white"
                />
              </svg>
              <span className={styles.lockText}>Locked</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>

        <div className={styles.metadata}>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
          {post.views !== undefined && (
            <span className={styles.views}>
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  fill="currentColor"
                />
              </svg>
              {post.views}
            </span>
          )}
          {post.comments !== undefined && (
            <span className={styles.comments}>
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path
                  d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                  fill="currentColor"
                />
              </svg>
              {post.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
