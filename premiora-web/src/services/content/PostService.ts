/**
 * Serviço de gerenciamento de posts
 * Responsável por operações CRUD de posts
 */
import { supabase } from '../../utils/supabaseClient';
import { supabaseAdmin } from '../../utils/supabaseAdminClient';
import { FileUploadService } from './FileUploadService';
import type { PostFormData } from '../../types/content';

/**
 * Classe de serviço para operações de posts
 */
export class PostService {
  /**
   * Cria um novo post no banco de dados
   * @param postData - Dados do post
   * @param userId - ID do usuário (será convertido para creator_id)
   * @returns Promise com dados do post criado
   */
  static async createPost(
    postData: PostFormData,
    userId: string
  ): Promise<any> {
    let mediaUrls: string[] = [];

    // Upload da imagem se existir
    if (postData.image) {
      try {
        const uploadResult = await FileUploadService.uploadFile(postData.image, 'posts', userId);
        mediaUrls = [uploadResult.url];
      } catch (error) {
        console.warn('Erro no upload da imagem (continuando sem imagem):', error);
        // Não falhar a criação do post se o upload da imagem falhar
        // O post será criado como texto apenas
      }
    }

    // Primeiro, buscar dados do usuário (sempre necessário para o username)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, username, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
    }

    // Verificar se o usuário tem um registro de creator
    let creatorId = userId;

    const { data: existingCreator, error: creatorCheckError } = await supabase
      .from('creators')
      .select('id')
      .eq('id', userId)
      .single();

    if (creatorCheckError && creatorCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected
      throw new Error(`Erro ao verificar creator: ${creatorCheckError.message}`);
    }

    // Se não existe creator, criar um automaticamente
    if (!existingCreator) {
      console.log('Criando registro de creator para usuário:', userId);

      const { error: createCreatorError } = await supabaseAdmin
        .from('creators')
        .insert({
          id: userId,
          display_name: userData.name || userData.username || 'Usuário',
          bio: null,
          profile_image_url: userData.avatar_url,
          cover_image_url: null,
          website: null,
          social_links: {},
          is_active: true,
          total_subscribers: 0,
          total_earnings: 0
        });

      if (createCreatorError) {
        throw new Error(`Erro ao criar creator: ${createCreatorError.message}`);
      }

      // Atualizar o usuário para marcar como creator
      await supabase
        .from('users')
        .update({ is_creator: true })
        .eq('id', userId);
    }

    // Agora inserir o post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        content_type: postData.image ? 'image' : 'text',
        media_urls: mediaUrls,
        community_id: postData.communityId || null,
        creator_id: creatorId,
        username: userData.username, // Foreign key direta para users.username
        is_premium: false, // Por padrão, posts são públicos
        is_published: true
      })
      .select(`
        *,
        creator:creator_id (
          id,
          display_name,
          profile_image_url
        ),
        community:community_id (
          id,
          name,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar post: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca um post específico por ID
   * @param postId - ID do post
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com dados do post
   */
  static async getPostById(postId: string, userId?: string): Promise<any> {
    let query = supabase
      .from('posts')
      .select(`
        *,
        creator:creator_id (
          id,
          display_name,
          profile_image_url
        ),
        community:community_id (
          id,
          name,
          display_name,
          avatar_url
        ),
        post_likes (
          id,
          user_id
        )
      `)
      .eq('id', postId)
      .eq('is_published', true);

    // Aplicar filtros de acesso baseado no usuário
    if (userId) {
      query = query.or(`is_premium.eq.false,creator_id.eq.${userId}`);
    } else {
      // Usuário não logado vê apenas conteúdo público
      query = query.eq('is_premium', false);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new Error(`Erro ao buscar post: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um post existente
   * @param postId - ID do post
   * @param updateData - Dados para atualizar
   * @param userId - ID do usuário (para verificação de permissão)
   * @returns Promise com dados do post atualizado
   */
  static async updatePost(
    postId: string,
    updateData: Partial<PostFormData>,
    userId: string
  ): Promise<any> {
    // Verificar se o usuário é o criador do post
    const { data: existingPost, error: checkError } = await supabase
      .from('posts')
      .select('creator_id, media_urls, content_type, community_id')
      .eq('id', postId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar permissões: ${checkError.message}`);
    }

    if (existingPost.creator_id !== userId) {
      throw new Error('Você não tem permissão para editar este post');
    }

    let mediaUrls = existingPost.media_urls || [];

    // Upload de nova imagem se fornecida
    if (updateData.image) {
      try {
        const uploadResult = await FileUploadService.uploadFile(updateData.image, 'posts', userId);
        mediaUrls = [uploadResult.url];
      } catch (error) {
        console.warn('Erro no upload da nova imagem:', error);
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: updateData.title,
        content: updateData.content,
        content_type: updateData.image ? 'image' : existingPost.content_type,
        media_urls: mediaUrls,
        community_id: updateData.communityId || existingPost.community_id
      })
      .eq('id', postId)
      .select(`
        *,
        creator:creator_id (
          id,
          display_name,
          profile_image_url
        ),
        community:community_id (
          id,
          name,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar post: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove um post
   * @param postId - ID do post
   * @param userId - ID do usuário (para verificação de permissão)
   * @returns Promise void
   */
  static async deletePost(postId: string, userId: string): Promise<void> {
    // Verificar se o usuário é o criador do post
    const { data: existingPost, error: checkError } = await supabase
      .from('posts')
      .select('creator_id')
      .eq('id', postId)
      .single();

    if (checkError) {
      throw new Error(`Erro ao verificar permissões: ${checkError.message}`);
    }

    if (existingPost.creator_id !== userId) {
      throw new Error('Você não tem permissão para excluir este post');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw new Error(`Erro ao excluir post: ${error.message}`);
    }
  }
}
