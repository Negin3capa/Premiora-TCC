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
    const isVideo = data.content_type === 'video' || data.contentType === 'video' || data.type === 'video' || data.videoUrl;

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
   * @param videoData - Dados do vídeo (raw do banco ou pré-processados)
   * @returns ContentItem formatado
   */
  static transformVideoToContentItem(videoData: any): ContentItem {
    // Verificar se os dados já estão pré-processados (do VideoService) ou raw do banco
    const isPreprocessed = videoData.type === 'video' && videoData.thumbnail;

    if (isPreprocessed) {
      // Dados já pré-processados do VideoService.transformVideoForFeed()
      return {
        id: videoData.id,
        type: 'video' as const,
        title: videoData.title || '',
        author: videoData.author || videoData.creators?.display_name || 'Usuário',
        authorUsername: videoData.authorUsername || videoData.username,
        authorAvatar: videoData.authorAvatar || videoData.creators?.profile_image_url || '',
        thumbnail: videoData.thumbnail,
        videoUrl: videoData.videoUrl,
        content: videoData.content,
        views: videoData.views || videoData.views_count || 0,
        likes: videoData.likes || videoData.likes_count || 0,
        timestamp: videoData.timestamp ? this.formatTimestamp(videoData.timestamp) : videoData.timestamp || '',
        duration: videoData.duration,
        resolution: videoData.resolution,
        fileSize: videoData.fileSize,
        communityId: videoData.communityId || videoData.community_id,
        communityName: videoData.communityName || videoData.community?.name,
        communityDisplayName: videoData.communityDisplayName || videoData.communityName || videoData.community?.display_name,
        communityAvatar: videoData.communityAvatar || videoData.community?.avatar_url,
        creatorId: videoData.creatorId || videoData.creator_id
      };
    } else {
      // Dados raw do banco - extrair informações do media_urls
      const mediaUrls = videoData.media_urls?.[0] || {};
      const videoInfo = mediaUrls.video || {};
      const thumbnailInfo = mediaUrls.thumbnail || {};

      return {
        id: videoData.id,
        type: 'video' as const,
        title: videoData.title || '',
        author: videoData.creator?.display_name || 'Usuário',
        authorUsername: videoData.username,
        authorAvatar: videoData.creator?.profile_image_url || '',
        thumbnail: thumbnailInfo.url || videoInfo.url, // Fallback para thumbnail
        videoUrl: videoInfo.url,
        content: videoData.content,
        views: videoData.views_count || 0,
        likes: videoData.likes_count || 0,
        timestamp: this.formatTimestamp(videoData.published_at),
        duration: videoInfo.metadata?.duration,
        resolution: videoInfo.metadata ? `${videoInfo.metadata.width}x${videoInfo.metadata.height}` : undefined,
        fileSize: videoInfo.metadata?.fileSize,
        communityId: videoData.community_id,
        communityName: videoData.community?.name,
        communityDisplayName: videoData.community?.display_name || videoData.community?.name,
        communityAvatar: videoData.community?.avatar_url,
        creatorId: videoData.creator_id
      };
    }
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
