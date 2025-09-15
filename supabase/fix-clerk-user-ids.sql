-- Fix user_id column type to support Clerk user IDs
-- Clerk user IDs are strings like "user_31tXFzVRU7DuHDgpGBtzEW2aP4x", not UUIDs

-- First, drop the foreign key constraint
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;

-- Change user_id column type from UUID to TEXT
ALTER TABLE activities ALTER COLUMN user_id TYPE TEXT;

-- Update the functions to handle TEXT user_id
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

-- Update the get_user_recent_activities function
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

-- Update RLS policies to work with TEXT user_id
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

-- Create new RLS policies that work with Clerk user IDs
-- Note: We'll need to handle authentication differently since Clerk doesn't integrate with Supabase auth
CREATE POLICY "Allow all operations on activities" ON activities
    FOR ALL USING (true);

-- Since we're using Clerk for auth, we'll handle user isolation in the API layer
-- rather than relying on Supabase RLS policies
