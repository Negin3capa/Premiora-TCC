-- Migration 008: Use SECURITY DEFINER Function to Bypass RLS
-- Final attempt to fix RLS circular dependency using a security definer function

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can insert benefits for their tiers" ON subscription_benefits;
DROP POLICY IF EXISTS "Creators can update benefits for their tiers" ON subscription_benefits;
DROP POLICY IF EXISTS "Creators can delete benefits for their tiers" ON subscription_benefits;

-- Create a SECURITY DEFINER function to check tier ownership
-- This function runs with the privileges of the function owner, bypassing RLS
CREATE OR REPLACE FUNCTION check_tier_ownership(tier_id UUID, user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM subscription_tiers 
        WHERE id = tier_id 
        AND creator_channel_id = user_id
    );
END;
$$;

-- Re-create policies using the security definer function
CREATE POLICY "Creators can insert benefits for their tiers"
    ON subscription_benefits FOR INSERT
    WITH CHECK (
        check_tier_ownership(subscription_tier_id, auth.uid())
    );

CREATE POLICY "Creators can update benefits for their tiers"
    ON subscription_benefits FOR UPDATE
    USING (
        check_tier_ownership(subscription_tier_id, auth.uid())
    );

CREATE POLICY "Creators can delete benefits for their tiers"
    ON subscription_benefits FOR DELETE
    USING (
        check_tier_ownership(subscription_tier_id, auth.uid())
    );

-- Note: This approach uses SECURITY DEFINER to bypass RLS on the subscription_tiers query
-- However, the final solution implemented in the service uses supabaseAdmin for all writes,
-- which is simpler and more secure given application-level validation
