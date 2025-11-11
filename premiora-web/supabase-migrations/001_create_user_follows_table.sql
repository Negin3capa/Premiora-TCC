-- Criar tabela para relacionamentos de follow entre usuários
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir que um usuário não possa seguir a si mesmo
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),

  -- Garantir que não haja follows duplicados
  UNIQUE(follower_id, following_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver seus próprios follows
CREATE POLICY "Users can view their own follows" ON user_follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Usuários podem criar seus próprios follows
CREATE POLICY "Users can create their own follows" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Usuários podem deletar seus próprios follows
CREATE POLICY "Users can delete their own follows" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Políticas públicas para leitura (opcional - para mostrar contagens públicas)
-- CREATE POLICY "Public read access for follow counts" ON user_follows
--   FOR SELECT USING (true);
