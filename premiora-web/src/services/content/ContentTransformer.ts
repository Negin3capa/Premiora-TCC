/**
 * Serviço de transformação de dados de conteúdo
 * Responsável por converter dados do banco para formato da aplicação
 */
import type { ContentItem } from '../../types/content';

/**
 * Classe de serviço para transformação de dados de conteúdo
 */
export class ContentTransformer {
  /**
   * Converte dados do banco para formato ContentItem
   * @param data - Dados do post/vídeo do banco
   * @returns ContentItem formatado
   */
  static transformToContentItem(data: any): ContentItem {
    // Verificar se é vídeo baseado na estrutura dos dados
    const isVideo = data.contentType === 'video' || data.type === 'video' || data.videoUrl;

    if (isVideo) {
      return this.transformVideoToContentItem(data);
    } else {
      return this.transformPostToContentItem(data);
    }
  }

  /**
   * Converte dados do post do banco para formato ContentItem
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
      authorUsername: postData.username, // Foreign key direta para users.username
      authorAvatar: postData.creator?.profile_image_url || '',
      thumbnail: postData.media_urls?.[0] || undefined,
      content: postData.content,
      views: postData.views_count || 0,
      likes: likesCount,
      timestamp: this.formatTimestamp(postData.published_at),
      accessLevel: postData.is_premium ? 'premium' : 'public',
      isLocked: postData.is_premium,
      communityId: postData.community?.id,
      communityName: postData.community?.name,
      communityDisplayName: postData.community?.name,
      communityAvatar: postData.community?.avatar_url
    };
  }

  /**
   * Converte dados do vídeo para formato ContentItem
   * @param videoData - Dados do vídeo
   * @returns ContentItem formatado
   */
  static transformVideoToContentItem(videoData: any): ContentItem {
    // Para vídeos, os dados já vêm pré-processados do VideoService.transformVideoForFeed()
    // então apenas mapeamos as propriedades existentes
    return {
      id: videoData.id,
      type: 'video' as const,
      title: videoData.title || '',
      author: videoData.author || videoData.creators?.display_name || 'Usuário',
      authorUsername: videoData.authorUsername || videoData.username, // Username do criador
      authorAvatar: videoData.authorAvatar || videoData.creators?.profile_image_url || '',
      thumbnail: videoData.thumbnail,
      videoUrl: videoData.videoUrl, // Já definido pelo VideoService
      content: videoData.content,
      views: videoData.views || 0,
      likes: videoData.likes || 0,
      timestamp: videoData.timestamp ? this.formatTimestamp(videoData.timestamp) : videoData.timestamp || '',
      duration: videoData.duration,
      resolution: videoData.resolution,
      fileSize: videoData.fileSize,
      communityId: videoData.communityId,
      communityName: videoData.communityName, // URL slug
      communityDisplayName: videoData.communityDisplayName || videoData.communityName, // Fallback para display name
      communityAvatar: videoData.communityAvatar,
      creatorId: videoData.creatorId
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
}
