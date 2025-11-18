/**
 * Serviço de gerenciamento de comentários em posts
 * Responsável por criar, ler, editar, excluir e consultar comentários
 */
import { supabase } from '../../utils/supabaseClient';
import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentStats
} from '../../types/content';

/**
 * Classe de serviço para operações de comentários
 */
export class CommentService {

  /**
   * Busca comentários de um post específico com estrutura hierárquica
   * @param filters - Filtros para a busca
   * @returns Promise com array de comentários organizados hierarquicamente
   */
  static async getPostComments(filters: CommentFilters): Promise<Comment[]> {
    const {
      postId,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'asc'
    } = filters;

    // Buscar comentários raiz (parent_comment_id IS NULL)
    const { data: commentsData, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        is_edited,
        created_at,
        updated_at,
        users:users!post_comments_user_id_fkey (
          username,
          name,
          avatar_url,
          creators (
            display_name,
            profile_image_url
          )
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar comentários: ${error.message}`);
    }

    if (!commentsData || commentsData.length === 0) {
      return [];
    }

    // Converter dados do banco para formato Comment
    const comments: Comment[] = commentsData.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      parentCommentId: comment.parent_comment_id,
      content: comment.content,
      isEdited: comment.is_edited,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        username: (comment.users as any)?.username || '',
        name: (comment.users as any)?.creators?.display_name || (comment.users as any)?.name,
        avatarUrl: (comment.users as any)?.avatar_url || (comment.users as any)?.creators?.profile_image_url
      },
      replies: [],
      depth: 0
    }));

    // Buscar respostas para cada comentário (até 2 níveis de profundidade)
    for (const comment of comments) {
      comment.replies = await this.getCommentReplies(comment.id);
    }

    return comments;
  }

  /**
   * Busca respostas de um comentário específico
   * @param parentCommentId - ID do comentário pai
   * @returns Promise com array de respostas
   */
  static async getCommentReplies(parentCommentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        is_edited,
        created_at,
        updated_at,
        users:users!post_comments_user_id_fkey (
          username,
          name,
          avatar_url,
          creators (
            display_name,
            profile_image_url
          )
        )
      `)
      .eq('parent_comment_id', parentCommentId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar respostas: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(reply => ({
      id: reply.id,
      postId: reply.post_id,
      userId: reply.user_id,
      parentCommentId: reply.parent_comment_id,
      content: reply.content,
      isEdited: reply.is_edited,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      author: {
        username: (reply.users as any)?.username || '',
        name: (reply.users as any)?.name || (reply.users as any)?.creators?.display_name,
        avatarUrl: (reply.users as any)?.avatar_url || (reply.users as any)?.creators?.profile_image_url
      },
      replies: [], // Não buscar respostas de respostas (limitar a 2 níveis)
      depth: 1
    }));
  }

  /**
   * Cria um novo comentário
   * @param data - Dados do comentário a ser criado
   * @returns Promise com comentário criado
   */
  static async createComment(data: CreateCommentData): Promise<Comment> {
    const { postId, content, parentCommentId } = data;

    // Validar conteúdo
    if (!content.trim()) {
      throw new Error('Conteúdo do comentário não pode estar vazio');
    }

    // Se for uma resposta, verificar se o comentário pai existe
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('post_comments')
        .select('id')
        .eq('id', parentCommentId)
        .single();

      if (parentError || !parentComment) {
        throw new Error('Comentário pai não encontrado');
      }
    }

    const { data: commentData, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      })
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        is_edited,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar comentário: ${error.message}`);
    }

    return {
      id: commentData.id,
      postId: commentData.post_id,
      userId: commentData.user_id,
      parentCommentId: commentData.parent_comment_id,
      content: commentData.content,
      isEdited: commentData.is_edited,
      createdAt: commentData.created_at,
      updatedAt: commentData.updated_at,
      author: {
        username: '', // Será preenchido pelo componente
        name: '',
        avatarUrl: ''
      },
      replies: [],
      depth: parentCommentId ? 1 : 0
    };
  }

  /**
   * Atualiza um comentário existente
   * @param commentId - ID do comentário
   * @param data - Dados para atualização
   * @returns Promise<boolean> sucesso da operação
   */
  static async updateComment(
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment> {
    const { content } = data;

    // Validar conteúdo
    if (!content.trim()) {
      throw new Error('Conteúdo do comentário não pode estar vazio');
    }

    const { data: commentData, error } = await supabase
      .from('post_comments')
      .update({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        is_edited,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar comentário: ${error.message}`);
    }

    return {
      id: commentData.id,
      postId: commentData.post_id,
      userId: commentData.user_id,
      parentCommentId: commentData.parent_comment_id,
      content: commentData.content,
      isEdited: commentData.is_edited,
      createdAt: commentData.created_at,
      updatedAt: commentData.updated_at,
      author: {
        username: '', // Será preenchido pelo componente
        name: '',
        avatarUrl: ''
      },
      replies: [],
      depth: commentData.parent_comment_id ? 1 : 0
    };
  }

  /**
   * Exclui um comentário
   * @param commentId - ID do comentário a ser excluído
   * @returns Promise<boolean> sucesso da operação
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new Error(`Erro ao excluir comentário: ${error.message}`);
    }

    return true;
  }

  /**
   * Busca um comentário específico por ID
   * @param commentId - ID do comentário
   * @returns Promise<Comment | null>
   */
  static async getCommentById(commentId: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        user_id,
        parent_comment_id,
        content,
        is_edited,
        created_at,
        updated_at,
        users:users!post_comments_user_id_fkey (
          username,
          name,
          avatar_url,
          creators (
            display_name,
            profile_image_url
          )
        )
      `)
      .eq('id', commentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar comentário: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      postId: data.post_id,
      userId: data.user_id,
      parentCommentId: data.parent_comment_id,
      content: data.content,
      isEdited: data.is_edited,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: {
        username: (data.users as any)?.username || '',
        name: (data.users as any)?.creators?.display_name || (data.users as any)?.name,
        avatarUrl: (data.users as any)?.avatar_url || (data.users as any)?.creators?.profile_image_url
      },
      replies: [],
      depth: data.parent_comment_id ? 1 : 0
    };
  }

  /**
   * Busca estatísticas de comentários para um post
   * @param postId - ID do post
   * @returns Promise<CommentStats>
   */
  static async getCommentStats(postId: string): Promise<CommentStats> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('parent_comment_id, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    // Contar comentários raiz
    const { count: topLevelCount, error: countError } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_comment_id', null);

    if (countError) {
      throw new Error(`Erro ao contar comentários: ${countError.message}`);
    }

    return {
      totalComments: data?.length || 0,
      topLevelComments: topLevelCount || 0,
      lastCommentAt: data && data.length > 0 ? data[0].created_at : undefined
    };
  }
}
