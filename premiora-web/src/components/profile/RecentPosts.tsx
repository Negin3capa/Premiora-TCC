/**
 * Componente RecentPosts
 * Carousel horizontal de posts recentes com navegação por setas
 */
import React, { useRef, useState } from 'react';
import type { Post } from '../../types/profile';
import PostCard from './PostCard';
import '../../styles/RecentPosts.css';

interface RecentPostsProps {
  /** Lista de posts recentes */
  posts: Post[];
}

/**
 * Seção de posts recentes com scroll horizontal e controles de navegação
 * Exibe título da seção e carousel de cards de posts
 */
const RecentPosts: React.FC<RecentPostsProps> = ({ posts }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /**
   * Verifica se é possível rolar para esquerda ou direita
   */
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  /**
   * Handler para rolar para a esquerda
   */
  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  /**
   * Handler para rolar para a direita
   */
  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  /**
   * Handler para scroll do container
   */
  const handleScroll = () => {
    updateScrollButtons();
  };

  /**
   * Atualiza estado dos botões quando o componente monta
   */
  React.useEffect(() => {
    updateScrollButtons();
  }, [posts]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="recent-posts">
      {/* Título da seção */}
      <div className="section-header">
        <h2 className="section-title">Recent Posts</h2>
      </div>

      {/* Container do carousel */}
      <div className="carousel-container">
        {/* Botão de rolar para esquerda */}
        {canScrollLeft && (
          <button
            className="scroll-button scroll-left"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" className="arrow-icon" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Container scrollável */}
        <div
          className="posts-scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Botão de rolar para direita */}
        {canScrollRight && (
          <button
            className="scroll-button scroll-right"
            onClick={handleScrollRight}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" className="arrow-icon" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
};

export default RecentPosts;
