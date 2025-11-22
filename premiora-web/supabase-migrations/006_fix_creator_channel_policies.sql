-- Migration 006: Create Creator Channel Tables and Initial RLS Policies
-- This sets up the basic structure for creator channels, subscription tiers, and benefits

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

-- RLS Policies for subscription_benefits (these may cause circular dependency issues)
CREATE POLICY "Anyone can view benefits"
    ON subscription_benefits FOR SELECT
    USING (true);

-- Note: The following policies for benefits can cause RLS circular dependencies
-- when trying to verify ownership through subscription_tiers
-- The workaround is to use supabaseAdmin (service role key) for write operations
CREATE POLICY "Creators can manage benefits for their tiers"
    ON subscription_benefits FOR ALL
    USING (
        subscription_tier_id IN (
            SELECT id FROM subscription_tiers 
            WHERE creator_channel_id = auth.uid()
        )
    );
