import React from 'react';
import type { Post } from '../../types/profile';
import styles from './FeaturedPost.module.css';

/**
 * Componente do post em destaque
 * Exibe um post grande com thumbnail e detalhes
 *
 * @component
 * @param post - Dados do post em destaque
 */
interface FeaturedPostProps {
  post: Post;
}

export const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className={styles.featuredPost}>
      <div className={styles.thumbnailContainer}>
        <div className={styles.thumbnail}>
          {/* Placeholder para thumbnail do vídeo */}
          <div className={styles.thumbnailPlaceholder}>
            <div className={styles.playIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path
                  d="M8 5v14l11-7z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{post.title}</h2>
        {post.description && (
          <p className={styles.description}>{post.description}</p>
        )}

        <div className={styles.metadata}>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
          {post.likes !== undefined && (
            <span className={styles.stat}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
              {post.likes}
            </span>
          )}
          {post.comments !== undefined && (
            <span className={styles.stat}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                  fill="currentColor"
                />
              </svg>
              {post.comments}
            </span>
          )}
          {post.views !== undefined && (
            <span className={styles.stat}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  fill="currentColor"
                />
              </svg>
              {post.views}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
