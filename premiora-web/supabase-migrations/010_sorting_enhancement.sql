-- Migration: Sorting Enhancement
-- Description: Adds support for efficient sorting (Hot, Top, New) by adding count columns and hot score
-- Version: 010
-- Date: 2025-11-22

-- ============================================================================
-- 1. ADD COUNT COLUMNS TO POSTS
-- ============================================================================

-- Add count columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'hot_score') THEN
        ALTER TABLE posts ADD COLUMN hot_score FLOAT DEFAULT 0;
    END IF;
END $$;

-- Create indexes for efficient sorting
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(community_id, likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts(community_id, hot_score DESC);

-- ============================================================================
-- 2. TRIGGERS FOR COUNTS
-- ============================================================================

-- Function to update likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON post_likes;
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON comments;
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ============================================================================
-- 3. HOT SCORE CALCULATION
-- ============================================================================

-- Function to calculate hot score
-- Reddit's algorithm: log10(z) + (y * t) / 45000
-- z = |U - D| (absolute score) -> we only have likes, so likes_count
-- t = epoch_seconds - 1134028003
CREATE OR REPLACE FUNCTION calculate_hot_score(likes INT, created_at TIMESTAMPTZ)
RETURNS FLOAT AS $$
DECLARE
  order_val FLOAT;
  sign_val INT;
  seconds FLOAT;
  base_date TIMESTAMPTZ := '2024-01-01 00:00:00+00'; -- Adjust base date as needed
BEGIN
  order_val := LOG(10, GREATEST(ABS(likes), 1));
  IF likes > 0 THEN
    sign_val := 1;
  ELSIF likes < 0 THEN
    sign_val := -1;
  ELSE
    sign_val := 0;
  END IF;
  
  seconds := EXTRACT(EPOCH FROM (created_at - base_date));
  
  RETURN ROUND((order_val + (sign_val * seconds / 45000))::numeric, 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update hot_score on post update/insert
CREATE OR REPLACE FUNCTION update_post_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate hot score based on new likes count
  -- Note: We use NEW.likes_count if available, otherwise we might need to fetch it
  -- But since this trigger runs on posts update, NEW.likes_count should be correct
  NEW.hot_score := calculate_hot_score(NEW.likes_count, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hot_score when likes_count changes
DROP TRIGGER IF EXISTS update_post_hot_score_trigger ON posts;
CREATE TRIGGER update_post_hot_score_trigger
BEFORE UPDATE OF likes_count ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_hot_score();

-- Trigger to set initial hot_score on insert
DROP TRIGGER IF EXISTS set_initial_hot_score_trigger ON posts;
CREATE TRIGGER set_initial_hot_score_trigger
BEFORE INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_hot_score();

-- ============================================================================
-- 4. BACKFILL DATA
-- ============================================================================

-- Backfill existing counts
UPDATE posts p
SET 
  likes_count = (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id),
  comments_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id);

-- Backfill hot scores
UPDATE posts SET hot_score = calculate_hot_score(likes_count, created_at);
