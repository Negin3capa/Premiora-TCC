-- Migration 007: Split Benefits RLS Policies
-- Attempt to fix RLS issues by splitting policies into separate INSERT, UPDATE, DELETE

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

-- Note: This migration may still not resolve the RLS circular dependency issue
-- The subquery in these policies is itself subject to RLS on subscription_tiers,
-- which can cause permission errors. The solution is to use supabaseAdmin for writes.
