import React, { useRef } from 'react';
import type { Post } from '../../types/profile';
import { PostCard } from './PostCard';
import styles from './RecentPosts.module.css';

/**
 * Componente de posts recentes com scroll horizontal
 * Exibe lista de posts com botões de navegação
 *
 * @component
 * @param posts - Array de posts para exibir
 */
interface RecentPostsProps {
  posts: Post[];
}

export const RecentPosts: React.FC<RecentPostsProps> = ({ posts }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  const canScrollLeft = () => {
    if (!scrollContainerRef.current) return false;
    return scrollContainerRef.current.scrollLeft > 0;
  };

  const canScrollRight = () => {
    if (!scrollContainerRef.current) return false;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    return scrollLeft < scrollWidth - clientWidth - 1;
  };

  return (
    <div className={styles.recentPosts}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Posts</h2>
        <div className={styles.navigation}>
          <button
            className={`${styles.navButton} ${!canScrollLeft() ? styles.disabled : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft()}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            className={`${styles.navButton} ${!canScrollRight() ? styles.disabled : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight()}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};
