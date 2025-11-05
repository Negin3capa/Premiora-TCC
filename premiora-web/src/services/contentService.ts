/**
 * Serviço legado de gerenciamento de conteúdo
 * @deprecated Use os serviços especializados em services/content/ em vez deste
 * Este arquivo será removido após migração completa dos imports
 */
import { FileUploadService, ContentTransformer, PostService, FeedService, VideoService } from './content';
import type { ContentItem, PostFormData, VideoFormData } from '../types/content';

/**
 * Classe de serviço legado para manter compatibilidade
 * @deprecated Use os serviços especializados diretamente
 */
export class ContentService {
  /**
   * Faz upload de arquivo para o Supabase Storage
   * @deprecated Use FileUploadService.uploadFile
   */
  static async uploadFile(
    file: File,
    bucket: string,
    userId: string
  ) {
    return FileUploadService.uploadFile(file, bucket, userId);
  }

  /**
   * Cria um novo post no banco de dados
   * @deprecated Use PostService.createPost
   */
  static async createPost(
    postData: PostFormData,
    userId: string
  ): Promise<any> {
    return PostService.createPost(postData, userId);
  }

  /**
   * Busca posts para o feed com paginação
   * @deprecated Use FeedService.getFeedPosts
   */
  static async getFeedPosts(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<{ posts: any[], hasMore: boolean }> {
    const result = await FeedService.getFeedPosts(page, limit, userId);
    return {
      posts: result.posts,
      hasMore: result.hasMore
    };
  }

  /**
   * Converte dados do banco para formato ContentItem
   * @deprecated Use ContentTransformer.transformPostToContentItem
   */
  static transformPostToContentItem(postData: any): ContentItem {
    return ContentTransformer.transformPostToContentItem(postData);
  }

  /**
   * Formata timestamp para exibição amigável
   * @deprecated Use ContentTransformer.formatTimestamp
   */
  static formatTimestamp(timestamp: string): string {
    return ContentTransformer.formatTimestamp(timestamp);
  }

  /**
   * Insere sugestões de usuários no feed
   * @deprecated Use ContentTransformer.insertUserSuggestions
   */
  static insertUserSuggestions(posts: ContentItem[], startIndex: number): ContentItem[] {
    return ContentTransformer.insertUserSuggestions(posts, startIndex);
  }

  /**
   * Cria vídeo (placeholder para futura implementação)
   * @deprecated Use VideoService.createVideo
   */
  static async createVideo(videoData: VideoFormData, creatorId: string): Promise<any> {
    return VideoService.createVideo(videoData, creatorId);
  }
}
