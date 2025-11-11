import { supabase } from '../utils/supabaseClient';

/**
 * Serviço para gerenciar operações de follow/unfollow entre usuários
 * Centraliza todas as operações relacionadas ao sistema de following
 */
export class FollowService {
  /**
   * Seguir um usuário
   * @param followerId - ID do usuário que está seguindo
   * @param followingId - ID do usuário sendo seguido
   * @returns Promise<boolean> - true se a operação foi bem-sucedida
   */
  static async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });

      if (error) {
        // Se já existe o follow, consideramos como sucesso
        if (error.code === '23505') { // unique_violation
          return true;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      throw new Error('Falha ao seguir usuário');
    }
  }

  /**
   * Deixar de seguir um usuário
   * @param followerId - ID do usuário que está deixando de seguir
   * @param followingId - ID do usuário sendo deixado de seguir
   * @returns Promise<boolean> - true se a operação foi bem-sucedida
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      throw new Error('Falha ao deixar de seguir usuário');
    }
  }

  /**
   * Verificar se um usuário está seguindo outro
   * @param followerId - ID do usuário seguidor
   * @param followingId - ID do usuário sendo seguido
   * @returns Promise<boolean> - true se está seguindo
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar status de follow:', error);
      return false;
    }
  }

  /**
   * Obter contagem de seguidores de um usuário
   * @param userId - ID do usuário
   * @returns Promise<number> - número de seguidores
   */
  static async getFollowersCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao obter contagem de seguidores:', error);
      return 0;
    }
  }

  /**
   * Obter contagem de usuários que um usuário está seguindo
   * @param userId - ID do usuário
   * @returns Promise<number> - número de usuários seguidos
   */
  static async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao obter contagem de following:', error);
      return 0;
    }
  }

  /**
   * Obter lista de seguidores de um usuário
   * @param userId - ID do usuário
   * @param limit - limite de resultados (padrão: 50)
   * @param offset - offset para paginação (padrão: 0)
   * @returns Promise de array com IDs dos seguidores
   */
  static async getFollowers(userId: string, limit: number = 50, offset: number = 0): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(item => item.follower_id) || [];
    } catch (error) {
      console.error('Erro ao obter lista de seguidores:', error);
      return [];
    }
  }

  /**
   * Obter lista de usuários que um usuário está seguindo
   * @param userId - ID do usuário
   * @param limit - limite de resultados (padrão: 50)
   * @param offset - offset para paginação (padrão: 0)
   * @returns Promise de array com IDs dos usuários seguidos
   */
  static async getFollowing(userId: string, limit: number = 50, offset: number = 0): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(item => item.following_id) || [];
    } catch (error) {
      console.error('Erro ao obter lista de following:', error);
      return [];
    }
  }

  /**
   * Obter posts dos usuários que um usuário está seguindo
   * @param userId - ID do usuário
   * @param limit - limite de resultados (padrão: 20)
   * @param offset - offset para paginação (padrão: 0)
   * @returns Promise de array com dados dos posts
   */
  static async getFollowingPosts(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Primeiro obter IDs dos usuários seguidos
      const followingIds = await this.getFollowing(userId);

      if (followingIds.length === 0) {
        return [];
      }

      // Buscar posts dos usuários seguidos
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          content_type,
          media_urls,
          created_at,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          is_published,
          creator_id,
          username
        `)
        .in('creator_id', followingIds)
        .eq('is_published', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Buscar dados dos usuários separadamente através da tabela creators
      const postsWithUsers = await Promise.all(
        data.map(async (post) => {
          const { data: creatorData, error: creatorError } = await supabase
            .from('creators')
            .select(`
              display_name,
              profile_image_url,
              users!inner (
                name,
                avatar_url
              )
            `)
            .eq('id', post.creator_id)
            .single();

          if (creatorError) {
            console.warn('Erro ao buscar dados do creator:', creatorError);
            // Fallback: tentar buscar diretamente da tabela users se creator não existir
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, avatar_url')
              .eq('id', post.creator_id)
              .single();

            if (userError) {
              console.warn('Erro ao buscar dados do usuário (fallback):', userError);
            }

            return {
              ...post,
              users: userData || { name: post.username || 'Usuário', avatar_url: '' }
            };
          }

          // Usar dados do creator se disponível, senão dados do user
          const userData = creatorData.users || {};
          const authorName = creatorData.display_name || (userData as any).name || post.username || 'Usuário';
          const authorAvatar = creatorData.profile_image_url || (userData as any).avatar_url || '';

          return {
            ...post,
            users: {
              name: authorName,
              avatar_url: authorAvatar
            }
          };
        })
      );

      return postsWithUsers;
    } catch (error) {
      console.error('Erro ao obter posts dos usuários seguidos:', error);
      return [];
    }
  }
}
