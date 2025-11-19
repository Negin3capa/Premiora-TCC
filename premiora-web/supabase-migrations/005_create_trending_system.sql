-- Migração: Sistema de tendências em tempo real
-- Data: 18/11/2025
-- Descrição: Cria toda a infraestrutura de banco para o sistema de tendências ("O que está acontecendo")

-- ================================================================================
-- SEÇÃO 1: NOVAS TABELAS PARA SISTEMA DE TENDÊNCIAS
-- ================================================================================

-- Tabela principal de tópicos em tendência
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE, -- Chave única do tópico (hashtag, palavra-chave, etc.)
  title TEXT NOT NULL, -- Título limpo do tópico
  description TEXT, -- Descrição/resumo do tópico
  category TEXT DEFAULT 'geral', -- Categoria: geral, politica, esportes, tecnologia, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sample_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  first_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Dados de clusterização e ML
  vector_embedding vector(384), -- Embedding para similaridade semântica
  cluster_id UUID, -- ID do cluster ao qual pertence
  is_curated BOOLEAN DEFAULT FALSE, -- Se foi criado por curadoria humana

  -- Métricas agregadas
  total_mentions BIGINT DEFAULT 0,
  unique_authors BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0, -- likes + comments + shares
  current_score DECIMAL(10,4) DEFAULT 0,

  -- Status
  is_promoted BOOLEAN DEFAULT FALSE, -- Destaque manual
  is_hidden BOOLEAN DEFAULT FALSE, -- Ocultar por moderação
  hidden_reason TEXT -- Motivo do ocultamento
);

-- Tabela de sinais por janela temporal
CREATE TABLE IF NOT EXISTS topic_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES trending_topics(id) ON DELETE CASCADE,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  window_size TEXT NOT NULL, -- '1min', '5min', '1hour', '1day'

  -- Métricas básicas
  mention_count BIGINT DEFAULT 0,
  engagement_score DECIMAL(10,4) DEFAULT 0,
  unique_authors BIGINT DEFAULT 0,

  -- Sinais para detecção de burst
  z_score DECIMAL(6,4) DEFAULT 0, -- Desvio padrão da média histórica
  velocity DECIMAL(10,4) DEFAULT 0, -- Taxa de mudança (d(mentions)/dt)

  -- Dados brutos para baseline
  baseline_mean DECIMAL(10,4) DEFAULT 0,
  baseline_std DECIMAL(10,4) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(topic_id, window_start, window_size)
);

-- Tabela de menções de hashtags para processamento
CREATE TABLE IF NOT EXISTS hashtag_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Contexto da menção
  position_start INTEGER, -- Posição inicial no texto
  position_end INTEGER, -- Posição final no texto

  -- Metadados para análise
  is_reply BOOLEAN DEFAULT FALSE,
  retweet_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,

  UNIQUE(post_id, hashtag, position_start)
);

-- Tabela de pontuações personalizadas por usuário
CREATE TABLE IF NOT EXISTS topic_user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES trending_topics(id) ON DELETE CASCADE,
  personalized_score DECIMAL(8,4) DEFAULT 0,
  user_affinity DECIMAL(6,4) DEFAULT 0, -- Afinidade do usuário com o tópico

  -- Fatores de personalização
  follows_related BOOLEAN DEFAULT FALSE,
  recently_interacted BOOLEAN DEFAULT FALSE,
  content_category TEXT,

  last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  computation_version INTEGER DEFAULT 1,

  UNIQUE(user_id, topic_id)
);

-- Tabela de sinais anti-abuso por tópico
CREATE TABLE IF NOT EXISTS topic_abuse_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES trending_topics(id) ON DELETE CASCADE,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Sinais de manipulação
  bot_like_ratio DECIMAL(5,4) DEFAULT 0, -- Proporção de curtidas por contas suspeitas
  coordination_score DECIMAL(6,4) DEFAULT 0, -- Pontuação de coordenação inautêntica
  new_account_ratio DECIMAL(5,4) DEFAULT 0, -- Contas novas vs antigas

  -- Sinais de spam
  duplicate_content_ratio DECIMAL(5,4) DEFAULT 0,
  similar_text_clusters BIGINT DEFAULT 0,

  -- Contas suspeitas identificadas
  suspicious_accounts JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(topic_id, window_start, window_end)
);

