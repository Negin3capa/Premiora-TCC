/**
 * Supabase Edge Function: Process Trending Signals
 *
 * Esta função é executada periodicamente (a cada 5 minutos) para:
 * 1. Calcular sinais de tópicos em janelas deslizantes
 * 2. Computar z-scores para detecção de bursts
 * 3. Atualizar scores globais de tendência
 *
 * Triggers: Cron job a cada 5 minutos via GitHub Actions ou pg_cron
 */

import { createClient } from 'supabase';

// Inline CORS headers for Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração do cliente Supabase com service role
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ================================================================================
// TIPOS E CONSTANTES
// ================================================================================

interface WindowConfig {
  size: string;
  durationMinutes: number;
  weight: number; // Peso na fórmula de score
}

const WINDOW_CONFIGS: WindowConfig[] = [
  { size: '1hour', durationMinutes: 60, weight: 0.7 },
  { size: '4hour', durationMinutes: 240, weight: 0.2 },
  { size: '1day', durationMinutes: 1440, weight: 0.1 }
];

// Thresholds para detecção de burst (z-score)
const BURST_THRESHOLDS = {
  explosive: 5.0,
  high: 3.0,
  moderate: 2.0
};

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================

/**
 * Calcula estatísticas baseline para um tópico
 * @param topicId ID do tópico
 * @param windowSize Tamanho da janela ('1hour', '4hour', etc.)
 * @returns Estatísticas históricas
 */
