/**
 * Serviço de gerenciamento de vídeos
 * Responsável por operações CRUD de vídeos
 */
import { supabase } from '../../utils/supabaseClient';
import { FileUploadService } from './FileUploadService';
import type { VideoFormData } from '../../types/content';

/**
 * Metadados extraídos do vídeo
 */
export interface VideoMetadata {
  duration?: number; // em segundos
  width?: number;
  height?: number;
  fileSize: number;
  mimeType: string;
}

/**
 * Resultado da criação de vídeo
 */
export interface VideoCreationResult {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  createdAt: string;
}

/**
 * Classe de serviço para operações de vídeos
 */
export class VideoService {
  /**
   * Cria um novo vídeo no banco de dados e faz upload dos arquivos
   * @param videoData - Dados do formulário de vídeo
   * @param creatorId - ID do criador do vídeo
   * @returns Promise com resultado da criação
   */
  static async createVideo(videoData: VideoFormData, creatorId: string): Promise<VideoCreationResult> {
    try {
      // 1. Fazer upload do vídeo
      const videoUploadResult = await FileUploadService.uploadFile(
        videoData.video!,
        'videos',
        creatorId
      );

      // 2. Preparar thumbnail
      let thumbnailUploadResult = null;
      if (videoData.thumbnail) {
        // Usar thumbnail fornecida pelo usuário
        thumbnailUploadResult = await FileUploadService.uploadFile(
          videoData.thumbnail,
          'thumbnails',
          creatorId
        );
      } else {
        // Gerar thumbnail automaticamente do vídeo
        try {
          const generatedThumbnail = await this.generateVideoThumbnail(videoData.video!);
          if (generatedThumbnail) {
            thumbnailUploadResult = await FileUploadService.uploadFile(
              generatedThumbnail,
              'thumbnails',
              creatorId
            );
          }
        } catch (thumbnailError) {
          console.warn('Não foi possível gerar thumbnail automática:', thumbnailError);
          // Continua sem thumbnail se falhar
        }
      }

      // 3. Extrair metadados do vídeo
      const metadata = await this.extractVideoMetadata(videoData.video!);

      // 4. Buscar dados do usuário (necessário para o username)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, username, avatar_url')
        .eq('id', creatorId)
        .single();

      if (userError) {
        throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
      }

      // 6. Preparar dados para inserção no banco
      const videoRecord = {
        title: videoData.title,
        content: videoData.description,
        content_type: 'video' as const,
        media_urls: [{
          video: {
            url: videoUploadResult.url,
            path: videoUploadResult.path,
            metadata: metadata
          },
          ...(thumbnailUploadResult && {
            thumbnail: {
              url: thumbnailUploadResult.url,
              path: thumbnailUploadResult.path
            }
          })
        }],
        community_id: videoData.communityId || null,
        creator_id: creatorId,
        username: userData.username, // Foreign key direta para users.username
        is_published: true,
        published_at: new Date().toISOString()
      };

      // 7. Inserir no banco de dados
      const { data, error } = await supabase
        .from('posts')
        .insert(videoRecord)
        .select('id, title, created_at')
        .single();

      if (error) {
        throw new Error(`Erro ao salvar vídeo no banco: ${error.message}`);
      }

      // 8. Retornar resultado
      return {
        id: data.id,
        title: data.title,
        videoUrl: videoUploadResult.url,
        thumbnailUrl: thumbnailUploadResult?.url,
        metadata,
        createdAt: data.created_at
      };

    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      throw error;
    }
  }