-- ================================================================================
-- SEÇÃO 2: ÍNDICES PARA PERFORMANCE
-- ================================================================================

-- Índices essenciais para consultas de tendência
CREATE INDEX IF NOT EXISTS idx_trending_topics_key ON trending_topics(key);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(current_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON trending_topics(category);
CREATE INDEX IF NOT EXISTS idx_trending_topics_last_updated ON trending_topics(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_cluster ON trending_topics(cluster_id) WHERE cluster_id IS NOT NULL;

-- Índices para sinais temporais
CREATE INDEX IF NOT EXISTS idx_topic_signals_topic_window ON topic_signals(topic_id, window_start DESC, window_size);
CREATE INDEX IF NOT EXISTS idx_topic_signals_zscore ON topic_signals(z_score DESC) WHERE z_score > 0;
CREATE INDEX IF NOT EXISTS idx_topic_signals_created_at ON topic_signals(created_at DESC);

-- Índices para hashtags
CREATE INDEX IF NOT EXISTS idx_hashtag_mentions_hashtag_time ON hashtag_mentions(hashtag, mentioned_at DESC);
CREATE INDEX IF NOT EXISTS idx_hashtag_mentions_post ON hashtag_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_mentions_author ON hashtag_mentions(author_id);

-- Índices para personalização
CREATE INDEX IF NOT EXISTS idx_topic_user_scores_user_score ON topic_user_scores(user_id, personalized_score DESC);
CREATE INDEX IF NOT EXISTS idx_topic_user_scores_topic ON topic_user_scores(topic_id);

-- Índices para moderação
CREATE INDEX IF NOT EXISTS idx_topic_abuse_signals_topic_window ON topic_abuse_signals(topic_id, window_start DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_hidden_status ON trending_topics(is_hidden, last_updated DESC);

-- ================================================================================
-- SEÇÃO 3: VIEWS MATERIALIZADAS PARA PERFORMANCE
-- ================================================================================

-- View para tópicos em tendência global (atualizada periodicamente)
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_topics_global AS
SELECT
  tt.id,
  tt.key,
  tt.title,
  tt.category,
  tt.current_score,
  tt.total_mentions,
  tt.unique_authors,
  tt.total_engagement,
  tt.last_updated,
  tt.sample_post_id,
  ts.z_score,
  ts.velocity,
  COUNT(DISTINCT COALESCE(tus.user_id, '00000000-0000-0000-0000-000000000000'::uuid)) as personalized_for_users
FROM trending_topics tt
LEFT JOIN topic_signals ts ON tt.id = ts.topic_id
  AND ts.window_size = '1hour'
  AND ts.window_end >= NOW() - INTERVAL '1 hour'
LEFT JOIN topic_user_scores tus ON tt.id = tus.topic_id
WHERE tt.is_hidden = FALSE
  AND tt.current_score > 0
GROUP BY tt.id, tt.key, tt.title, tt.category, tt.current_score,
         tt.total_mentions, tt.unique_authors, tt.total_engagement,
         tt.last_updated, tt.sample_post_id, ts.z_score, ts.velocity
ORDER BY tt.current_score DESC, tt.last_updated DESC
WITH NO DATA;

-- View para sinais de abuso recentes
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_topics_abuse_signals AS
SELECT
  tt.id as topic_id,
  tt.key,
  tt.current_score,
  tas.bot_like_ratio,
  tas.coordination_score,
  tas.new_account_ratio,
  tas.duplicate_content_ratio,
  tas.suspicious_accounts
FROM trending_topics tt
JOIN topic_abuse_signals tas ON tt.id = tas.topic_id
WHERE tas.window_end >= NOW() - INTERVAL '1 hour'
  AND (tas.bot_like_ratio > 0.3 OR tas.coordination_score > 0.5
       OR tas.new_account_ratio > 0.4 OR tas.duplicate_content_ratio > 0.2)
ORDER BY tas.coordination_score DESC, tas.bot_like_ratio DESC
WITH NO DATA;

-- ================================================================================
-- SEÇÃO 4: FUNÇÕES PARA EXTRAÇÃO DE HASHTAGS
-- ================================================================================

-- Função para extrair hashtags de um texto
CREATE OR REPLACE FUNCTION extract_hashtags(content TEXT)
RETURNS TABLE(hashtag TEXT, position_start INTEGER, position_end INTEGER) AS $$
DECLARE
  hashtag_regex TEXT := '#([A-Za-z0-9_À-ÿ]+)';
  matches TEXT[];
  pos INTEGER := 0;
  match_text TEXT;
  match_start INTEGER;
  match_end INTEGER;
BEGIN
  -- Encontrar todas as ocorrências de hashtags
  WHILE TRUE LOOP
    -- Usar regexp_match para encontrar próxima hashtag
    SELECT * INTO match_text, match_end
    FROM regexp_match(substring(content FROM pos + 1), hashtag_regex) AS m(match_text TEXT, match_end INTEGER)
    LIMIT 1;

    IF match_text IS NULL THEN
      EXIT;
    END IF;

    match_start := pos + 1;
    match_end := match_start + char_length(match_text) - 1;

    hashtag := substring(match_text FROM 2); -- Remove o # do início
    position_start := match_start;
    position_end := match_end;
    pos := match_end;

    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================================================
-- SEÇÃO 5: FUNÇÕES PARA CÁLCULO DE ENGAGEMENT SCORE
-- ================================================================================

-- Função para calcular score de engajamento de um post
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  post_likes BIGINT,
  post_comments BIGINT,
  post_views BIGINT,
  post_shares BIGINT DEFAULT 0
)
RETURNS DECIMAL(10,4) AS $$
BEGIN
  -- Fórmula simples ponderada: likes*1 + comments*3 + shares*5 + views*0.01
  -- Pode ser ajustada baseada em dados reais
  RETURN (
    COALESCE(post_likes, 0) * 1.0 +
    COALESCE(post_comments, 0) * 3.0 +
    COALESCE(post_shares, 0) * 5.0 +
    COALESCE(post_views, 0) * 0.01
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================================================
-- SEÇÃO 6: TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ================================================================================

-- Trigger para extrair hashtags quando um post é inserido/atualizado
CREATE OR REPLACE FUNCTION process_post_hashtags()
RETURNS TRIGGER AS $$
DECLARE
  hashtag_record RECORD;
BEGIN
  -- Remove hashtags antigas deste post
  DELETE FROM hashtag_mentions WHERE post_id = NEW.id;

  -- Se o post não está publicado ou não tem conteúdo, sai
  IF NEW.is_published = FALSE OR NEW.content IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extrai e insere novas hashtags
  FOR hashtag_record IN
    SELECT DISTINCT h.hashtag, h.position_start, h.position_end
    FROM extract_hashtags(NEW.content) h
  LOOP
    INSERT INTO hashtag_mentions (
      post_id, hashtag, mentioned_at, author_id,
      position_start, position_end, is_reply,
      retweet_count, like_count
    ) VALUES (
      NEW.id, hashtag_record.hashtag, NEW.published_at,
      NEW.creator_id, hashtag_record.position_start,
      hashtag_record.position_end, FALSE,
      COALESCE(NEW.retweet_count, 0), COALESCE(NEW.like_count, 0)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para processar hashtags de posts
DROP TRIGGER IF EXISTS trigger_process_post_hashtags ON posts;
CREATE TRIGGER trigger_process_post_hashtags
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION process_post_hashtags();

-- Função para atualizar sinais de tendência quando há engajamento
CREATE OR REPLACE FUNCTION update_trending_signals()
RETURNS TRIGGER AS $$
DECLARE
  post_record RECORD;
  hashtag_text TEXT;
  topic_id UUID;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obter dados do post
  SELECT p.*, calculate_engagement_score(p.like_count, p.comment_count, p.views) as eng_score
  INTO post_record
  FROM posts p
  WHERE p.id = COALESCE(NEW.post_id, (SELECT post_id FROM post_comments WHERE id = NEW.id LIMIT 1));

  -- Para cada hashtag mencionada no post
  FOR hashtag_text IN
    SELECT DISTINCT hm.hashtag
    FROM hashtag_mentions hm
    WHERE hm.post_id = post_record.id
  LOOP
    -- Obter ou criar tópico
    SELECT tt.id INTO topic_id
    FROM trending_topics tt
    WHERE tt.key = hashtag_text;

    IF topic_id IS NULL THEN
      -- Criar novo tópico
      INSERT INTO trending_topics (
        key, title, description, category,
        first_mentioned_at, last_mentioned_at, sample_post_id,
        total_mentions, unique_authors
      ) VALUES (
        hashtag_text,
        initcap(replace(hashtag_text, '_', ' ')), -- Título formatado
        'Tópico recém-descoberto', 'geral',
        post_record.published_at, post_record.published_at, post_record.id,
        1, 1
      )
      RETURNING id INTO topic_id;
    END IF;

    -- Atualizar estatísticas do tópico (simplificado - em produção usaria jobs)
    UPDATE trending_topics SET
      total_mentions = total_mentions + 1,
      last_mentioned_at = GREATEST(last_mentioned_at, post_record.published_at),
      last_updated = NOW(),
      total_engagement = total_engagement + post_record.eng_score,
      unique_authors = unique_authors + 1 -- Simplificado, deveria verificar duplicatas
    WHERE id = topic_id;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar sinais após likes
DROP TRIGGER IF EXISTS trigger_update_trending_on_like ON post_likes;
CREATE TRIGGER trigger_update_trending_on_like
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_trending_signals();

-- Trigger para atualizar sinais após comentários
DROP TRIGGER IF EXISTS trigger_update_trending_on_comment ON post_comments;
CREATE TRIGGER trigger_update_trending_on_comment
  AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_trending_signals();

-- ================================================================================
-- SEÇÃO 7: HABILITAR RLS E POLÍTICAS DE SEGURANÇA
-- ================================================================================

-- Habilitar RLS
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_abuse_signals ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso público para leitura
CREATE POLICY "Public read access to trending topics" ON trending_topics
  FOR SELECT USING (is_hidden = FALSE OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public read access to topic signals" ON topic_signals
  FOR SELECT USING (true);

-- Políticas para dados do usuário
CREATE POLICY "Users can see their own personalized scores" ON topic_user_scores
  FOR SELECT USING (user_id = auth.uid());

-- Políticas administrativas
CREATE POLICY "Admin can manage trending topics" ON trending_topics
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage topic signals" ON topic_signals
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ================================================================================
-- SEÇÃO 8: FUNÇÕES DE UTILITÁRIO PARA MANUTENÇÃO
-- ================================================================================

-- Função para recalcular scores globais (executada periodicamente)
CREATE OR REPLACE FUNCTION refresh_global_trending_scores()
RETURNS VOID AS $$
BEGIN
  -- Esta função é mantida apenas por compatibilidade
  -- A lógica de atualização de scores foi movida para as Edge Functions

  -- Remover tópicos muito antigos sem atividade
  UPDATE trending_topics SET is_hidden = TRUE
  WHERE last_mentioned_at < NOW() - INTERVAL '7 days'
    AND total_mentions < 10
    AND current_score < 1;

  -- Atualizar materialized views para performance
  REFRESH MATERIALIZED VIEW trending_topics_global;
  REFRESH MATERIALIZED VIEW trending_topics_abuse_signals;
END;
$$ LANGUAGE plpgsql;

-- Função para refresh das materialized views (chamada pelas Edge Functions)
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
  -- Refresh concorrente para performance (não bloqueia leituras)
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_topics_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_topics_abuse_signals;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback para refresh não-concorrente se houver conflitos
    REFRESH MATERIALIZED VIEW trending_topics_global;
    REFRESH MATERIALIZED VIEW trending_topics_abuse_signals;
END;
$$ LANGUAGE plpgsql;

-- Função para clusterização simples baseada em similaridade de hashtags
CREATE OR REPLACE FUNCTION cluster_related_hashtags()
RETURNS VOID AS $$
DECLARE
  topic_record RECORD;
  similar_topic_record RECORD;
BEGIN
  -- Para cada tópico ativo
  FOR topic_record IN
    SELECT id, key FROM trending_topics WHERE is_hidden = FALSE
  LOOP
    -- Encontrar tópicos similares baseados em substring overlap
    FOR similar_topic_record IN
      SELECT tt2.id, tt2.key
      FROM trending_topics tt2
      WHERE tt2.id != topic_record.id
        AND tt2.is_hidden = FALSE
        AND (
          tt2.key LIKE '%' || topic_record.key || '%' OR
          topic_record.key LIKE '%' || tt2.key || '%' OR
          similarity(tt2.key, topic_record.key) > 0.6
        )
        AND tt2.cluster_id IS NULL
      LIMIT 10
    LOOP
      -- Agrupar tópicos similares no mesmo cluster
      UPDATE trending_topics SET
        cluster_id = COALESCE(topic_record.id, topic_record.id)
      WHERE id = similar_topic_record.id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular afinidade personalizada do usuário
CREATE OR REPLACE FUNCTION calculate_user_topic_affinity(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS DECIMAL(6,4) AS $$
DECLARE
  affinity_score DECIMAL(6,4) := 0;
  user_follows BOOLEAN := FALSE;
  recent_interactions BOOLEAN := FALSE;
  category_match BOOLEAN := FALSE;
BEGIN
  -- Verificar se usuário segue criadores relacionados ao tópico
  SELECT EXISTS(
    SELECT 1 FROM user_follows uf
    JOIN user_follows topic_users ON topic_users.follower_id = uf.following_id
    WHERE uf.follower_id = p_user_id
      AND topic_users.following_id IN (
        SELECT DISTINCT creator_id FROM posts p
        JOIN hashtag_mentions hm ON hm.post_id = p.id
        WHERE hm.hashtag = (SELECT key FROM trending_topics WHERE id = p_topic_id)
      )
    LIMIT 5
  ) INTO user_follows;

  -- Verificar interações recentes com tópicos similares
  SELECT EXISTS(
    SELECT 1 FROM post_likes pl
    JOIN hashtag_mentions hm ON hm.post_id = pl.post_id
    JOIN trending_topics tt ON tt.key = hm.hashtag
    WHERE pl.user_id = p_user_id
      AND tt.id = p_topic_id
      AND pl.created_at > NOW() - INTERVAL '7 days'
    LIMIT 1
  ) INTO recent_interactions;

  -- Verificar preferência de categoria (simulado)
  SELECT EXISTS(
    SELECT 1 FROM trending_topics tt
    WHERE tt.id = p_topic_id AND tt.category IN ('tecnologia', 'geral')
  ) INTO category_match;

  -- Calcular score baseado nos fatores
  affinity_score := 0.0;
  IF user_follows THEN affinity_score := affinity_score + 0.4; END IF;
  IF recent_interactions THEN affinity_score := affinity_score + 0.4; END IF;
  IF category_match THEN affinity_score := affinity_score + 0.2; END IF;

  RETURN affinity_score;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar pontuações personalizadas (executada periodicamente)
CREATE OR REPLACE FUNCTION update_personalized_scores(p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  user_record UUID;
  topic_record UUID;
  affinity DECIMAL(6,4);
  global_score DECIMAL(10,4);
  personalized DECIMAL(8,4);
BEGIN
  -- Para cada usuário (ou usuário específico)
  FOR user_record IN
    SELECT DISTINCT CASE WHEN p_user_id IS NOT NULL THEN p_user_id ELSE id END
    FROM users
    WHERE p_user_id IS NULL OR id = p_user_id
    LIMIT CASE WHEN p_user_id IS NOT NULL THEN 1 ELSE 50 END -- Limite de processamento
  LOOP
    -- Para cada tópico ativo
    FOR topic_record IN
      SELECT id, current_score FROM trending_topics
      WHERE is_hidden = FALSE AND current_score > 0
    LOOP
      -- Calcular afinidade
      SELECT calculate_user_topic_affinity(user_record, topic_record) INTO affinity;
      SELECT current_score FROM trending_topics WHERE id = topic_record INTO global_score;

      -- Score personalizado: combinação de afinidade e score global
      personalized := global_score * (0.3 + affinity * 0.7); -- 30% global + 70% personalizado

      -- Inserir ou atualizar score
      INSERT INTO topic_user_scores (
        user_id, topic_id, personalized_score, user_affinity,
        follows_related, recently_interacted, last_computed_at
      ) VALUES (
        user_record, topic_record, personalized, affinity,
        affinity > 0.1, affinity > 0.3, NOW()
      )
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        personalized_score = EXCLUDED.personalized_score,
        user_affinity = EXCLUDED.user_affinity,
        follows_related = EXCLUDED.follows_related,
        recently_interacted = EXCLUDED.recently_interacted,
        last_computed_at = EXCLUDED.last_computed_at,
        computation_version = computation_version + 1;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função RPC para estatísticas do sistema de tendências
CREATE OR REPLACE FUNCTION get_trending_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalTopics', (SELECT COUNT(*) FROM trending_topics),
    'activeTopics', (SELECT COUNT(*) FROM trending_topics WHERE is_hidden = FALSE),
    'trendingTopics', (SELECT COUNT(*) FROM trending_topics WHERE current_score >= 10 AND is_hidden = FALSE),
    'avgScore', ROUND((SELECT AVG(current_score) FROM trending_topics WHERE is_hidden = FALSE)::numeric, 2),
    'lastUpdate', (SELECT MAX(last_updated) FROM trending_topics)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================
-- SEÇÃO 9: DADOS INICIAIS E EXEMPLOS
-- ================================================================================

-- Inserir alguns tópicos populares iniciais (dados de exemplo)
INSERT INTO trending_topics (key, title, description, category) VALUES
('premiors', 'Premiors', 'Plataforma de criação e compartilhamento de conteúdo', 'tecnologia'),
('criadores', 'Criadores', 'Criadores de conteúdo na Premiora', 'geral'),
('comunidades', 'Comunidades', 'Comunidades ativas da Premiora', 'geral')
ON CONFLICT (key) DO NOTHING;

-- ================================================================================
-- SEÇÃO 10: COMENTÁRIOS E DOCUMENTAÇÃO
-- ================================================================================

COMMENT ON TABLE trending_topics IS 'Tabela principal com tópicos identificados pelo sistema de tendências';
COMMENT ON TABLE topic_signals IS 'Sinais temporais por janela para detectar bursts e calcular scores';
COMMENT ON TABLE hashtag_mentions IS 'Extração de hashtags de posts para análise de tópicos';
COMMENT ON TABLE topic_user_scores IS 'Pontuações personalizadas de tópicos por usuário';
COMMENT ON TABLE topic_abuse_signals IS 'Sinais de possível manipulação ou abuso em tópicos';

COMMENT ON MATERIALIZED VIEW trending_topics_global IS 'View materializada com tópicos globais ordenados por score';
COMMENT ON MATERIALIZED VIEW trending_topics_abuse_signals IS 'View materializada com tópicos suspeitos de manipulação';

COMMIT;
