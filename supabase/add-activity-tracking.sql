-- Add activity tracking table for recent activity and search history
-- This table will track user actions like library creation and search queries

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
    entity_id UUID, -- ID of the library, search query, etc.
    entity_type VARCHAR(50), -- 'library', 'search', etc.
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Additional data like coordinates, search terms, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_entity ON activities(entity_id, entity_type);

-- Row Level Security policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activities
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically create activity when library is created
CREATE OR REPLACE FUNCTION create_library_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activities (
        user_id,
        activity_type,
        entity_id,
        entity_type,
        title,
        description,
        metadata
    ) VALUES (
        NEW.creator_id,
        'library_created',
        NEW.id,
        'library',
        'Created library: ' || NEW.name,
        COALESCE(NEW.description, 'No description provided'),
        jsonb_build_object(
            'library_name', NEW.name,
            'coordinates', NEW.coordinates,
            'is_public', NEW.is_public
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for library creation
CREATE TRIGGER trigger_create_library_activity
    AFTER INSERT ON libraries
    FOR EACH ROW
    EXECUTE FUNCTION create_library_activity();

-- Create a function to create search activity
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

-- Create a function to get recent activities for a user
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
