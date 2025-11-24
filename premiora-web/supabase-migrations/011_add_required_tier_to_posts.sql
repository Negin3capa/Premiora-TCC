-- Add required_tier_id column to posts table
ALTER TABLE posts
ADD COLUMN required_tier_id UUID REFERENCES subscription_tiers(id) ON DELETE SET NULL;

-- Add comment
COMMENT ON COLUMN posts.required_tier_id IS 'The subscription tier required to access this post content';
