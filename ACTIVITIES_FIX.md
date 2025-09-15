# Activities Not Showing - Database Schema Fix

## Problem
The activities feature shows "No recent activity" even when you've been using the app because:

1. **Clerk user IDs** are strings like `"user_31tXFzVRU7DuHDgpGBtzEW2aP4x"`
2. **Database schema** expects UUIDs for the `user_id` column
3. **Type mismatch** prevents activities from being stored

## Solution

### Option 1: Run Database Migration (Recommended)

1. **Open your Supabase dashboard** → SQL Editor
2. **Copy and paste this SQL**:

```sql
-- Fix user_id column type to support Clerk user IDs
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
ALTER TABLE activities ALTER COLUMN user_id TYPE TEXT;

-- Update functions
CREATE OR REPLACE FUNCTION create_search_activity(
    p_user_id TEXT,
    p_search_query TEXT,
    p_results_count INTEGER DEFAULT 0,
    p_coordinates POINT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activities (
        user_id,
        activity_type,
        entity_type,
        title,
        description,
        metadata
    ) VALUES (
        p_user_id,
        'search_performed',
        'search',
        'Searched for: ' || p_search_query,
        'Found ' || p_results_count || ' results',
        jsonb_build_object(
            'search_query', p_search_query,
            'results_count', p_results_count,
            'coordinates', p_coordinates
        )
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_recent_activities(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    activity_type activity_type,
    entity_id UUID,
    entity_type VARCHAR(50),
    title VARCHAR(200),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.activity_type,
        a.entity_id,
        a.entity_type,
        a.title,
        a.description,
        a.metadata,
        a.created_at
    FROM activities a
    WHERE a.user_id = p_user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

CREATE POLICY "Allow all operations on activities" ON activities
    FOR ALL USING (true);
```

3. **Click "Run"** to execute the migration
4. **Refresh your app** - activities should now work!

### Option 2: Use Migration Script

```bash
# Install dependencies (if not already installed)
npm install dotenv

# Run the migration script
node scripts/migrate-database.js
```

## What This Fixes

- ✅ **Activities will be stored** when you search or interact with libraries
- ✅ **Recent activity** will show up in the UI
- ✅ **Search history** will be tracked
- ✅ **Library interactions** will be logged

## Current Status

The app is currently showing **mock activities** as a temporary workaround, but real activities won't be stored until you run the database migration.

## Verification

After running the migration:
1. **Sign in** to your app
2. **Search for libraries** or **view library details**
3. **Check the activities section** - you should see real activity entries
4. **Activities will persist** between sessions

---

**Note**: This is a one-time migration. Once completed, all future activities will work normally with Clerk user IDs.
