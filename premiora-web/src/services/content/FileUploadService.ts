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
}
