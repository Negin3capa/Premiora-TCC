-- Migration: Create check_identity_conflict RPC
-- Description: Checks for identity conflicts in auth.users to prevent duplicate accounts with different providers.

CREATE OR REPLACE FUNCTION check_identity_conflict(
  p_email TEXT,
  p_provider TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_provider TEXT;
  v_metadata JSONB;
BEGIN
  -- Check if user exists
  SELECT id, raw_app_meta_data INTO v_user_id, v_metadata
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('exists', false);
  END IF;

  v_existing_provider := v_metadata->>'provider';

  RETURN jsonb_build_object(
    'exists', true,
    'user_id', v_user_id,
    'provider', v_existing_provider
  );
END;
$$;
