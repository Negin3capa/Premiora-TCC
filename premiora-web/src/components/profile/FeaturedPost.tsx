/**
 * Componente FeaturedPost
 * Post em destaque exibido em formato grande horizontal
 */
import React from 'react';
import type { Post } from '../../types/profile';
import '../../styles/FeaturedPost.css';

interface FeaturedPostProps {
  /** Dados do post em destaque */
  post: Post;
}

/**
 * Card grande do post em destaque
 * Exibe thumbnail do vídeo, título, descrição e metadados
 */
const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  /**
   * Formata a data relativa (ex: "2 days ago")
   */
  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  /**
   * Handler para clique no post
   */
  const handlePostClick = () => {
    console.log(`Featured post clicked: ${post.title}`);
    // TODO: Implementar navegação para visualização do post
  };

  return (
    <section className="featured-post">
      <div className="featured-post-content">
        {/* Thumbnail do vídeo */}
        <div className="featured-thumbnail" onClick={handlePostClick}>
          <div className="thumbnail-placeholder">
            <svg viewBox="0 0 24 24" className="play-icon" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </div>
          {post.locked && (
            <div className="locked-overlay">
              <svg viewBox="0 0 24 24" className="lock-icon" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor" />
              </svg>
              <span className="locked-text">Locked</span>
            </div>
          )}
        </div>

        {/* Conteúdo do post */}
        <div className="featured-details">
          <h2 className="featured-title" onClick={handlePostClick}>
            {post.title}
          </h2>

          {post.description && (
            <p className="featured-description">{post.description}</p>
          )}

          {/* Metadados */}
          <div className="featured-metadata">
            <span className="post-date">{formatRelativeDate(post.createdAt)}</span>
            {post.likes !== undefined && (
              <span className="post-likes">
                <svg viewBox="0 0 24 24" className="like-icon" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
                {post.likes}
              </span>
            )}
            {post.comments !== undefined && (
              <span className="post-comments">
                <svg viewBox="0 0 24 24" className="comment-icon" aria-hidden="true">
                  <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor" />
                </svg>
                {post.comments}
              </span>
            )}
            {post.views !== undefined && (
              <span className="post-views">
                <svg viewBox="0 0 24 24" className="view-icon" aria-hidden="true">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                </svg>
                {post.views}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPost;
