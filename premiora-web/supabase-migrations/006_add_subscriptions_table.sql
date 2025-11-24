-- Migration: Criar tabela de assinaturas
-- Descrição: Tabela para rastrear assinaturas Stripe dos usuários

-- Criar tabela subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário tenha apenas uma assinatura ativa
  UNIQUE(user_id, stripe_subscription_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver apenas suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas o sistema pode criar assinaturas (via service role)
CREATE POLICY "Service role can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Apenas o sistema pode atualizar assinaturas (via service role)
CREATE POLICY "Service role can update subscriptions" ON subscriptions
  FOR UPDATE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Comentários para documentação
COMMENT ON TABLE subscriptions IS 'Tabela para rastrear assinaturas Stripe dos usuários';
COMMENT ON COLUMN subscriptions.user_id IS 'ID do usuário que possui a assinatura';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'ID do preço/plano no Stripe';
COMMENT ON COLUMN subscriptions.status IS 'Status da assinatura (active, canceled, past_due, incomplete, trialing)';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Início do período atual de cobrança';
COMMENT ON COLUMN subscriptions.current_period_end IS 'Fim do período atual de cobrança';
