-- Migração: Sistema de comentários para posts
-- Data: 18/11/2025
-- Descrição: Cria tabela post_comments e estrutura completa para comentários hierárquicos

-- Criar tabela de comentários em posts
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- Para comentários aninhados
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint para impedir comentários sem conteúdo útil
  CONSTRAINT content_not_empty CHECK (trim(content) != ''),
  -- Constraint para comentários não poderem ser filhos de si mesmos
  CONSTRAINT no_self_reference CHECK (id != parent_comment_id),
  -- Um usuário só pode comentar uma vez por post (para evitar spam)
  UNIQUE(post_id, user_id, COALESCE(parent_comment_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_comment_id ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- Adicionar coluna de contador de comentários na tabela posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Habilitar RLS (Row Level Security) para post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para post_comments
-- Usuários podem ver comentários de posts públicos onde têm acesso
CREATE POLICY "Users can view comments on accessible posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id
      AND posts.is_published = true
      AND (posts.is_premium = false OR posts.creator_id = auth.uid())
    )
  );

-- Usuários autenticados podem gerenciar seus próprios comentários
CREATE POLICY "Users can manage their own comments" ON post_comments
  FOR ALL USING (user_id = auth.uid());

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_comment_updated_at ON post_comments;
CREATE TRIGGER trigger_update_comment_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contador de comentários automaticamente
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Só decrementa se o comentário não for resposta (parent_comment_id IS NULL)
    -- ou se for raiz da thread (evita decrementos múltiplos para threads aninhadas)
    IF OLD.parent_comment_id IS NULL THEN
      UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para manter contador de comentários atualizado
DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON post_comments;
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Atualizar contadores existentes (para migração)
UPDATE posts SET
  comment_count = COALESCE((
    SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id
  ), 0);

-- Adicionar comentários nas tabelas
COMMENT ON TABLE post_comments IS 'Tabela que armazena os comentários feitos pelos usuários nos posts';
COMMENT ON COLUMN post_comments.post_id IS 'ID do post que recebeu o comentário';
COMMENT ON COLUMN post_comments.user_id IS 'ID do usuário que fez o comentário';
COMMENT ON COLUMN post_comments.parent_comment_id IS 'ID do comentário pai (para comentários aninhados/respostas)';
COMMENT ON COLUMN post_comments.content IS 'Conteúdo do comentário em formato texto';
COMMENT ON COLUMN post_comments.is_edited IS 'Flag indicando se o comentário foi editado após a criação';
COMMENT ON COLUMN post_comments.created_at IS 'Data e hora de criação do comentário';
COMMENT ON COLUMN post_comments.updated_at IS 'Data e hora da última atualização do comentário';

COMMENT ON COLUMN posts.comment_count IS 'Contador do número total de comentários do post (threads raiz)'; -- Atualizado automaticamente
