/**
 * Componente de seção de comentários
 * Sistema completo de comentários com lista e formulário
 */
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Interface para comentários
 */
export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

/**
 * Props do componente CommentsSection
 */
interface CommentsSectionProps {
  /** Lista de comentários */
  comments: Comment[];
  /** Se a seção está visível */
  isVisible: boolean;
  /** Handler para adicionar comentário */
  onAddComment: (content: string) => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente CommentsSection - Seção completa de comentários
 */
export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  isVisible,
  onAddComment,
  className = ''
}) => {
  const { userProfile } = useAuth();
  const [newComment, setNewComment] = useState('');

  /**
   * Handler para enviar comentário
   */
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  /**
   * Handler para cancelar comentário
   */
  const handleCancelComment = () => {
    setNewComment('');
  };

  if (!isVisible) return null;

  return (
    <div className={`comments-section ${className}`}>
      <h3>Comentários ({comments.length})</h3>

      {/* Novo comentário */}
      {userProfile && (
        <div className="new-comment">
          <img
            src={userProfile.avatar_url || 'https://via.placeholder.com/40'}
            alt={userProfile.name || 'Usuário'}
            className="comment-avatar"
          />
          <div className="comment-input-container">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="comment-input"
              rows={3}
            />
            <div className="comment-actions">
              <button
                onClick={handleCancelComment}
                className="cancel-comment-btn"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="submit-comment-btn"
              >
                Comentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <img
              src={comment.authorAvatar}
              alt={comment.author}
              className="comment-avatar"
            />
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-timestamp">{comment.timestamp}</span>
              </div>
              <p className="comment-text">{comment.content}</p>
              <div className="comment-actions">
                <button className="comment-like-btn">
                  👍 {comment.likes}
                </button>
                <button className="comment-reply-btn">
                  Responder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
