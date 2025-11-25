-- Migration: Add username to get_feed_posts and get_post_details RPCs
-- Description: Adds username column to the return table of feed RPCs to fix missing author information in the UI.

-- Drop existing functions first to avoid return type mismatch errors
DROP FUNCTION IF EXISTS get_feed_posts(INTEGER, UUID, TIMESTAMPTZ, UUID, UUID, UUID, INTEGER, TEXT[]);
DROP FUNCTION IF EXISTS get_post_details(UUID, UUID);

CREATE OR REPLACE FUNCTION get_feed_posts(
  p_limit INTEGER,
  p_user_id UUID DEFAULT NULL,
  p_cursor_timestamp TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_creator_id UUID DEFAULT NULL,
  p_community_id UUID DEFAULT NULL,
  p_offset INTEGER DEFAULT NULL,
  p_content_types TEXT[] DEFAULT ARRAY['post']
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  title TEXT,
  content TEXT,
  media_urls JSONB,
  creator_id UUID,
  community_id UUID,
  is_published BOOLEAN,
  published_at TIMESTAMPTZ,
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  is_premium BOOLEAN,
  required_tier_id UUID,
  hot_score FLOAT,
  content_type TEXT,
  creator JSONB,
  community JSONB,
  flairs JSONB,
  user_has_liked BOOLEAN,
  required_tier JSONB,
  is_locked BOOLEAN,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_plan_ids UUID[];
BEGIN
  -- Get user's active subscription plan IDs if user is logged in
  IF p_user_id IS NOT NULL THEN
    SELECT ARRAY_AGG(plan_id)
    INTO v_user_plan_ids
    FROM user_subscriptions
    WHERE user_id = p_user_id AND status = 'active';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.created_at,
    p.updated_at,
    p.title::text,
    (CASE
      WHEN p.is_premium = FALSE THEN p.content
      WHEN p.creator_id = p_user_id THEN p.content
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN p.content
      ELSE NULL -- Hide content if no access
    END)::text AS content,
    (CASE
      WHEN p.is_premium = FALSE THEN p.media_urls
      WHEN p.creator_id = p_user_id THEN p.media_urls
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN p.media_urls
      ELSE NULL -- Hide media if no access
    END)::jsonb AS media_urls,
    p.creator_id,
    p.community_id,
    p.is_published,
    p.published_at,
    p.likes_count::integer,
    p.comments_count::integer,
    p.views_count::integer,
    p.is_premium,
    p.required_tier_id,
    p.hot_score::float,
    p.content_type::text,
    -- Creator info
    jsonb_build_object(
      'id', c.id,
      'display_name', c.display_name,
      'profile_image_url', c.profile_image_url
    ) as creator,
    -- Community info
    jsonb_build_object(
      'id', com.id,
      'name', com.name,
      'display_name', com.display_name,
      'avatar_url', com.avatar_url
    ) as community,
    -- Flairs
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'community_flairs', jsonb_build_object(
            'flair_text', cf.flair_text,
            'flair_color', cf.flair_color,
            'flair_background_color', cf.flair_background_color
          )
        )
      )
      FROM post_flairs pf
      JOIN community_flairs cf ON pf.flair_id = cf.id
      WHERE pf.post_id = p.id
    ), '[]'::jsonb) as flairs,
    -- User interaction
    (CASE
      WHEN p_user_id IS NOT NULL THEN EXISTS (
        SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id
      )
      ELSE FALSE
    END)::boolean as user_has_liked,
    -- Tier info
    (CASE WHEN st.id IS NOT NULL THEN
      jsonb_build_object(
        'id', st.id,
        'name', st.name,
        'tier_order', st.tier_order
      )
    ELSE NULL END)::jsonb as required_tier,
    -- Is Locked flag
    (CASE
      WHEN p.is_premium = FALSE THEN FALSE
      WHEN p.creator_id = p_user_id THEN FALSE
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN FALSE
      ELSE TRUE
    END)::boolean as is_locked,
    p.username::text
  FROM posts p
  LEFT JOIN creators c ON p.creator_id = c.id
  LEFT JOIN communities com ON p.community_id = com.id
  LEFT JOIN subscription_tiers st ON p.required_tier_id = st.id
  WHERE p.is_published = TRUE
  AND p.content_type = ANY(p_content_types)
  AND (p_creator_id IS NULL OR p.creator_id = p_creator_id)
  AND (p_community_id IS NULL OR p.community_id = p_community_id)
  AND (
    p_cursor_timestamp IS NULL OR
    (p.published_at < p_cursor_timestamp) OR
    (p.published_at = p_cursor_timestamp AND p.id < p_cursor_id)
  )
  ORDER BY p.published_at DESC, p.id DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION get_post_details(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  title TEXT,
  content TEXT,
  media_urls JSONB,
  creator_id UUID,
  community_id UUID,
  is_published BOOLEAN,
  published_at TIMESTAMPTZ,
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  is_premium BOOLEAN,
  required_tier_id UUID,
  hot_score FLOAT,
  content_type TEXT,
  creator JSONB,
  community JSONB,
  flairs JSONB,
  user_has_liked BOOLEAN,
  required_tier JSONB,
  is_locked BOOLEAN,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_plan_ids UUID[];
BEGIN
  -- Get user's active subscription plan IDs if user is logged in
  IF p_user_id IS NOT NULL THEN
    SELECT ARRAY_AGG(plan_id)
    INTO v_user_plan_ids
    FROM user_subscriptions
    WHERE user_id = p_user_id AND status = 'active';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.created_at,
    p.updated_at,
    p.title::text,
    (CASE
      WHEN p.is_premium = FALSE THEN p.content
      WHEN p.creator_id = p_user_id THEN p.content
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN p.content
      ELSE NULL -- Hide content if no access
    END)::text AS content,
    (CASE
      WHEN p.is_premium = FALSE THEN p.media_urls
      WHEN p.creator_id = p_user_id THEN p.media_urls
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN p.media_urls
      ELSE NULL -- Hide media if no access
    END)::jsonb AS media_urls,
    p.creator_id,
    p.community_id,
    p.is_published,
    p.published_at,
    p.likes_count::integer,
    p.comments_count::integer,
    p.views_count::integer,
    p.is_premium,
    p.required_tier_id,
    p.hot_score::float,
    p.content_type::text,
    -- Creator info
    jsonb_build_object(
      'id', c.id,
      'display_name', c.display_name,
      'profile_image_url', c.profile_image_url
    ) as creator,
    -- Community info
    jsonb_build_object(
      'id', com.id,
      'name', com.name,
      'display_name', com.display_name,
      'avatar_url', com.avatar_url
    ) as community,
    -- Flairs
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'community_flairs', jsonb_build_object(
            'flair_text', cf.flair_text,
            'flair_color', cf.flair_color,
            'flair_background_color', cf.flair_background_color
          )
        )
      )
      FROM post_flairs pf
      JOIN community_flairs cf ON pf.flair_id = cf.id
      WHERE pf.post_id = p.id
    ), '[]'::jsonb) as flairs,
    -- User interaction
    (CASE
      WHEN p_user_id IS NOT NULL THEN EXISTS (
        SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id
      )
      ELSE FALSE
    END)::boolean as user_has_liked,
    -- Tier info
    (CASE WHEN st.id IS NOT NULL THEN
      jsonb_build_object(
        'id', st.id,
        'name', st.name,
        'tier_order', st.tier_order
      )
    ELSE NULL END)::jsonb as required_tier,
    -- Is Locked flag
    (CASE
      WHEN p.is_premium = FALSE THEN FALSE
      WHEN p.creator_id = p_user_id THEN FALSE
      WHEN p_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscription_tiers st
        WHERE st.id = ANY(v_user_plan_ids)
        AND st.creator_channel_id = p.creator_id
        AND st.tier_order >= (SELECT st_inner.tier_order FROM subscription_tiers st_inner WHERE st_inner.id = p.required_tier_id)
      ) THEN FALSE
      ELSE TRUE
    END)::boolean as is_locked,
    p.username::text
  FROM posts p
  LEFT JOIN creators c ON p.creator_id = c.id
  LEFT JOIN communities com ON p.community_id = com.id
  LEFT JOIN subscription_tiers st ON p.required_tier_id = st.id
  WHERE p.id = p_post_id;
END;
$$;
