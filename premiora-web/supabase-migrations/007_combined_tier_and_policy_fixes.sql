-- Migration 007: Combined User Tier Column and Benefit Policy Fixes

-- PART 1: Ensure tier column on users table
-- Adds tier column if it doesn't exist and creates a constraint for valid values.

-- Add tier column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'tier'
  ) THEN
    ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- Update NULL values to 'free'
UPDATE users SET tier = 'free' WHERE tier IS NULL;

-- Add constraint for valid values (drop if exists and recreate)
DO $$
BEGIN
  -- Attempt to drop constraint if it exists
  BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
  
  -- Create constraint
  ALTER TABLE users ADD CONSTRAINT users_tier_check 
    CHECK (tier IN ('free', 'supporters', 'premium'));
END $$;

-- Create index on tier column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Comment for documentation
COMMENT ON COLUMN users.tier IS 'Tier de assinatura do usuário (free, supporters, premium)';


-- PART 2: Split Benefits RLS Policies
-- Attempts to fix RLS issues by splitting policies into separate INSERT, UPDATE, DELETE

-- Drop the combined policy
DROP POLICY IF EXISTS "Creators can manage benefits for their tiers" ON subscription_benefits;

-- Create separate policies for each operation
CREATE POLICY "Creators can insert benefits for their tiers"
    ON subscription_benefits FOR INSERT
    WITH CHECK (
        subscription_tier_id IN (
            SELECT id FROM subscription_tiers 
            WHERE creator_channel_id = auth.uid()
        )
    );

CREATE POLICY "Creators can update benefits for their tiers"
    ON subscription_benefits FOR UPDATE
    USING (
        subscription_tier_id IN (
            SELECT id FROM subscription_tiers 
            WHERE creator_channel_id = auth.uid()
        )
    );

CREATE POLICY "Creators can delete benefits for their tiers"
    ON subscription_benefits FOR DELETE
    USING (
        subscription_tier_id IN (
            SELECT id FROM subscription_tiers 
            WHERE creator_channel_id = auth.uid()
        )
    );
