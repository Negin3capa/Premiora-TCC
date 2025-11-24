/**
 * Serviço de upload de arquivos
 * Responsável por fazer upload de arquivos para o Supabase Storage
 */
import { supabase } from '../../utils/supabaseClient';

/**
 * Resultado de upload de arquivo
 */
export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Classe de serviço para operações de upload de arquivos
 */
export class FileUploadService {
  /**
   * Faz upload de arquivo para o Supabase Storage
   * @param file - Arquivo a ser enviado
   * @param bucket - Bucket de destino (posts, videos, avatars, etc.)
   * @param userId - ID do usuário para organização
   * @returns Promise com resultado do upload
   */
  static async uploadFile(
    file: File,
    bucket: string,
    userId: string
  ): Promise<UploadResult> {
    const fileExt = file.name.split('.').pop();
    // Use timestamp + random string to avoid collisions with parallel uploads
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${Date.now()}_${randomStr}.${fileExt}`;
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
   * Faz upload de avatar do usuário
   * @param file - Arquivo de imagem do avatar
   * @param userId - ID do usuário
   * @returns Promise com resultado do upload
   */
  static async uploadAvatar(
    file: File,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'avatars', userId);
  }
}
