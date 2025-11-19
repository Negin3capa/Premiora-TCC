-- Mini-migration 1: Core Trending Tables
-- Date: 18/11/2025
-- Description: Creates the 5 core tables for the trending system

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
