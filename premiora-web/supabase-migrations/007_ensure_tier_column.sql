-- Migration: Garantir coluna tier na tabela users
-- Descrição: Adiciona coluna tier se não existir e cria constraint para valores válidos

-- Adicionar coluna tier se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'tier'
  ) THEN
    ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- Atualizar valores NULL para 'free'
UPDATE users SET tier = 'free' WHERE tier IS NULL;

-- Adicionar constraint para valores válidos (drop se existir e recriar)
DO $$
BEGIN
  -- Tentar dropar constraint se existir
  BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
  
  -- Criar constraint
  ALTER TABLE users ADD CONSTRAINT users_tier_check 
    CHECK (tier IN ('free', 'supporters', 'premium'));
END $$;

-- Criar índice na coluna tier se não existir
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Comentário para documentação
COMMENT ON COLUMN users.tier IS 'Tier de assinatura do usuário (free, supporters, premium)';
