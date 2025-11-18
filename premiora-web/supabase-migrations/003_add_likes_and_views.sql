-- Migração: Adiciona sistema de likes e visualizações para posts
-- Data: 18/11/2025
-- Descrição: Cria tabela post_likes e adiciona colunas de contadores na tabela posts

-- Criar tabela de likes em posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir que um usuário só pode dar like uma vez por post
  UNIQUE(post_id, user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at);

-- Adicionar coluna de contador de visualizações
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Adicionar coluna de contador de likes (para performance)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Habilitar RLS (Row Level Security) para post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para post_likes
-- Usuários podem ver likes de posts públicos
CREATE POLICY "Users can view likes on public posts" ON post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND posts.is_published = true
      AND (posts.is_premium = false OR posts.creator_id = auth.uid())
    )
  );

-- Usuários autenticados podem gerenciar seus próprios likes
CREATE POLICY "Users can manage their own likes" ON post_likes
  FOR ALL USING (user_id = auth.uid());

-- Função para incrementar visualizações atomicamente
CREATE OR REPLACE FUNCTION increment_post_view(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id
  RETURNING view_count INTO new_view_count;

  -- Retornar o novo contador de visualizações
  RETURN new_view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar contador de likes automaticamente
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para manter contador de likes atualizado
DROP TRIGGER IF EXISTS trigger_update_post_like_count ON post_likes;
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Inserir dados de teste (opcional - remover em produção)
-- Isso vai popular os contadores com base nos likes existentes
UPDATE posts SET
  view_count = 0,
  like_count = COALESCE((
    SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id
  ), 0)
WHERE like_count IS NULL OR view_count IS NULL;

-- Adicionar comentários nas tabelas
COMMENT ON TABLE post_likes IS 'Tabela que armazena os likes dados pelos usuários nos posts';
COMMENT ON COLUMN post_likes.post_id IS 'ID do post que recebeu o like';
COMMENT ON COLUMN post_likes.user_id IS 'ID do usuário que deu o like';
COMMENT ON COLUMN post_likes.created_at IS 'Data e hora em que o like foi dado';

COMMENT ON COLUMN posts.view_count IS 'Contador do número total de visualizações do post';
COMMENT ON COLUMN posts.like_count IS 'Contador do número total de likes do post (mantido automaticamente)';
