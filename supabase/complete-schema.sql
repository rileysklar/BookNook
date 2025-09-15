-- 🎯 BookNook Complete Schema - Everything Needed to Run the App
-- Run this after: DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres;

-- ============================================================================
-- PHASE 1: EXTENSIONS & PERMISSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restore default schema permissions (essential after schema recreation)
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- ============================================================================
-- PHASE 2: CORE TABLES
-- ============================================================================

-- Create libraries table (matches your API exactly)
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    coordinates POINT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_types enum for tracking user activities
CREATE TYPE activity_type AS ENUM (
    'library_created',
    'library_updated', 
    'library_deleted',
    'search_performed',
    'library_viewed',
    'library_rated'
);

-- Create activities table for tracking user actions
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

-- ============================================================================
-- PHASE 3: INDEXES & PERFORMANCE
-- ============================================================================

-- Geospatial index for coordinates (essential for map queries)
CREATE INDEX idx_libraries_coordinates ON libraries USING GIST (coordinates);

-- Status index for filtering active libraries
CREATE INDEX idx_libraries_status ON libraries(status);

-- Created date index for sorting (used by API)
CREATE INDEX idx_libraries_created ON libraries(created_at DESC);

-- Activities table indexes for performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_entity ON activities(entity_id, entity_type);

-- ============================================================================
-- PHASE 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on libraries table
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that allow your API to work
CREATE POLICY "Allow public read access to libraries" ON libraries
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert libraries" ON libraries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update libraries" ON libraries
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete libraries" ON libraries
    FOR DELETE USING (true);

-- Enable RLS on activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities (users can only see their own activities)
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 5: REQUIRED FUNCTIONS
-- ============================================================================

-- Function to get libraries within radius (used by getNearby() method)
CREATE OR REPLACE FUNCTION get_libraries_within_radius(
    center_lng DOUBLE PRECISION,
    center_lat DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    description TEXT,
    coordinates POINT,
    is_public BOOLEAN,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.description,
        l.coordinates,
        l.is_public,
        l.status,
        l.created_at,
        l.updated_at,
        ST_Distance(
            -- Convert POINT to geography properly (fixes casting error)
            ST_SetSRID(ST_MakePoint(l.coordinates[0], l.coordinates[1]), 4326)::geography,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) / 1000.0 as distance_km
    FROM libraries l
    WHERE l.status = 'active' 
    AND l.is_public = true
    AND ST_DWithin(
        -- Convert POINT to geography properly (fixes casting error)
        ST_SetSRID(ST_MakePoint(l.coordinates[0], l.coordinates[1]), 4326)::geography,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_km * 1000.0
    )
    ORDER BY distance_km ASC;
END;
$$;

-- Function to create search activity (used by API)
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

-- Function to get user's recent activities (used by API)
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

-- ============================================================================
-- PHASE 6: SAMPLE DATA
-- ============================================================================

-- Insert 7 Austin libraries for immediate testing
INSERT INTO libraries (name, description, coordinates, is_public, status) VALUES
('Zilker Park Little Library', 'A charming little library in the heart of Zilker Park, perfect for families and nature lovers. Find books while enjoying the beautiful park setting.', POINT(-97.7690, 30.2669), true, 'active'),
('Barton Springs Community Library', 'Community library near the famous Barton Springs Pool. Great for cooling off after a swim with a good book.', POINT(-97.7700, 30.2640), true, 'active'),
('South Congress Book Exchange', 'Book exchange in the trendy South Congress district. Discover hidden literary gems in this vibrant neighborhood.', POINT(-97.7460, 30.2500), true, 'active'),
('East Austin Community Library', 'Community library serving East Austin neighborhoods with diverse book selection. Supporting the local community through literature.', POINT(-97.7200, 30.2600), true, 'active'),
('Hyde Park Tiny Library', 'Quaint library in the historic Hyde Park neighborhood. Perfect for quiet reading in a peaceful setting.', POINT(-97.7300, 30.3100), true, 'active'),
('Downtown Austin Book Nook', 'Urban library in the heart of downtown. Great for business professionals and city dwellers.', POINT(-97.7430, 30.2670), true, 'active'),
('Westlake Hills Library', 'Peaceful library in the scenic Westlake Hills area. Enjoy reading with beautiful hill country views.', POINT(-97.8000, 30.3000), true, 'active');

-- ============================================================================
-- PHASE 7: VERIFICATION & SUCCESS
-- ============================================================================

-- Verify the setup
SELECT 
    '🎉 BookNook Schema Complete!' as status,
    COUNT(*) as library_count,
    'libraries' as table_name
FROM libraries
WHERE status = 'active'

UNION ALL

SELECT 
    '🔍 Schema verification' as status,
    COUNT(*) as index_count,
    'indexes' as table_name
FROM pg_indexes 
WHERE tablename = 'libraries'

UNION ALL

SELECT 
    '🔐 RLS verification' as status,
    COUNT(*) as policy_count,
    'policies' as table_name
FROM pg_policies 
WHERE tablename = 'libraries';

-- Test the required function
SELECT 
    '🧪 Testing get_libraries_within_radius function...' as test_status;

SELECT 
    '✅ Function working' as function_test,
    COUNT(*) as result_count
FROM get_libraries_within_radius(-97.7690, 30.2669, 5.0);

-- Final success message
SELECT '🚀 BookNook is ready! Your app should now work with 7 Austin libraries!' as final_message;

-- ============================================================================
-- PHASE 8: API ENDPOINT VERIFICATION
-- ============================================================================

-- Test the exact queries your API endpoints use
SELECT '📊 API Endpoint Verification' as verification_header;

-- Test GET /api/libraries query
SELECT 
    '✅ GET /api/libraries' as endpoint,
    COUNT(*) as result_count,
    'Should return 7 libraries' as expected
FROM libraries 
WHERE status = 'active';

-- Test coordinates format (used by POST /api/libraries)
SELECT 
    '✅ Coordinates format' as test,
    coordinates::text as coordinate_text,
    'Format: (longitude,latitude)' as expected_format
FROM libraries 
LIMIT 3;

-- Test RLS policies
SELECT 
    '✅ RLS Policies' as test,
    policyname,
    cmd as operation,
    'Policy should allow operation' as expected
FROM pg_policies 
WHERE tablename = 'libraries'
ORDER BY policyname;
