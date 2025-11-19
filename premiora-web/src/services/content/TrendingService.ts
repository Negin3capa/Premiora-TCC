/**
 * Serviço de tendências ("O que está acontecendo")
 * Implementa sistema de descoberta e análise de tópicos em alta
 */

import { supabase } from '../../utils/supabaseClient';

// ================================================================================
// TIPOS E INTERFACES
// ================================================================================

/**
 * Representa um tópico em tendência
 */
export interface TrendingTopic {
  id: string;
  key: string; // Hashtag ou palavra-chave
  title: string; // Título human-readable
  description?: string;
  category: string;
  currentScore: number;
  totalMentions: number;
  uniqueAuthors: number;
  totalEngagement: number;
  lastUpdated: string;
  samplePostId?: string;
  // Sinais de burst
  zScore?: number;
  velocity?: number;
  // Personalização
  personalizedScore?: number;
  userAffinity?: number;
  // Status
  isPromoted?: boolean;
  isCurated?: boolean;
  // Razão da tendência
  trendReason?: 'burst' | 'growing' | 'high_engagement' | 'personalized';
  trendMagnitude?: 'small' | 'medium' | 'large' | 'explosive';
}

/**
 * Sinais temporais de um tópico
 */
export interface TopicSignal {
  id: string;
  topicId: string;
  windowStart: string;
  windowEnd: string;
  windowSize: string; // '1min', '5min', '1hour', '1day'
  mentionCount: number;
  engagementScore: number;
  uniqueAuthors: number;
  zScore: number;
  velocity: number;
}

/**
 * Filtros para busca de tendências
 */
export interface TrendingFilters {
  category?: string;
  location?: string;
  language?: string;
  limit?: number;
  offset?: number;
  userId?: string; // Para personalização
  minScore?: number;
}

/**
 * Estatísticas de tendência
 */
export interface TrendingStats {
  totalTopics: number;
  activeTopics: number;
  trendingTopics: number;
  avgScore: number;
  lastUpdate: string;
}

/**
 * Resultado de busca de tendências
 */
export interface TrendingResult {
  topics: TrendingTopic[];
  stats: TrendingStats;
  hasMore: boolean;
  nextOffset?: number;
}

// ================================================================================
// CLASSE PRINCIPAL DO SERVIÇO
// ================================================================================

/**
 * Serviço para gerenciamento do sistema de tendências
 */
export class TrendingService {

  // ================================================================================
  // BUSCA DE TÓPICOS EM TENDÊNCIA
  // ================================================================================

