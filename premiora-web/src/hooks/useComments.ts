/**
 * Hook para gerenciamento de comentários em posts
 * Fornece funcionalidade para carregar, criar, editar e excluir comentários
 */
import { useState, useCallback, useEffect } from 'react';
import { CommentService } from '../services/content/CommentService';
import { useAuth } from './useAuth';
import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentStats
} from '../types/content';

interface UseCommentsProps {
  postId: string;
  autoLoad?: boolean; // Carregar comentários automaticamente
  sortBy?: 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

interface UseCommentsReturn {
  comments: Comment[];
  commentStats: CommentStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // Ações
  loadComments: () => Promise<void>;
  createComment: (data: CreateCommentData) => Promise<Comment>;
  updateComment: (commentId: string, data: UpdateCommentData) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<boolean>;
  replyToComment: (parentCommentId: string, content: string) => Promise<Comment>;
  refreshComments: () => Promise<void>;
  // Utilitários
  getCommentById: (commentId: string) => Comment | undefined;
  optimisticUpdate: (commentId: string, updates: Partial<Comment>) => void;
}

/**
 * Hook para gerenciar comentários de um post específico
 * @param props - Propriedades do hook
 * @returns Estado e funções para manipular comentários
 */
export const useComments = ({
  postId,
  autoLoad = true,
  sortBy = 'created_at',
  sortOrder = 'asc'
}: UseCommentsProps): UseCommentsReturn => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentStats, setCommentStats] = useState<CommentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega comentários do post
   */
  const loadComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: CommentFilters = {
        postId,
        sortBy,
        sortOrder,
        limit: 100 // Limite inicial
      };

      const [loadedComments, stats] = await Promise.all([
        CommentService.getPostComments(filters),
        CommentService.getCommentStats(postId)
      ]);

      setComments(loadedComments);
      setCommentStats(stats);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar comentários');
      setComments([]);
      setCommentStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [postId, sortBy, sortOrder]);

  /**
   * Atualiza comentários (mesmo método que loadComments)
   */
  const refreshComments = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  /**
   * Cria um novo comentário
   */
  const createComment = useCallback(async (data: CreateCommentData): Promise<Comment> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Criar comentário no servidor
      const newComment = await CommentService.createComment({
        ...data,
        postId: data.postId // Garantir que o postId está correto
      });

      // Recarregar comentários para ter dados atualizados e consistentes
      await loadComments();

      return newComment;
    } catch (err) {
      console.error('Erro ao criar comentário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar comentário');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, loadComments, commentStats]);

  /**
   * Resposta a um comentário específico
   */
  const replyToComment = useCallback(async (
    parentCommentId: string,
    content: string
  ): Promise<Comment> => {
    return createComment({
      postId,
      content,
      parentCommentId
    });
  }, [createComment, postId]);

  /**
   * Atualiza um comentário existente
   */
  const updateComment = useCallback(async (
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updatedComment = await CommentService.updateComment(commentId, data);

      // Atualizar comentário localmente
      setComments(currentComments => {
        const updateCommentInTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, ...updatedComment };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentInTree(comment.replies)
              };
            }
            return comment;
          });
        };

        return updateCommentInTree(currentComments);
      });

      return updatedComment;
    } catch (err) {
      console.error('Erro ao atualizar comentário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar comentário');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  /**
   * Exclui um comentário
   */
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await CommentService.deleteComment(commentId);

      // Remover comentário localmente
      setComments(currentComments => {
        const removeCommentFromTree = (comments: Comment[]): Comment[] => {
          return comments
            .filter(comment => comment.id !== commentId)
            .map(comment => {
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: removeCommentFromTree(comment.replies)
                };
              }
              return comment;
            });
        };

        return removeCommentFromTree(currentComments);
      });

      // Atualizar estatísticas
      setCommentStats(currentStats => {
        if (!currentStats) return null;
        return {
          ...currentStats,
          totalComments: Math.max(0, currentStats.totalComments - 1),
          topLevelComments: Math.max(0, currentStats.topLevelComments - 1)
        };
      });

      return true;
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir comentário');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, commentStats]);

  /**
   * Busca comentário por ID na árvore de comentários
   */
  const getCommentById = useCallback((commentId: string): Comment | undefined => {
    const findComment = (comments: Comment[]): Comment | undefined => {
      for (const comment of comments) {
        if (comment.id === commentId) {
          return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findComment(comments);
  }, [comments]);

  /**
   * Atualização otimista para atualizações locais instantâneas
   */
  const optimisticUpdate = useCallback((commentId: string, updates: Partial<Comment>) => {
    setComments(currentComments => {
      const updateCommentInTree = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, ...updates };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInTree(comment.replies)
            };
          }
          return comment;
        });
      };

      return updateCommentInTree(currentComments);
    });
  }, []);

  /**
   * Carregar comentários automaticamente quando o component monta
   */
  useEffect(() => {
    if (autoLoad && postId) {
      loadComments();
    }
  }, [autoLoad, postId, loadComments]);

  return {
    comments,
    commentStats,
    isLoading,
    isSubmitting,
    error,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    replyToComment,
    refreshComments,
    getCommentById,
    optimisticUpdate
  };
};
