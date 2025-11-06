/**
 * Componente PostCard
 * Card individual para posts no carousel horizontal
 */
import React from 'react';
import type { Post } from '../../types/profile';
import '../../styles/PostCard.css';

interface PostCardProps {
  /** Dados do post */
  post: Post;
}

/**
 * Card de post para o carousel horizontal
 * Exibe thumbnail, título e metadados básicos
 */
const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
   * Handler para clique no card
   */
  const handleCardClick = () => {
    console.log(`Post card clicked: ${post.title}`);
    // TODO: Implementar navegação para visualização do post
  };

  return (
    <article className="post-card" onClick={handleCardClick}>
      {/* Thumbnail */}
      <div className="post-thumbnail">
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
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>

        {/* Metadados */}
        <div className="post-metadata">
          <span className="post-date">{formatRelativeDate(post.createdAt)}</span>

          {post.views !== undefined && (
            <span className="post-views">
              <svg viewBox="0 0 24 24" className="view-icon" aria-hidden="true">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
              </svg>
              {post.views}
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
        </div>
      </div>
    </article>
  );
};

export default PostCard;
