/**
 * Componente para exibir um comentário individual
 * Suporta comentários aninhados/respostas e ações CRUD
 */
import React, { useState } from 'react';
import { MessageCircle, MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Comment } from '../../types/content';

interface CommentItemProps {
  comment: Comment;
  depth: number; // Profundidade na árvore de comentários (0 = raiz, 1 = resposta, etc.)
  maxDepth?: number; // Profundidade máxima permitida
  onReply?: (parentCommentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void; // Futuro: likes em comentários
  isEditing?: boolean;
  editContent?: string;
  onEditChange?: (content: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
}

/**
 * Componente para exibir um comentário individual
 */
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  maxDepth = 2,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isEditing = false,
  editContent = '',
  onEditChange,
  onEditSave,
  onEditCancel
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Verificar se o usuário atual é o autor do comentário
  const isAuthor = user?.id === comment.userId;

  /**
   * Handler para responder ao comentário
   */
  const handleReply = () => {
    if (onReply) {
      onReply(comment.id);
    }
  };

  /**
   * Handler para editar comentário
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment.id, comment.content);
    }
    setShowMenu(false);
  };

  /**
   * Handler para excluir comentário
   */
  const handleDelete = () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir este comentário?')) {
      onDelete(comment.id);
    }
    setShowMenu(false);
  };

  /**
   * Handler para fechar menu
   */
  const handleMenuClose = () => {
    setShowMenu(false);
  };

  /**
   * Calcular margem baseada na profundidade
   */
  const getMarginLeft = () => {
    if (depth === 0) return '0';
    return `${Math.min(depth, maxDepth) * 24}px`;
  };

  /**
   * Renderizar data formatada
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'data desconhecida';
    }
  };

  return (
    <div
      className={`comment-item ${depth > 0 ? 'comment-reply' : 'comment-root'}`}
      style={{ marginLeft: getMarginLeft() }}
    >
      {/* Avatar e conteúdo principal */}
      <div className="comment-main">
        {/* Avatar */}
        <img
          src={comment.author.avatarUrl || '/default-avatar.png'}
          alt={comment.author.username}
          className="comment-avatar"
          loading="lazy"
        />

        {/* Conteúdo do comentário */}
        <div className="comment-content">
          {/* Header com autor e data */}
          <div className="comment-header">
            <span className="comment-author">{comment.author.name || comment.author.username}</span>
            {comment.isEdited && (
              <span className="comment-edited">(editado)</span>
            )}
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>

          {/* Conteúdo ou editor */}
          {isEditing ? (
            <div className="comment-edit-form">
              <textarea
                value={editContent}
                onChange={(e) => onEditChange?.(e.target.value)}
                className="comment-edit-textarea"
                placeholder="Digite seu comentário..."
                rows={3}
              />
              <div className="comment-edit-actions">
                <button
                  onClick={onEditSave}
                  className="comment-edit-save"
                  disabled={!editContent.trim()}
                >
                  <Check size={14} />
                  Salvar
                </button>
                <button
                  onClick={onEditCancel}
                  className="comment-edit-cancel"
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="comment-text">
              {comment.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}

          {/* Ações do comentário */}
          {!isEditing && (
            <div className="comment-actions">
              {/* Botão de responder (se não atingiu profundidade máxima) */}
              {depth < maxDepth && onReply && (
                <button
                  onClick={handleReply}
                  className="comment-action-button reply-button"
                  aria-label="Responder comentário"
                >
                  <MessageCircle size={14} />
                  <span>Responder</span>
                </button>
              )}

              {/* Botão de curtir */}
              {onLike && (
                <button
                  onClick={() => onLike(comment.id)}
                  className="comment-action-button like-button"
                  aria-label="Curtir comentário"
                >
                  ♥
                  <span>0</span> {/* TODO: implementar likes em comentários */}
                </button>
              )}

              {/* Menu de opções (somente para autor) */}
              {isAuthor && (
                <div className="comment-menu">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="comment-menu-button"
                    aria-label="Mais opções"
                    aria-expanded={showMenu}
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {/* Dropdown do menu */}
                  {showMenu && (
                    <>
                      <div
                        className="comment-menu-overlay"
                        onClick={handleMenuClose}
                      />
                      <div className="comment-menu-dropdown">
                        <button
                          onClick={handleEdit}
                          className="comment-menu-item"
                        >
                          <Edit2 size={14} />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={handleDelete}
                          className="comment-menu-item delete-item"
                        >
                          <Trash2 size={14} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Respostas aninhadas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};
