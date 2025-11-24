-- Migration 006: Combined Creator Channels and Subscriptions Setup
-- This script creates the necessary tables for both creator channels and Stripe subscriptions.

-- PART 1: Creator Channel Tables and Initial RLS Policies
-- Sets up the basic structure for creator channels, subscription tiers, and benefits

-- Create creator_channels table
CREATE TABLE IF NOT EXISTS creator_channels (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    is_setup_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_channel_id UUID NOT NULL REFERENCES creator_channels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    tier_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_benefits table
CREATE TABLE IF NOT EXISTS subscription_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    benefit_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_creator_channel 
    ON subscription_tiers(creator_channel_id);
CREATE INDEX IF NOT EXISTS idx_subscription_benefits_tier 
    ON subscription_benefits(subscription_tier_id);
CREATE INDEX IF NOT EXISTS idx_creator_channels_community 
    ON creator_channels(connected_community_id);

-- Enable RLS on all tables
ALTER TABLE creator_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_benefits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_channels
CREATE POLICY "Users can view all creator channels"
    ON creator_channels FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own creator channel"
    ON creator_channels FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own creator channel"
    ON creator_channels FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can delete their own creator channel"
    ON creator_channels FOR DELETE
    USING (auth.uid() = id);

-- RLS Policies for subscription_tiers
CREATE POLICY "Anyone can view subscription tiers"
    ON subscription_tiers FOR SELECT
    USING (true);

CREATE POLICY "Creators can manage their own tiers"
    ON subscription_tiers FOR ALL
    USING (
        creator_channel_id IN (
            SELECT id FROM creator_channels WHERE id = auth.uid()
        )
    );

-- RLS Policies for subscription_benefits
CREATE POLICY "Anyone can view benefits"
    ON subscription_benefits FOR SELECT
    USING (true);

CREATE POLICY "Creators can manage benefits for their tiers"
    ON subscription_benefits FOR ALL
    USING (
        subscription_tier_id IN (
            SELECT id FROM subscription_tiers 
            WHERE creator_channel_id = auth.uid()
        )
    );

-- PART 2: Create Stripe Subscriptions Table
-- Tabela para rastrear assinaturas Stripe dos usuários

-- Create subscriptions table
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
  
  UNIQUE(user_id, stripe_subscription_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions" ON subscriptions
  FOR UPDATE USING (true);

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Tabela para rastrear assinaturas Stripe dos usuários';
