-- Migration: Community System Enhancement
-- Description: Adds Reddit-like features including pinned posts, rules, flairs, and admin controls
-- Version: 009
-- Date: 2025-11-22

-- ============================================================================
-- 1. ADD PINNED POST SUPPORT
-- ============================================================================

-- Add pinned status to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES auth.users(id);

-- Create index for efficient pinned post queries
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(community_id, is_pinned DESC, pinned_at DESC) WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_community_created ON posts(community_id, created_at DESC) WHERE community_id IS NOT NULL;

-- ============================================================================
-- 2. COMMUNITY SETTINGS
-- ============================================================================

-- Add settings JSON field to communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "allowUserFlairs": true,
  "requirePostFlair": false,
  "allowImagePosts": true,
  "allowVideoPosts": true,
  "restrictPosting": "members"
}'::jsonb;

-- ============================================================================
-- 3. COMMUNITY RULES
-- ============================================================================

DROP TABLE IF EXISTS community_rules CASCADE;
CREATE TABLE community_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rule_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_rule_order UNIQUE(community_id, rule_order)
);

-- Create index for efficient rule queries
CREATE INDEX IF NOT EXISTS idx_community_rules_order ON community_rules(community_id, rule_order);

-- Enable RLS
ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_rules
CREATE POLICY "Anyone can view community rules"
  ON community_rules FOR SELECT
  USING (true);

-- ============================================================================
-- 4. FLAIR SYSTEM - Templates (created by admins)
-- ============================================================================

DROP TABLE IF EXISTS community_flairs CASCADE;
CREATE TABLE community_flairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  flair_text TEXT NOT NULL,
  flair_color TEXT DEFAULT '#3B82F6',
  flair_background_color TEXT DEFAULT '#1E3A8A',
  flair_type TEXT NOT NULL CHECK (flair_type IN ('user', 'post')),
  is_mod_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient flair queries
CREATE INDEX IF NOT EXISTS idx_community_flairs_type ON community_flairs(community_id, flair_type);

-- Enable RLS
ALTER TABLE community_flairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_flairs
CREATE POLICY "Anyone can view community flairs"
  ON community_flairs FOR SELECT
  USING (true);

-- ============================================================================
-- 5. USER FLAIRS - User flair assignments in communities
-- ============================================================================

DROP TABLE IF EXISTS user_flairs CASCADE;
CREATE TABLE user_flairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flair_id UUID REFERENCES community_flairs(id) ON DELETE SET NULL,
  custom_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_community_flair UNIQUE(community_id, user_id)
);

-- Create index for efficient user flair lookups
CREATE INDEX IF NOT EXISTS idx_user_flairs_lookup ON user_flairs(community_id, user_id);

-- Enable RLS
ALTER TABLE user_flairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_flairs
CREATE POLICY "Anyone can view user flairs"
  ON user_flairs FOR SELECT
  USING (true);

-- ============================================================================
-- 6. POST FLAIRS - Post flair assignments
-- ============================================================================

DROP TABLE IF EXISTS post_flairs CASCADE;
CREATE TABLE post_flairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  flair_id UUID NOT NULL REFERENCES community_flairs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_post_flair UNIQUE(post_id)
);

-- Create index for efficient post flair lookups
CREATE INDEX IF NOT EXISTS idx_post_flairs_lookup ON post_flairs(post_id);

-- Enable RLS
ALTER TABLE post_flairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_flairs
CREATE POLICY "Anyone can view post flairs"
  ON post_flairs FOR SELECT
  USING (true);

-- ============================================================================
-- 7. USER ACTIVITY TRACKING - For online/active metrics
-- ============================================================================

DROP TABLE IF EXISTS community_user_activity CASCADE;
CREATE TABLE community_user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_community_user_activity UNIQUE(community_id, user_id)
);

-- Create index for efficient activity queries
CREATE INDEX IF NOT EXISTS idx_user_activity_lastseen ON community_user_activity(community_id, last_seen DESC);

-- Enable RLS
ALTER TABLE community_user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_user_activity
CREATE POLICY "Users can view community activity"
  ON community_user_activity FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own activity"
  ON community_user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity timestamp"
  ON community_user_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. RPC FUNCTIONS
-- ============================================================================