async function getBaselineStats(topicId: string, windowSize: string): Promise<{
  mean: number;
  std: number;
  count: number;
}> {
  try {
    // Buscar sinais das últimas 24 horas para calcular baseline
    const { data: signals, error } = await supabase
      .from('topic_signals')
      .select('mention_count')
      .eq('topic_id', topicId)
      .eq('window_size', windowSize)
      .gte('window_end', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('window_end', { ascending: false });

    if (error || !signals || signals.length < 3) {
      // Baseline mínima se não há dados suficientes
      return { mean: 1, std: 0.5, count: 1 };
    }

    const counts = signals.map(s => s.mention_count);
    const sum = counts.reduce((a, b) => a + b, 0);
    const mean = sum / counts.length;

    // Calcular desvio padrão
    const variance = counts.reduce((acc, count) => acc + Math.pow(count - mean, 2), 0) / counts.length;
    const std = Math.sqrt(variance);

    return {
      mean: Math.max(mean, 0.1), // Evitar divisão por zero
      std: Math.max(std, 0.1),   // Evitar z-score infinito
      count: counts.length
    };
  } catch (error) {
    console.error(`Erro ao calcular baseline para tópico ${topicId}:`, error);
    return { mean: 1, std: 0.5, count: 1 };
  }
}

/**
 * Calcula métricas de sinal para uma janela específica
 * @param topicId ID do tópico
 * @param windowObj Configuração da janela
 * @returns Métricas calculadas
 */
async function calculateSignalMetrics(
  topicId: string,
  windowObj: WindowConfig
): Promise<{
  mentionCount: number;
  engagementScore: number;
  uniqueAuthors: number;
  zScore: number;
  velocity: number;
}> {
  const windowStart = new Date(Date.now() - windowObj.durationMinutes * 60 * 1000);
  const windowEnd = new Date();

  try {
    // Contar menções de hashtag nesta janela
    const { data: mentions, error: mentionsError } = await supabase
      .from('hashtag_mentions')
      .select(`
        id,
        author_id,
        post:posts (
          id,
          like_count,
          comment_count,
          views
        )
      `)
      .eq('hashtag', (
        await supabase
          .from('trending_topics')
          .select('key')
          .eq('id', topicId)
          .single()
      ).data?.key || '')
      .gte('mentioned_at', windowStart.toISOString())
      .lte('mentioned_at', windowEnd.toISOString());

    if (mentionsError) {
      console.error(`Erro ao contar menções para tópico ${topicId}:`, mentionsError);
      return { mentionCount: 0, engagementScore: 0, uniqueAuthors: 0, zScore: 0, velocity: 0 };
    }

    // Calcular métricas
    const mentionCount = mentions?.length || 0;
    const uniqueAuthors = new Set(mentions?.map(m => m.author_id) || []).size;

    // Calcular score de engajamento
    let totalEngagement = 0;
    mentions?.forEach(mention => {
      if (mention.post) {
        const post = Array.isArray(mention.post) ? mention.post[0] : mention.post;
        totalEngagement +=
          (post.like_count || 0) * 1 +
          (post.comment_count || 0) * 3 +
          (post.views || 0) * 0.01;
      }
    });

    // Calcular z-score
    const baseline = await getBaselineStats(topicId, windowObj.size);
    const zScore = baseline.std > 0 ? (mentionCount - baseline.mean) / baseline.std : 0;

    // Calcular velocidade (taxa de mudança comparada com janela anterior)
    const previousWindowStart = new Date(windowStart.getTime() - windowObj.durationMinutes * 60 * 1000);
    const previousWindowEnd = windowStart;

    const { data: previousMentions } = await supabase
      .from('hashtag_mentions')
      .select('id')
      .eq('hashtag', (
        await supabase
          .from('trending_topics')
          .select('key')
          .eq('id', topicId)
          .single()
      ).data?.key || '')
      .gte('mentioned_at', previousWindowStart.toISOString())
      .lte('mentioned_at', previousWindowEnd.toISOString());

    const previousMentionCount = previousMentions?.length || 1; // Evitar divisão por zero
    const velocity = mentionCount - previousMentionCount;

    return {
      mentionCount,
      engagementScore: totalEngagement,
      uniqueAuthors,
      zScore,
      velocity
    };
  } catch (error) {
    console.error(`Erro ao calcular métricas para tópico ${topicId}:`, error);
    return { mentionCount: 0, engagementScore: 0, uniqueAuthors: 0, zScore: 0, velocity: 0 };
  }
}

/**
 * Atualiza ou insere sinais de tópico no banco
 */
async function upsertTopicSignal(
  topicId: string,
  windowStart: string,
  windowEnd: string,
  windowSize: string,
  metrics: {
    mentionCount: number;
    engagementScore: number;
    uniqueAuthors: number;
    zScore: number;
    velocity: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from('topic_signals')
    .upsert({
      topic_id: topicId,
      window_start: windowStart,
      window_end: windowEnd,
      window_size: windowSize,
      mention_count: metrics.mentionCount,
      engagement_score: metrics.engagementScore,
      unique_authors: metrics.uniqueAuthors,
      z_score: metrics.zScore,
      velocity: metrics.velocity,
      baseline_mean: (await getBaselineStats(topicId, windowSize)).mean,
      baseline_std: (await getBaselineStats(topicId, windowSize)).std,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'topic_id,window_start,window_size'
    });

  if (error) {
    console.error(`Erro ao upsert signal para tópico ${topicId}:`, error);
  }
}

/**
 * Atualiza score atual do tópico baseado nos sinais
 */
async function updateTopicScore(topicId: string): Promise<void> {
  try {
    // Buscar sinais mais recentes de todas as janelas
    const { data: signals, error: signalsError } = await supabase
      .from('topic_signals')
      .select('*')
      .eq('topic_id', topicId)
      .gte('window_end', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // Últimas 4h
      .order('created_at', { ascending: false });

    if (signalsError || !signals || signals.length === 0) {
      console.warn(`Nenhum sinal encontrado para tópico ${topicId}`);
      return;
    }

    // Calcular score ponderado
    let totalWeight = 0;
    let weightedScore = 0;
    let maxZScore = 0;
    let totalVelocity = 0;

    WINDOW_CONFIGS.forEach(config => {
      const signal = signals.find(s => s.window_size === config.size);
      if (signal) {
        const zScore = signal.z_score || 0;
        const velocity = signal.velocity || 0;
        const mentions = signal.mention_count || 0;

        // Score baseado em z-score, velocity e volume
        const signalScore = zScore * 1.0 + velocity * 0.1 + Math.log(mentions + 1) * 0.5;
        weightedScore += signalScore * config.weight;
        totalWeight += config.weight;

        maxZScore = Math.max(maxZScore, zScore);
        totalVelocity += velocity * config.weight;
      }
    });

    const finalScore = totalWeight > 0 ? Math.max(weightedScore / totalWeight, 0) : 0;

    // Atualizar tópico
    const { error: updateError } = await supabase
      .from('trending_topics')
      .update({
        current_score: finalScore,
        last_updated: new Date().toISOString()
      })
      .eq('id', topicId);

    if (updateError) {
      console.error(`Erro ao atualizar score do tópico ${topicId}:`, updateError);
    } else {
      console.log(`Tópico ${topicId} score atualizado: ${finalScore.toFixed(2)}`);
    }
  } catch (error) {
    console.error(`Erro geral ao atualizar score do tópico ${topicId}:`, error);
  }
}

// ================================================================================
// FUNÇÃO PRINCIPAL
// ================================================================================

/**
 * Handler principal da Edge Function
 */
export async function handler(req: Request): Promise<Response> {
  try {
    console.log('🚀 Iniciando processamento de sinais de tendência');

    // Buscar tópicos ativos (não ocultos e com atividade recente)
    const { data: activeTopics, error: topicsError } = await supabase
      .from('trending_topics')
      .select('id, key, last_mentioned_at')
      .eq('is_hidden', false)
      .gte('last_mentioned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Última semana
      .limit(1000); // Limite de segurança

    if (topicsError) {
      console.error('Erro ao buscar tópicos ativos:', topicsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar tópicos ativos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processando ${activeTopics?.length || 0} tópicos ativos`);

    let processedCount = 0;
    let errorCount = 0;

    // Processar cada tópico
    for (const topic of activeTopics || []) {
      try {
        // Processar sinais para cada configuração de janela
        for (const windowConfig of WINDOW_CONFIGS) {
          const windowStart = new Date(Date.now() - windowConfig.durationMinutes * 60 * 1000);
          const windowEnd = new Date();

          // Calcular métricas da janela atual
          const metrics = await calculateSignalMetrics(topic.id, windowConfig);

          // Salvar sinal no banco
          await upsertTopicSignal(
            topic.id,
            windowStart.toISOString(),
            windowEnd.toISOString(),
            windowConfig.size,
            metrics
          );
        }

        // Atualizar score geral do tópico
        await updateTopicScore(topic.id);

        processedCount++;

        // Checkpoint a cada 50 tópicos
        if (processedCount % 50 === 0) {
          console.log(`📈 Checkpoint: ${processedCount} tópicos processados`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar tópico ${topic.id}:`, error);
        errorCount++;
      }
    }

    // Refresh das materialized views para performance
    console.log('🔄 Atualizando materialized views...');
    await supabase.rpc('refresh_materialized_views');

    console.log(`✅ Processamento concluído: ${processedCount} sucesso, ${errorCount} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        processedTopics: processedCount,
        errors: errorCount,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro geral no processamento de sinais:', error);

    return new Response(
      JSON.stringify({
        error: 'Erro interno no processamento de sinais',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
