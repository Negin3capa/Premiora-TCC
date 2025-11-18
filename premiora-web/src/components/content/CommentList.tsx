/**
 * Componente principal para gerenciamento de comentários em posts
 * Coordena formulários, lista de comentários e operações CRUD
 */
import React, { useState, useCallback, useMemo } from 'react';
import { MessageSquare, SortAsc, SortDesc, Loader2 } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import type { Comment } from '../../types/content';

interface CommentListProps {
  /** ID do post para buscar comentários */
  postId: string;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente container para lista de comentários
 */
export const CommentList: React.FC<CommentListProps> = ({
  postId,
  className = ''
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);

  // Hook para gerenciar comentários
  const {
    comments,
    commentStats,
    isLoading,
    isSubmitting,
    error,
    createComment,
    updateComment,
    deleteComment,
    replyToComment,
    refreshComments
  } = useComments({
    postId,
    autoLoad: true,
    sortBy: 'created_at',
    sortOrder
  });

  /**
   * Handler para criação de novo comentário
   */
  const handleCreateComment = useCallback(async (data: { content: string; postId?: string }) => {
    await createComment({
      postId: data.postId || postId,
      content: data.content
    });
    // Não precisa limpar estado pois o form já limpa sozinho
  }, [createComment, postId]);

  /**
   * Handler para resposta a comentário
   */
  const handleReplyToComment = useCallback(async (commentId: string, content: string) => {
    await replyToComment(commentId, content);
    setShowReplyForm(null);
    setReplyingToCommentId(null);
  }, [replyToComment]);

  /**
   * Handler para iniciar resposta a comentário
   */
  const handleStartReply = useCallback((commentId: string) => {
    setShowReplyForm(commentId);
    setReplyingToCommentId(commentId);
    setEditingCommentId(null); // Cancelar edição se estiver ativa
  }, []);

  /**
   * Handler para cancelar resposta
   */
  const handleCancelReply = useCallback(() => {
    setShowReplyForm(null);
    setReplyingToCommentId(null);
  }, []);

  /**
   * Handler para iniciar edição de comentário
   */
  const handleStartEdit = useCallback((commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
    setShowReplyForm(null); // Cancelar resposta se estiver ativa
    setReplyingToCommentId(null);
  }, []);

  /**
   * Handler para salvar edição de comentário
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    await updateComment(editingCommentId, { content: editingContent.trim() });
    setEditingCommentId(null);
    setEditingContent('');
  }, [editingCommentId, editingContent, updateComment]);

  /**
   * Handler para cancelar edição
   */
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  /**
   * Handler para excluir comentário
   */
  const handleDeleteComment = useCallback(async (commentId: string) => {
    await deleteComment(commentId);
  }, [deleteComment]);

  /**
   * Handler para alternar ordem de classificação
   */
  const handleToggleSort = useCallback(() => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
  }, [sortOrder]);

  /**
   * Componente de loading para comentários
   */
  const CommentLoadingState: React.FC = () => (
    <div className="comment-loading-state">
      <Loader2 className="spinning" size={24} />
      <span>Carregando comentários...</span>
    </div>
  );

  /**
   * Componente de erro
   */
  const CommentErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className="comment-error-state">
      <div className="error-message">
        <p>Erro ao carregar comentários: {error}</p>
        <button onClick={onRetry} className="retry-button">
          Tentar novamente
        </button>
      </div>
    </div>
  );

  /**
   * Componente de estado vazio
   */
  const CommentEmptyState: React.FC = () => (
    <div className="comment-empty-state">
      <MessageSquare size={48} />
      <h3>Seja o primeiro a comentar</h3>
      <p>Compartilhe suas ideias sobre este post</p>
    </div>
  );

  /**
   * Header da seção de comentários com estatísticas e controles
   */
  const CommentHeader: React.FC = () => {
    const totalComments = commentStats?.totalComments || 0;
    const topLevelComments = commentStats?.topLevelComments || 0;

    return (
      <div className="comment-header">
        <div className="comment-stats">
          <MessageSquare size={20} />
          <span className="comment-count">
            {totalComments} {totalComments === 1 ? 'comentário' : 'comentários'}
            {topLevelComments !== totalComments && ` (${topLevelComments} raiz)`}
          </span>
        </div>

        {/* Controles de ordenação */}
        {comments.length > 0 && (
          <button
            onClick={handleToggleSort}
            className="comment-sort-button"
            aria-label={`Ordenar por ${sortOrder === 'desc' ? 'data mais antiga' : 'data mais recente'}`}
          >
            {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
            <span>{sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}</span>
          </button>
        )}
      </div>
    );
  };

  /**
   * Renderizar comentário recursivamente com suporte a respostas
   */
  const renderComment = useCallback((comment: Comment, depth: number = 0): React.ReactNode => {
    const isEditing = editingCommentId === comment.id;
    const isReplyingTo = showReplyForm === comment.id && replyingToCommentId === comment.id;

    return (
      <div key={comment.id} className="comment-thread">
        <CommentItem
          comment={comment}
          depth={depth}
          maxDepth={2}
          onReply={depth < 2 ? handleStartReply : undefined}
          onEdit={handleStartEdit}
          onDelete={handleDeleteComment}
          isEditing={isEditing}
          editContent={editingContent}
          onEditChange={setEditingContent}
          onEditSave={handleSaveEdit}
          onEditCancel={handleCancelEdit}
        />

        {/* Formulário de resposta */}
        {isReplyingTo && (
          <div className="comment-reply-form">
            <CommentForm
              mode="reply"
              postId={postId}
              parentCommentId={comment.id}
              isSubmitting={isSubmitting}
              onSubmit={(data) => handleReplyToComment(comment.id, data.content)}
              onCancel={handleCancelReply}
              autoFocus={true}
              placeholder="Digite sua resposta..."
            />
          </div>
        )}

        {/* Renderizar respostas recursivamente */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [
    editingCommentId,
    editingContent,
    showReplyForm,
    replyingToCommentId,
    isSubmitting,
    postId,
    handleStartReply,
    handleStartEdit,
    handleDeleteComment,
    setEditingContent,
    handleSaveEdit,
    handleCancelEdit,
    handleReplyToComment,
    handleCancelReply
  ]);

  // Memoizar lista renderizada para performance
  const renderedComments = useMemo(() => {
    return comments.map(comment => renderComment(comment, 0));
  }, [comments, renderComment]);

  return (
    <section className={`comment-list ${className}`}>
      <CommentHeader />

      {/* Formulário principal de comentário */}
      <div className="comment-main-form">
        <CommentForm
          mode="create"
          postId={postId}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateComment}
          placeholder="O que você acha deste post?"
        />
      </div>

      {/* Estado de loading */}
      {isLoading && <CommentLoadingState />}

      {/* Estado de erro */}
      {error && !isLoading && (
        <CommentErrorState error={error} onRetry={refreshComments} />
      )}

      {/* Lista de comentários */}
      {!isLoading && !error && (
        <div className="comment-items">
          {comments.length > 0 ? (
            renderedComments
          ) : (
            <CommentEmptyState />
          )}
        </div>
      )}
    </section>
  );
};
