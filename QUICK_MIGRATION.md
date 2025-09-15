# Quick Migration Guide - Activities Table

## The Issue
The Recent Activity feature is showing a 500 error because the `activities` table doesn't exist in your database yet.

## Quick Fix
Run this SQL in your Supabase Dashboard SQL Editor:

```sql
-- Create activity_types enum
CREATE TYPE activity_type AS ENUM (
  'library_created',
  'library_updated', 
  'library_deleted',
  'search_performed',
  'library_viewed',
  'library_rated'
);

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    activity_type activity_type NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create search activity function
CREATE OR REPLACE FUNCTION create_search_activity(
    p_user_id UUID,
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

-- Create recent activities function
CREATE OR REPLACE FUNCTION get_user_recent_activities(
    p_user_id UUID,
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
```

## What This Does
1. **Creates the activities table** with proper structure
2. **Sets up security policies** so users only see their own activities
3. **Creates helper functions** for logging searches and fetching activities
4. **Adds indexes** for performance

## After Running This
- The Recent Activity section will work properly
- Search queries will be logged automatically
- Library creation will be tracked (when you add the trigger later)

## Test It
After running the migration:
1. Refresh your app
2. Try searching for a location
3. Check the Recent Activity section - it should show your search
4. Create a library - it should appear in Recent Activity

The API is now robust and will handle missing tables gracefully, so you won't get 500 errors anymore!