  /**
   * Extrai metadados básicos do arquivo de vídeo
   * @param videoFile - Arquivo de vídeo
   * @returns Promise com metadados extraídos
   */
  static async extractVideoMetadata(videoFile: File): Promise<VideoMetadata> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          fileSize: videoFile.size,
          mimeType: videoFile.type
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        // Fallback com metadados básicos se não conseguir extrair
        resolve({
          fileSize: videoFile.size,
          mimeType: videoFile.type
        });
      };

      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Gera uma thumbnail automaticamente capturando um frame do vídeo
   * @param videoFile - Arquivo de vídeo
   * @param timeOffset - Tempo em segundos para capturar o frame (padrão: 10% do vídeo)
   * @returns Promise com arquivo de imagem da thumbnail
   */
  static async generateVideoThumbnail(videoFile: File, timeOffset?: number): Promise<File | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.warn('Canvas não suportado, não é possível gerar thumbnail');
        resolve(null);
        return;
      }

      video.preload = 'metadata';
      video.muted = true; // Necessário para autoplay em alguns navegadores
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Calcular tempo para captura (10% do vídeo ou tempo mínimo especificado)
        const captureTime = timeOffset || Math.max(video.duration * 0.1, 1); // Pelo menos 1 segundo

        // Configurar canvas com proporção do vídeo
        const maxWidth = 640;
        const maxHeight = 360;
        const aspectRatio = video.videoWidth / video.videoHeight;

        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;

        if (canvasHeight > maxHeight) {
          canvasHeight = maxHeight;
          canvasWidth = maxHeight * aspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Quando vídeo estiver pronto para capturar
        video.onseeked = () => {
          try {
            // Desenhar frame no canvas
            ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

            // Converter canvas para blob
            canvas.toBlob((blob) => {
              if (blob) {
                // Criar arquivo com nome único
                const thumbnailFile = new File(
                  [blob],
                  `thumbnail-${Date.now()}.jpg`,
                  { type: 'image/jpeg', lastModified: Date.now() }
                );
                resolve(thumbnailFile);
              } else {
                console.warn('Falha ao converter canvas para blob');
                resolve(null);
              }

              // Limpar recursos
              URL.revokeObjectURL(video.src);
            }, 'image/jpeg', 0.85); // Qualidade 85%
          } catch (error) {
            console.warn('Erro ao capturar thumbnail:', error);
            resolve(null);
            URL.revokeObjectURL(video.src);
          }
        };

        // Buscar para o tempo desejado
        video.currentTime = Math.min(captureTime, video.duration - 0.1);
      };

      video.onerror = () => {
        console.warn('Erro ao carregar vídeo para thumbnail');
        URL.revokeObjectURL(video.src);
        resolve(null);
      };

      // Iniciar carregamento
      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Busca vídeos do feed ordenados por data de publicação
   * @param page - Página atual (começando em 1)
   * @param limit - Número de vídeos por página
   * @param userId - ID do usuário (opcional, para personalização)
   * @returns Promise com vídeos do feed e indicador de mais conteúdo
   */
  static async getFeedVideos(page: number = 1, limit: number = 10, userId?: string): Promise<{ videos: any[]; hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          content_type,
          media_urls,
          community_id,
          creator_id,
          likes_count,
          comments_count,
          views_count,
          published_at,
          created_at,
          username,
          communities (
            id,
            name,
            display_name,
            avatar_url
          ),
          creators (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq('content_type', 'video')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Se usuário logado, pode adicionar filtros de comunidades seguidas
      // Por enquanto, retorna todos os vídeos públicos
      if (userId) {
        // TODO: Implementar lógica de comunidades seguidas
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar vídeos: ${error.message}`);
      }

      // Transformar dados para o formato do feed
      const realVideos = (data || []).map(video => this.transformVideoForFeed(video));

      // Verificar se há mais vídeos disponíveis
      const hasMore = data && data.length === limit;

      return {
        videos: realVideos,
        hasMore
      };

    } catch (error) {
      console.error('Erro ao buscar vídeos do feed:', error);
      throw error;
    }
  }

  /**
   * Transforma dados do banco para o formato do feed
   * @param videoData - Dados brutos do vídeo do banco
   * @returns Objeto formatado para o feed
   */
  static transformVideoForFeed(videoData: any): any {
    const mediaUrls = videoData.media_urls?.[0] || {};
    const videoInfo = mediaUrls.video || {};
    const thumbnailInfo = mediaUrls.thumbnail || {};

    return {
      id: videoData.id,
      type: 'video' as const,
      title: videoData.title,
      content: videoData.content,
      author: videoData.creators?.display_name || 'Usuário',
      authorUsername: videoData.username, // Username do criador
      authorAvatar: videoData.creators?.profile_image_url || '',
      thumbnail: thumbnailInfo.url || videoInfo.url, // Fallback para thumbnail
      videoUrl: videoInfo.url,
      views: videoData.views_count || 0,
      likes: videoData.likes_count || 0,
      timestamp: videoData.published_at,
      duration: videoInfo.metadata?.duration,
      resolution: videoInfo.metadata ? `${videoInfo.metadata.width}x${videoInfo.metadata.height}` : undefined,
      fileSize: videoInfo.metadata?.fileSize,
      communityId: videoData.community_id,
      communityName: videoData.communities?.name,
      communityDisplayName: videoData.communities?.display_name,
      communityAvatar: videoData.communities?.avatar_url,
      creatorId: videoData.creator_id
    };
  }

  /**
   * Busca vídeos do feed usando paginação por cursor
   * @param cursor - Cursor para paginação (null para primeira página)
   * @param limit - Número de vídeos por página
   * @param userId - ID do usuário (opcional, para personalização)
   * @returns Promise com vídeos do feed e metadados de paginação
   */
  static async getFeedVideosCursor(
    cursor: string | null = null,
    limit: number = 10,
    userId?: string
  ): Promise<{ videos: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          content_type,
          media_urls,
          community_id,
          creator_id,
          likes_count,
          comments_count,
          views_count,
          published_at,
          created_at,
          username,
          communities (
            id,
            name,
            display_name,
            avatar_url
          ),
          creators (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq('content_type', 'video')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      // Aplicar cursor se fornecido
      if (cursor) {
        const { timestamp, id } = this.decodeCursor(cursor);
        query = query.lt('published_at', timestamp).neq('id', id);
      }

      // Se usuário logado, pode adicionar filtros de comunidades seguidas
      // Por enquanto, retorna todos os vídeos públicos
      if (userId) {
        // TODO: Implementar lógica de comunidades seguidas
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar vídeos com cursor: ${error.message}`);
      }

      // Transformar dados para o formato do feed
      const realVideos = (data || []).map(video => this.transformVideoForFeed(video));

      const videos = data || [];
      let nextCursor: string | undefined;
      const hasMore = videos.length === limit;

      if (hasMore && videos.length > 0) {
        const lastVideo = videos[videos.length - 1];
        nextCursor = this.encodeCursor(lastVideo.published_at, lastVideo.id);
      }

      return {
        videos: realVideos,
        nextCursor,
        hasMore
      };

    } catch (error) {
      console.error('Erro ao buscar vídeos do feed com cursor:', error);
      throw error;
    }
  }

  /**
   * Codifica cursor baseado em timestamp e ID
   * @param timestamp - Timestamp do item
   * @param id - ID do item
   * @returns Cursor codificado em base64
   */
  private static encodeCursor(timestamp: string, id: string): string {
    const cursorData = JSON.stringify({ timestamp, id });
    return btoa(cursorData); // Base64 encoding
  }

  /**
   * Decodifica cursor para timestamp e ID
   * @param cursor - Cursor codificado
   * @returns Objeto com timestamp e id
   */
  private static decodeCursor(cursor: string): { timestamp: string; id: string } {
    try {
      const decoded = atob(cursor); // Base64 decoding
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Erro ao decodificar cursor:', error);
      throw new Error('Cursor inválido');
    }
  }

  /**
   * Busca vídeo específico por ID (placeholder para futura implementação)
   * @param _videoId - ID do vídeo
   * @param _userId - ID do usuário
   */
  static async getVideoById(_videoId: string, _userId?: string): Promise<any> {
    // TODO: Implementar busca de vídeo específico
    throw new Error('Busca de vídeo específico ainda não implementada');
  }
}
