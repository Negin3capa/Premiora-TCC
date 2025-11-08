/**
 * Hook personalizado para gerenciar dados da página Explore
 * Busca dados reais de comunidades, criadores e conteúdo
 */
import { useState, useEffect, useCallback } from 'react';
import { FeedService } from '../services/content/FeedService';
import { getCommunities, getUserCommunities } from '../utils/communityUtils';
import { supabase } from '../utils/supabaseClient';
import { ContentTransformer } from '../services/content/ContentTransformer';
import { extractThumbnailUrl } from '../utils/mediaUtils';
import type { Community } from '../types/community';
import type { ContentItem } from '../types/content';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  isVerified: boolean;
  badge?: string;
  joinDate?: string;
  featuredContent: {
    type: 'video' | 'post';
    title: string;
    thumbnail: string;
  };
}

interface ExploreData {
  recentCommunities: Community[];
  recommendedCreators: Creator[];
  trendingContent: ContentItem[];
  newcomers: Creator[];
  recommendedCommunities: Community[];
}

interface UseExploreReturn {
  data: ExploreData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para buscar dados da página Explore
 * @returns Dados da página, estados de loading e função de refresh
 */
export const useExplore = (): UseExploreReturn => {
  const [data, setData] = useState<ExploreData>({
    recentCommunities: [],
    recommendedCreators: [],
    trendingContent: [],
    newcomers: [],
    recommendedCommunities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca comunidades recentes do usuário
   */
  const fetchRecentCommunities = useCallback(async (): Promise<Community[]> => {
    try {
      const userCommunities = await getUserCommunities();
      // Retornar apenas as 3 comunidades mais recentes (baseado na data de entrada)
      return userCommunities.slice(0, 3);
    } catch (err) {
      console.error('Erro ao buscar comunidades recentes:', err);
      return [];
    }
  }, []);

  /**
   * Busca criadores recomendados (mais populares)
   */
  const fetchRecommendedCreators = useCallback(async (): Promise<Creator[]> => {
    try {
      // Buscar criadores com mais posts publicados
      const { data: creatorsData, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          avatar_url,
          creators!inner (
            bio,
            display_name,
            total_subscribers
          )
        `)
        .not('creators', 'is', null)
        .order('creators.total_subscribers', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Erro ao buscar criadores recomendados:', error);
        return [];
      }

      // Transformar dados e buscar conteúdo em destaque
      const creators: Creator[] = await Promise.all(
        creatorsData.map(async (user: any) => {
          // Buscar post/video mais recente do creator
          const { data: recentContent } = await supabase
            .from('posts')
            .select('*')
            .eq('creator_id', user.id)
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(1)
            .single();

          let featuredContent: {
            type: 'video' | 'post';
            title: string;
            thumbnail: string;
          } = {
            type: 'post',
            title: 'Conteúdo em destaque',
            thumbnail: user.avatar_url || 'https://via.placeholder.com/300x200?text=Content'
          };

          if (recentContent) {
            const mediaUrls = recentContent.media_urls || [];
            const firstMedia = mediaUrls[0];
            const thumbnailUrl = firstMedia ? extractThumbnailUrl(firstMedia) : null;

            featuredContent = {
              type: recentContent.content_type === 'video' ? 'video' : 'post',
              title: recentContent.title || 'Conteúdo recente',
              thumbnail: thumbnailUrl || user.avatar_url || 'https://via.placeholder.com/300x200?text=Content'
            };
          }

          return {
            id: user.id,
            username: user.username,
            displayName: user.creators.display_name || user.name || user.username,
            avatarUrl: user.avatar_url || 'https://via.placeholder.com/80x80?text=User',
            followerCount: user.creators.total_subscribers || 0,
            isVerified: false, // TODO: Implementar sistema de verificação
            featuredContent
          };
        })
      );

      return creators.slice(0, 4); // Retornar apenas os 4 primeiros
    } catch (err) {
      console.error('Erro ao buscar criadores recomendados:', err);
      return [];
    }
  }, []);

  /**
   * Busca conteúdo em alta
   */
  const fetchTrendingContent = useCallback(async (): Promise<ContentItem[]> => {
    try {
      const result = await FeedService.getFeedPosts(1, 6); // Buscar 6 itens para ter variedade

      if (!result.posts || result.posts.length === 0) {
        return [];
      }

      // Transformar para ContentItem e ordenar por engajamento
      const contentItems = result.posts
        .map(post => ContentTransformer.transformToContentItem(post))
        .sort((a, b) => {
          const scoreA = (a.likes || 0) + (a.views || 0) * 0.1;
          const scoreB = (b.likes || 0) + (b.views || 0) * 0.1;
          return scoreB - scoreA; // Ordem decrescente
        })
        .slice(0, 4); // Pegar os 4 mais engajados

      return contentItems;
    } catch (err) {
      console.error('Erro ao buscar conteúdo em alta:', err);
      return [];
    }
  }, []);

  /**
   * Busca criadores recém-chegados
   */
  const fetchNewcomers = useCallback(async (): Promise<Creator[]> => {
    try {
      // Buscar usuários criados recentemente que têm perfil de creator
      const { data: newcomersData, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          avatar_url,
          created_at,
          creators!inner (
            bio,
            display_name,
            total_subscribers
          )
        `)
        .not('creators', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Erro ao buscar recém-chegados:', error);
        return [];
      }

      // Transformar dados
      const newcomers: Creator[] = newcomersData.map((user: any) => {
        // Formatar data de entrada
        const joinDate = new Date(user.created_at).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return {
          id: user.id,
          username: user.username,
          displayName: user.creators.display_name || user.name || user.username,
          avatarUrl: user.avatar_url || 'https://via.placeholder.com/80x80?text=User',
          followerCount: user.creators.total_subscribers || 0,
          isVerified: false,
          badge: 'Novo',
          joinDate: `Entrou em ${joinDate}`,
          featuredContent: {
            type: 'post',
            title: 'Novo na plataforma',
            thumbnail: user.avatar_url || 'https://via.placeholder.com/300x200?text=New+Creator'
          }
        };
      });

      return newcomers.slice(0, 4);
    } catch (err) {
      console.error('Erro ao buscar recém-chegados:', err);
      return [];
    }
  }, []);

  /**
   * Busca comunidades recomendadas
   */
  const fetchRecommendedCommunities = useCallback(async (): Promise<Community[]> => {
    try {
      const communities = await getCommunities();
      // Retornar comunidades populares (exceto as que o usuário já participa)
      const userCommunities = await getUserCommunities();
      const userCommunityIds = new Set(userCommunities.map(c => c.id));

      const recommended = communities
        .filter(community => !userCommunityIds.has(community.id))
        .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
        .slice(0, 4);

      return recommended;
    } catch (err) {
      console.error('Erro ao buscar comunidades recomendadas:', err);
      return [];
    }
  }, []);

  /**
   * Busca todos os dados da página Explore
   */
  const fetchExploreData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando busca de dados da página Explore');

      // Buscar todos os dados em paralelo para melhor performance
      const [
        recentCommunities,
        recommendedCreators,
        trendingContent,
        newcomers,
        recommendedCommunities
      ] = await Promise.all([
        fetchRecentCommunities(),
        fetchRecommendedCreators(),
        fetchTrendingContent(),
        fetchNewcomers(),
        fetchRecommendedCommunities()
      ]);

      setData({
        recentCommunities,
        recommendedCreators,
        trendingContent,
        newcomers,
        recommendedCommunities
      });

      console.log('✅ Dados da página Explore carregados com sucesso');
    } catch (err) {
      console.error('❌ Erro ao buscar dados da página Explore:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [
    fetchRecentCommunities,
    fetchRecommendedCreators,
    fetchTrendingContent,
    fetchNewcomers,
    fetchRecommendedCommunities
  ]);

  /**
   * Função para atualizar os dados
   */
  const refresh = useCallback(async () => {
    await fetchExploreData();
  }, [fetchExploreData]);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchExploreData();
  }, [fetchExploreData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};
