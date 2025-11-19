-- Mini-migration 2: Indexes and Security Policies
-- Date: 18/11/2025
-- Description: Creates indexes, materialized views, and RLS policies

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

-- Comentários nas tabelas
COMMENT ON TABLE trending_topics IS 'Tabela principal com tópicos identificados pelo sistema de tendências';
COMMENT ON TABLE topic_signals IS 'Sinais temporais por janela para detectar bursts e calcular scores';
COMMENT ON TABLE hashtag_mentions IS 'Extração de hashtags de posts para análise de tópicos';
COMMENT ON TABLE topic_user_scores IS 'Pontuações personalizadas de tópicos por usuário';