-- Function to check if user is community admin (owner or moderator)
CREATE OR REPLACE FUNCTION is_community_admin(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND role IN ('owner', 'moderator', 'creator') -- Include 'creator' for backwards compatibility
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle pin status on a post
CREATE OR REPLACE FUNCTION toggle_pin_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_community_id UUID;
  v_is_pinned BOOLEAN;
  v_new_pinned_status BOOLEAN;
BEGIN
  -- Get community_id and current pin status
  SELECT community_id, COALESCE(is_pinned, FALSE) INTO v_community_id, v_is_pinned
  FROM posts WHERE id = p_post_id;
  
  -- Check if post exists and has a community
  IF v_community_id IS NULL THEN
    RAISE EXCEPTION 'Post not found or not in a community';
  END IF;
  
  -- Check if user is admin
  IF NOT is_community_admin(v_community_id, p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a community admin';
  END IF;
  
  -- Toggle pin status
  v_new_pinned_status := NOT v_is_pinned;
  
  UPDATE posts
  SET is_pinned = v_new_pinned_status,
      pinned_at = CASE WHEN v_new_pinned_status THEN NOW() ELSE NULL END,
      pinned_by = CASE WHEN v_new_pinned_status THEN p_user_id ELSE NULL END
  WHERE id = p_post_id;
  
  RETURN v_new_pinned_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user activity in a community
CREATE OR REPLACE FUNCTION update_user_activity(p_community_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO community_user_activity (community_id, user_id, last_seen)
  VALUES (p_community_id, p_user_id, NOW())
  ON CONFLICT (community_id, user_id)
  DO UPDATE SET last_seen = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get online users count (active in last 15 minutes)
CREATE OR REPLACE FUNCTION get_online_users_count(p_community_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM community_user_activity
    WHERE community_id = p_community_id
    AND last_seen > NOW() - INTERVAL '15 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active users today
CREATE OR REPLACE FUNCTION get_active_users_today(p_community_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM community_user_activity
    WHERE community_id = p_community_id
    AND last_seen > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active users this week
CREATE OR REPLACE FUNCTION get_active_users_week(p_community_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM community_user_activity
    WHERE community_id = p_community_id
    AND last_seen > NOW() - INTERVAL '7 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. ADMIN WRITE POLICIES
-- ============================================================================

-- Allow admins to manage community rules
CREATE POLICY "Admins can insert community rules"
  ON community_rules FOR INSERT
  WITH CHECK (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Admins can update community rules"
  ON community_rules FOR UPDATE
  USING (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Admins can delete community rules"
  ON community_rules FOR DELETE
  USING (is_community_admin(community_id, auth.uid()));

-- Allow admins to manage community flairs
CREATE POLICY "Admins can insert community flairs"
  ON community_flairs FOR INSERT
  WITH CHECK (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Admins can update community flairs"
  ON community_flairs FOR UPDATE
  USING (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Admins can delete community flairs"
  ON community_flairs FOR DELETE
  USING (is_community_admin(community_id, auth.uid()));

-- Allow users and admins to manage user flairs
CREATE POLICY "Users can set their own flair"
  ON user_flairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flair"
  ON user_flairs FOR UPDATE
  USING (auth.uid() = user_id OR is_community_admin(community_id, auth.uid()));

CREATE POLICY "Users can delete their own flair"
  ON user_flairs FOR DELETE
  USING (auth.uid() = user_id OR is_community_admin(community_id, auth.uid()));

-- Allow post authors and admins to manage post flairs
CREATE POLICY "Post authors can set post flair"
  ON post_flairs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_flairs.post_id
      AND posts.creator_id = auth.uid()
    )
  );

CREATE POLICY "Post authors and admins can update post flair"
  ON post_flairs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_flairs.post_id
      AND (
        posts.creator_id = auth.uid()
        OR is_community_admin(posts.community_id, auth.uid())
      )
    )
  );

CREATE POLICY "Post authors and admins can delete post flair"
  ON post_flairs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_flairs.post_id
      AND (
        posts.creator_id = auth.uid()
        OR is_community_admin(posts.community_id, auth.uid())
      )
    )
  );

-- ============================================================================
-- 10. HELPER VIEWS (Optional - for easier querying)
-- ============================================================================

-- View for posts with flair information
CREATE OR REPLACE VIEW posts_with_flairs AS
SELECT 
  p.*,
  pf.flair_id,
  cf.flair_text,
  cf.flair_color,
  cf.flair_background_color
FROM posts p
LEFT JOIN post_flairs pf ON p.id = pf.post_id
LEFT JOIN community_flairs cf ON pf.flair_id = cf.id;

-- ============================================================================
-- 11. TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_community_rules_updated_at BEFORE UPDATE ON community_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_flairs_updated_at BEFORE UPDATE ON community_flairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_flairs_updated_at BEFORE UPDATE ON user_flairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE community_rules IS 'Stores customizable rules for each community';
COMMENT ON TABLE community_flairs IS 'Flair templates created by community admins';
COMMENT ON TABLE user_flairs IS 'User flair assignments within communities';
COMMENT ON TABLE post_flairs IS 'Post flair assignments';
COMMENT ON TABLE community_user_activity IS 'Tracks user activity for online/active metrics';
