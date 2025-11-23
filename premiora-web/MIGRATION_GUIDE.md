# Community Enhancement Migration Guide

## Overview
This migration adds Reddit-like community features including:
- Pinned posts
- Community rules (CRUD)
- User and post flairs
- Real-time metrics (online users, active users)
- Admin permissions and controls

## Prerequisites
- Supabase CLI installed
- Database connection configured
- Admin access to Supabase project

## Running the Migration

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to premiora-web directory
cd premiora-web

# Run the migration
supabase db push

# Or apply specific migration
supabase migration up --file supabase-migrations/009_community_system_enhancement.sql
```

### Option 2: Manual SQL Execution

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `supabase-migrations/009_community_system_enhancement.sql`
4. Paste and execute

### Option 3: Using psql

```bash
psql -h <your-supabase-host> \
     -U postgres \
     -d postgres \
     -f premiora-web/supabase-migrations/009_community_system_enhancement.sql
```

## Verification

After running the migration, verify the following tables were created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'community_rules',
  'community_flairs',
  'user_flairs',
  'post_flairs',
  'community_user_activity'
);

-- Check RPC functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'is_community_admin',
  'toggle_pin_post',
  'update_user_activity',
  'get_online_users_count',
  'get_active_users_today',
  'get_active_users_week'
);

-- Check new columns on posts table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('is_pinned', 'pinned_at', 'pinned_by');

-- Check settings column on communities
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND column_name = 'settings';
```

## Post-Migration Steps

1. **Test Admin Functions**:
   ```sql
   -- Test if a user is admin of a community
   SELECT is_community_admin(
     '<community-id>'::uuid,
     '<user-id>'::uuid
   );
   ```

2. **Initialize Default Settings** (optional):
   ```sql
   -- Update existing communities with default settings
   UPDATE communities 
   SET settings = '{
     "allowUserFlairs": true,
     "requirePostFlair": false,
     "allowImagePosts": true,
     "allowVideoPosts": true,
     "restrictPosting": "members"
   }'::jsonb
   WHERE settings IS NULL OR settings = '{}'::jsonb;
   ```

3. **Migrate Creator Roles** (if needed):
   ```sql
   -- Update 'creator' roles to 'owner' for consistency
   UPDATE community_members 
   SET role = 'owner' 
   WHERE role = 'creator';
   ```

## Rollback (if needed)

If you need to rollback this migration:

```sql
--DROP VIEWS
DROP VIEW IF EXISTS posts_with_flairs CASCADE;

-- DROP FUNCTIONS
DROP FUNCTION IF EXISTS is_community_admin(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS toggle_pin_post(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_activity(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_online_users_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_active_users_today(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_active_users_week(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- DROP TABLES
DROP TABLE IF EXISTS post_flairs CASCADE;
DROP TABLE IF EXISTS user_flairs CASCADE;
DROP TABLE IF EXISTS community_flairs CASCADE;
DROP TABLE IF EXISTS community_rules CASCADE;
DROP TABLE IF  EXISTS community_user_activity CASCADE;

-- REMOVE COLUMNS (careful with this!)
ALTER TABLE posts DROP COLUMN IF EXISTS is_pinned;
ALTER TABLE posts DROP COLUMN IF EXISTS pinned_at;
ALTER TABLE posts DROP COLUMN IF EXISTS pinned_by;
ALTER TABLE communities DROP COLUMN IF EXISTS settings;
```

## Troubleshooting

### Error: "function uuid_generate_v4() does not exist"
**Solution**: Enable the UUID extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied for schema public"
**Solution**: Connect as superuser or database owner, or use Supabase service role key.

### Error: "relation already exists"
**Solution**: The migration was partially applied. Either:
1. Drop existing tables and re-run
2. Comment out the already-created parts and run the rest

## Testing

After migration, test in the following order:

1. **Create a test community** (as a regular user)
2. **Verify you're the owner** (check `community_members` table)
3. **Create some rules** (using CommunityRulesService)
4. **Create flair templates** (using CommunityFlairService)
5. **Pin a post** (using togglePinPost function)
6. **Check metrics** (using CommunityMetricsService)

## Next Steps

After successful migration:
1. Update frontend to use new services
2. Implement community settings UI
3. Add flair selection modal
4. Update CommunityPage to show pinned posts
5. Implement sorting with new algorithms
6. Add admin controls to UI

## Support

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify all prerequisite tables exist
3. Ensure RLS policies are correctly applied
4. Test with a fresh community first
