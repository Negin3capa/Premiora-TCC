-- Migration: Convert OAuth avatar URLs to Supabase Storage URLs
-- This script should be run after the 'avatars' storage bucket is created

-- Note: This migration needs to be executed through an application script
-- that can:
-- 1. Fetch OAuth avatar images
-- 2. Upload them to Supabase Storage 'avatars' bucket
-- 3. Update the avatar_url in the users table

-- The application code to run this migration is in:
-- utils/avatar-migration.ts (created separately)

/*
 * Application Migration Script Steps:
 *
 * 1. Query all users with avatar_url that does not start with the Supabase URL
 * 2. For each user:
 *    a. Fetch the OAuth avatar image
 *    b. Upload it to 'avatars' bucket with path: {user_id}/oauth-migration-{timestamp}.jpg
 *    c. Update the user's avatar_url with the new Supabase URL
 * 3. Handle errors gracefully (some OAuth URLs may be expired or inaccessible)
 * 4. Log progress and results
 *
 * Command to run migration:
 * npm run migrate:oauth-avatars
 */
