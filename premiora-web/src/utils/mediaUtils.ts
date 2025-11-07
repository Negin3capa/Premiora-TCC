/**
 * Utilitários para manipulação de mídia nos posts
 */
import type { PostMedia } from '../types/profile';

/**
 * Extrai a URL de thumbnail de um objeto PostMedia
 * @param media - Objeto ou string de mídia
 * @returns URL da thumbnail ou null se não encontrada
 */
export function extractThumbnailUrl(media: PostMedia): string | null {
  if (typeof media === 'string') {
    return media; // URL direta
  }

  // Se é um objeto, tenta extrair do thumbnail primeiro, depois do vídeo
  if (media.thumbnail?.url) {
    return media.thumbnail.url;
  }

  if (media.video?.url) {
    return media.video.url;
  }

  return null;
}

/**
 * Determina se um post tem mídia de vídeo
 * @param media - Objeto ou string de mídia
 * @returns true se for vídeo
 */
export function isVideoMedia(media: PostMedia): boolean {
  if (typeof media === 'string') {
    return false; // Strings são consideradas imagens
  }

  return !!media.video;
}

/**
 * Extrai a URL do vídeo de um objeto PostMedia
 * @param media - Objeto ou string de mídia
 * @returns URL do vídeo ou null se não for vídeo
 */
export function extractVideoUrl(media: PostMedia): string | null {
  if (typeof media === 'string') {
    return null; // Strings não são vídeos
  }

  return media.video?.url || null;
}
