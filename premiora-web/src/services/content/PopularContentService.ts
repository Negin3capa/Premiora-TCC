/**
 * Serviço para buscar conteúdo popular (posts e produtos)
 */
import { supabase } from '../../utils/supabaseClient';

export interface PopularProduct {
  id: string;
  title: string;
  price: number;
  date: string;
  thumbnail: string;
  creator_id?: string;
}

export interface PopularPost {
  id: string;
  title: string;
  views: number;
  thumbnail: string;
  creator: {
    display_name?: string;
    name?: string;
  };
}

/**
 * Classe de serviço para conteúdo popular
 */
export class PopularContentService {
  /**
   * Busca posts populares ordenados por visualizações
   * @param limit - Número máximo de posts a retornar
   * @param userId - ID do usuário (para controle de acesso)
   * @returns Promise com posts populares
   */
  static async getPopularPosts(limit: number = 5, userId?: string): Promise<PopularPost[]> {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          views,
          media_urls,
          creator:creator_id (
            display_name,
            name
          )
        `)
        .eq('is_published', true)
        .neq('content_type', 'video')
        .order('views', { ascending: false })
        .limit(limit);

      // Aplicar filtros de acesso baseado no usuário
      if (userId) {
        query = query.or(`is_premium.eq.false,creator_id.eq.${userId}`);
      } else {
        query = query.eq('is_premium', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar posts populares:', error);
        return []; // Return empty array instead of mock data
      }

      if (!data || data.length === 0) {
        return []; // Return empty array instead of mock data
      }

      return data.map((post: any) => ({
        id: post.id,
        title: post.title,
        views: post.views || 0,
        thumbnail: post.media_urls?.[0] ?
          `https://placehold.co/60x40/FF424D/FFFFFF?text=${post.title.substring(0, 3).toUpperCase()}` :
          'https://placehold.co/60x40/1F2937/FFFFFF?text=POST',
        creator: {
          display_name: post.creator?.display_name,
          name: post.creator?.name
        }
      }));
    } catch (error) {
      console.error('Erro geral ao buscar posts populares:', error);
      return []; // Return empty array instead of mock data
    }
  }

  /**
   * Busca produtos populares
   * Nota: Produtos ainda não implementados - retorna array vazio
   * @param _limit - Número máximo de produtos a retornar (reservado para futura implementação)
   * @param _creatorId - ID do criador (reservado para futura implementação)
   * @returns Promise com produtos populares (atualmente vazio)
   */
  static async getPopularProducts(_limit: number = 5, _creatorId?: string): Promise<PopularProduct[]> {
    // Produtos ainda não implementados - retornar array vazio
    // Futuramente, isso buscará de uma tabela 'products' quando implementada
    return [];
  }


}