  /**
   * Busca tópicos em tendência globais
   * @param filters Filtros opcionais
   * @returns Resultado com tópicos ordenados por score
   */
  static async getTrendingTopics(filters: TrendingFilters = {}): Promise<TrendingResult> {
    const {
      category,
      limit = 20,
      offset = 0,
      minScore = 0,
      userId
    } = filters;

    try {
      // Consulta base usando materialized view para performance
      let query = supabase
        .from('trending_topics_global')
        .select('*')
        .gte('current_score', minScore)
        .range(offset, offset + limit - 1)
        .order('current_score', { ascending: false });

      // Filtrar por categoria se especificada
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data: globalTopics, error } = await query;

      if (error) {
        console.error('Erro ao buscar tópicos globais:', error);
        return this.fallbackResult();
      }

      // Se tem userId, enriquecer com personalização
      let enrichedTopics = globalTopics || [];

      if (userId && enrichedTopics.length > 0) {
        enrichedTopics = await this.enrichWithPersonalization(enrichedTopics, userId);
      }

      // Adicionar análise de tendência (burst detection)
      enrichedTopics = enrichedTopics.map((topic: any) => ({
        ...topic,
        trendReason: this.analyzeTrendReason(topic),
        trendMagnitude: this.analyzeTrendMagnitude(topic),
        // Converter nomes dos campos para camelCase
        currentScore: topic.current_score,
        totalMentions: topic.total_mentions,
        uniqueAuthors: topic.unique_authors,
        totalEngagement: topic.total_engagement,
        lastUpdated: topic.last_updated,
        samplePostId: topic.sample_post_id,
        zScore: topic.z_score,
        velocity: topic.velocity,
        personalizedScore: topic.personalized_score,
        isPromoted: topic.is_promoted,
        isCurated: topic.is_curated
      }));

      // Estatísticas gerais
      const stats = await this.getTrendingStats();

      return {
        topics: enrichedTopics,
        stats,
        hasMore: enrichedTopics.length === limit,
        nextOffset: enrichedTopics.length === limit ? offset + limit : undefined
      };

    } catch (error) {
      console.error('Erro geral ao buscar tendências:', error);
      return this.fallbackResult();
    }
  }

  /**
   * Busca tópicos personalizados para um usuário específico
   * @param userId ID do usuário
   * @param filters Filtros adicionais
   * @returns Tópicos personalizados
   */
  static async getPersonalizedTrending(userId: string, filters: TrendingFilters = {}): Promise<TrendingResult> {
    try {
      // Buscar pontuações personalizadas do usuário
      const { data: personalizedScores, error: scoresError } = await supabase
        .from('topic_user_scores')
        .select(`
          personalized_score,
          user_affinity,
          topic:topic_id (
            id,
            key,
            title,
            description,
            category,
            current_score,
            total_mentions,
            unique_authors,
            total_engagement,
            last_updated,
            sample_post_id,
            is_promoted,
            is_curated
          )
        `)
        .eq('user_id', userId)
        .gt('personalized_score', 0)
        .order('personalized_score', { ascending: false })
        .limit(filters.limit || 15);

      if (scoresError) {
        console.error('Erro ao buscar scores personalizados:', scoresError);
        // Fallback para trending global
        return this.getTrendingTopics({ ...filters, userId });
      }

      // Processar dados personalizados
      const topics: TrendingTopic[] = (personalizedScores || [])
        .filter(score => score.topic) // Filtrar scores sem tópico
        .map(score => {
          const topic = score.topic as any; // Type assertion for Supabase response
          return {
            id: topic.id,
            key: topic.key,
            title: topic.title,
            description: topic.description,
            category: topic.category,
            currentScore: score.personalized_score,
            totalMentions: topic.total_mentions,
            uniqueAuthors: topic.unique_authors,
            totalEngagement: topic.total_engagement,
            lastUpdated: topic.last_updated,
            samplePostId: topic.sample_post_id,
            personalizedScore: score.personalized_score,
            userAffinity: score.user_affinity,
            isPromoted: topic.is_promoted,
            isCurated: topic.is_curated,
            trendReason: 'personalized' as const,
            trendMagnitude: this.analyzeTrendMagnitude(topic)
          };
        });

      const stats = await this.getTrendingStats();

      return {
        topics,
        stats,
        hasMore: false // Por enquanto, sem paginação para personalizado
      };

    } catch (error) {
      console.error('Erro ao buscar tendências personalizadas:', error);
      // Fallback
      return this.getTrendingTopics({ ...filters, userId });
    }
  }

  /**
   * Busca tópicos por categoria
   * @param category Categoria desejada
   * @param filters Outros filtros
   * @returns Tópicos da categoria
   */
  static async getTrendingByCategory(category: string, filters: TrendingFilters = {}): Promise<TrendingResult> {
    return this.getTrendingTopics({
      ...filters,
      category,
      limit: filters.limit || 10
    });
  }

  // ================================================================================
  // ANÁLISE DE TENDÊNCIAS
  // ================================================================================

  /**
   * Analisa o motivo da tendência baseado nos sinais
   */
  private static analyzeTrendReason(topic: any): TrendingTopic['trendReason'] {
    const zScore = topic.z_score || 0;
    const velocity = topic.velocity || 0;
    const totalEngagement = topic.total_engagement;
    const totalMentions = topic.total_mentions;

    if (zScore > 3 && velocity > 2) return 'burst';
    if (velocity > 1) return 'growing';
    if (totalEngagement > totalMentions * 10) return 'high_engagement';
    return 'growing'; // fallback
  }

  /**
   * Analisa a magnitude da tendência
   */
  private static analyzeTrendMagnitude(topic: any): TrendingTopic['trendMagnitude'] {
    const score = topic.current_score || 0;

    if (score > 100) return 'explosive';
    if (score > 50) return 'large';
    if (score > 10) return 'medium';
    return 'small';
  }

  /**
   * Enriquecer tópicos com dados personalizados do usuário
   */
  private static async enrichWithPersonalization(topics: any[], userId: string): Promise<any[]> {
    if (!topics.length) return topics;

    try {
      const topicIds = topics.map(t => t.id);
      const { data: userScores } = await supabase
        .from('topic_user_scores')
        .select('topic_id, personalized_score, user_affinity')
        .eq('user_id', userId)
        .in('topic_id', topicIds);

      const scoreMap = new Map(
        userScores?.map(score => [score.topic_id, score]) || []
      );

      return topics.map(topic => ({
        ...topic,
        personalizedScore: scoreMap.get(topic.id)?.personalized_score || topic.current_score,
        userAffinity: scoreMap.get(topic.id)?.user_affinity || 0
      }));
    } catch (error) {
      console.error('Erro ao enriquecer personalização:', error);
      return topics;
    }
  }

  /**
   * Resultado fallback quando há erro
   */
  private static fallbackResult(): TrendingResult {
    return {
      topics: [],
      stats: {
        totalTopics: 0,
        activeTopics: 0,
        trendingTopics: 0,
        avgScore: 0,
        lastUpdate: new Date().toISOString()
      },
      hasMore: false
    };
  }

  // ================================================================================
  // ESTATÍSTICAS E MONITORAMENTO
  // ================================================================================

  /**
   * Busca estatísticas gerais do sistema de tendências
   */
  static async getTrendingStats(): Promise<TrendingStats> {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_trending_stats');

      if (error || !stats) {
        // Fallback - calcular diretamente
        const { data: topics, error: topicsError } = await supabase
          .from('trending_topics')
          .select('current_score')
          .eq('is_hidden', false);

        if (topicsError) {
          return {
            totalTopics: 0,
            activeTopics: 0,
            trendingTopics: 0,
            avgScore: 0,
            lastUpdate: new Date().toISOString()
          };
        }

        const activeTopics = topics?.filter(t => t.current_score > 0) || [];
        const avgScore = activeTopics.length > 0
          ? activeTopics.reduce((sum, t) => sum + t.current_score, 0) / activeTopics.length
          : 0;

        return {
          totalTopics: topics?.length || 0,
          activeTopics: activeTopics.length,
          trendingTopics: activeTopics.filter(t => t.current_score > 10).length,
          avgScore: Math.round(avgScore * 100) / 100,
          lastUpdate: new Date().toISOString()
        };
      }

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalTopics: 0,
        activeTopics: 0,
        trendingTopics: 0,
        avgScore: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // ================================================================================
  // FUNÇÕES DE MODERAÇÃO E ADMINISTRAÇÃO
  // ================================================================================

  /**
   * Oculta um tópico (para moderação)
   */
  static async hideTopic(topicId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trending_topics')
        .update({
          is_hidden: true,
          hidden_reason: reason,
          last_updated: new Date().toISOString()
        })
        .eq('id', topicId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao ocultar tópico:', error);
      return false;
    }
  }

  /**
   * Promove um tópico (destaque manual)
   */
  static async promoteTopic(topicId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trending_topics')
        .update({
          is_promoted: true,
          last_updated: new Date().toISOString()
        })
        .eq('id', topicId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao promover tópico:', error);
      return false;
    }
  }

  /**
   * Busca sinais de abuso recentes (para dashboard de moderação)
   */
  static async getAbuseSignals(limit: number = 10): Promise<any[]> {
    try {
      const { data: signals, error } = await supabase
        .from('trending_topics_abuse_signals')
        .select('*')
        .order('coordination_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return signals || [];
    } catch (error) {
      console.error('Erro ao buscar sinais de abuso:', error);
      return [];
    }
  }

  // ================================================================================
  // FUNCIONALIDADES DE FEEDBACK DO USUÁRIO
  // ================================================================================

  /**
   * Registra feedback do usuário sobre um tópico
   */
  static async recordUserFeedback(
    userId: string,
    topicId: string,
    feedback: 'like' | 'dislike' | 'not_interested' | 'report'
  ): Promise<boolean> {
    try {
      // Em uma implementação completa, isso afetaria as pontuações personalizadas
      console.log(`Feedback registrado: User ${userId}, Topic ${topicId}, Action: ${feedback}`);
      return true;
    } catch (error) {
      console.error('Erro ao registrar feedback:', error);
      return false;
    }
  }
}
