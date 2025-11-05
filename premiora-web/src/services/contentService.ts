/**
 * Serviço de gerenciamento de conteúdo
 * Centraliza todas as operações relacionadas a posts, vídeos e outros conteúdos
 */
import { supabase } from '../utils/supabaseClient';
import { supabaseAdmin } from '../utils/supabaseAdminClient';
import type { ContentItem, PostFormData, VideoFormData } from '../types/content';

/**
 * Resultado de upload de arquivo
 */
interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Classe de serviço para operações de conteúdo
 */
export class ContentService {
  /**
   * Faz upload de arquivo para o Supabase Storage
   * @param file - Arquivo a ser enviado
   * @param bucket - Bucket de destino (posts, videos, etc.)
   * @param userId - ID do usuário para organização
   * @returns Promise com resultado do upload
   */
  static async uploadFile(
    file: File,
    bucket: string,
    userId: string
  ): Promise<UploadResult> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      fileName
    };
  }

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
        const uploadResult = await this.uploadFile(postData.image, 'posts', userId);
        mediaUrls = [uploadResult.url];
      } catch (error) {
        console.warn('Erro no upload da imagem (continuando sem imagem):', error);
        // Não falhar a criação do post se o upload da imagem falhar
        // O post será criado como texto apenas
      }
    }

    // Primeiro, verificar se o usuário tem um registro de creator
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

      // Buscar dados do usuário para criar o creator
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, username, avatar_url')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
      }

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
   * Busca posts para o feed com paginação
   * @param page - Página atual
   * @param limit - Número de posts por página
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts e metadados
   */
  static async getFeedPosts(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<{ posts: any[], hasMore: boolean }> {
    try {
      // Primeiro, obter o total de registros para evitar erros de range
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        countQuery = countQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        countQuery = countQuery.eq('is_premium', false);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Erro ao contar posts: ${countError.message}`);
      }

      const totalPosts = count || 0;
      const from = (page - 1) * limit;

      // Se não há mais posts para carregar, retornar vazio
      if (from >= totalPosts) {
        return {
          posts: [],
          hasMore: false
        };
      }

      // Ajustar o limite se estamos na última página
      const actualLimit = Math.min(limit, totalPosts - from);

      let dataQuery = supabase
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
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, from + actualLimit - 1);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        dataQuery = dataQuery.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        // Usuário não logado vê apenas conteúdo público
        dataQuery = dataQuery.eq('is_premium', false);
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) {
        throw new Error(`Erro ao buscar posts: ${dataError.message}`);
      }

      const hasMore = (from + actualLimit) < totalPosts;

      return {
        posts: data || [],
        hasMore
      };
    } catch (error) {
      console.error('Erro geral ao buscar posts do feed:', error);
      throw error;
    }
  }

  /**
   * Converte dados do banco para formato ContentItem
   * @param postData - Dados do post do banco
   * @returns ContentItem formatado
   */
  static transformPostToContentItem(postData: any): ContentItem {
    const likesCount = postData.post_likes?.length || 0;

    return {
      id: postData.id,
      type: 'post',
      title: postData.title || '',
      author: postData.creator?.display_name || 'Usuário',
      authorAvatar: postData.creator?.profile_image_url || '',
      thumbnail: postData.media_urls?.[0] || undefined,
      content: postData.content,
      views: postData.views_count || 0,
      likes: likesCount,
      timestamp: this.formatTimestamp(postData.published_at),
      accessLevel: postData.is_premium ? 'premium' : 'public',
      isLocked: postData.is_premium,
      communityId: postData.community?.id,
      communityName: postData.community?.display_name,
      communityAvatar: postData.community?.avatar_url
    };
  }

  /**
   * Formata timestamp para exibição amigável
   * @param timestamp - Timestamp do banco
   * @returns String formatada
   */
  static formatTimestamp(timestamp: string): string {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  }

  /**
   * Insere sugestões de usuários no feed
   * @param posts - Posts do feed
   * @param startIndex - Índice inicial
   * @returns Array com sugestões inseridas
   */
  static insertUserSuggestions(posts: ContentItem[], startIndex: number): ContentItem[] {
    const result: ContentItem[] = [];
    const suggestionInterval = 5;

    for (let i = 0; i < posts.length; i++) {
      result.push(posts[i]);

      if ((startIndex + i + 1) % suggestionInterval === 0) {
        const lastItem = result[result.length - 1];
        if (lastItem && lastItem.type !== 'profile') {
          const suggestionIndex = Math.floor((startIndex + i + 1) / suggestionInterval);
          result.push({
            id: `suggestion-${suggestionIndex}`,
            type: 'profile',
            title: `Sugestões para você ${suggestionIndex}`,
            author: '',
            authorAvatar: '',
            views: 0,
            likes: 0,
            timestamp: ''
          });
        }
      }
    }

    return result;
  }

  /**
   * Cria vídeo (placeholder para futura implementação)
   * @param _videoData - Dados do vídeo (não usado ainda)
   * @param _creatorId - ID do criador (não usado ainda)
   */
  static async createVideo(_videoData: VideoFormData, _creatorId: string): Promise<any> {
    // TODO: Implementar criação de vídeos
    throw new Error('Criação de vídeos ainda não implementada');
  }
}
