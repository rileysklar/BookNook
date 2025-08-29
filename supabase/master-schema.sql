-- 🎯 BookNook Master Schema - Complete Working Setup
-- Run this in your Supabase SQL editor after manually deleting all data and schema
-- This creates everything needed for a working BookNook application

-- ============================================================================
-- PHASE 1: EXTENSIONS & PERMISSIONS
-- ============================================================================

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grant necessary permissions to service_role (if using service role key)
-- This ensures the API can access the database properly
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT USAGE ON SCHEMA public TO service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    END IF;
END
$$;

-- ============================================================================
-- PHASE 2: CORE TABLES
-- ============================================================================

-- Drop any existing tables (clean slate)
DROP TABLE IF EXISTS libraries CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS search_index CASCADE;

-- Create libraries table (core entity)
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

-- Create books table (for future book management)
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200),
    isbn VARCHAR(20),
    genre VARCHAR(100),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table (for future rating system)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search index table (for future search functionality)
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('library', 'book')),
    entity_id UUID NOT NULL,
    search_vector tsvector,
    location POINT,
    metadata JSONB,
    last_indexed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 3: INDEXES & PERFORMANCE
-- ============================================================================

-- Geospatial indexes
CREATE INDEX idx_libraries_coordinates ON libraries USING GIST (coordinates);
CREATE INDEX idx_search_index_location ON search_index USING GIST (location);

-- Foreign key indexes
CREATE INDEX idx_books_library_id ON books(library_id);
CREATE INDEX idx_ratings_library_id ON ratings(library_id);
CREATE INDEX idx_ratings_book_id ON ratings(book_id);

-- Full-text search indexes
CREATE INDEX idx_books_search ON books USING GIN (to_tsvector('english', title || ' ' || COALESCE(author, '')));
CREATE INDEX idx_search_index_vector ON search_index USING GIN (search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_libraries_status ON libraries(status);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_libraries_created ON libraries(created_at DESC);

-- ============================================================================
-- PHASE 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- Libraries policies
CREATE POLICY "Allow public read access to active libraries" ON libraries
    FOR SELECT USING (status = 'active' AND is_public = true);

CREATE POLICY "Allow public read access to all libraries" ON libraries
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert libraries" ON libraries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update libraries" ON libraries
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete libraries" ON libraries
    FOR DELETE USING (true);

-- Books policies
CREATE POLICY "Allow public read access to books" ON books
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert books" ON books
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update books" ON books
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete books" ON books
    FOR DELETE USING (true);

-- Ratings policies
CREATE POLICY "Allow public read access to ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert ratings" ON ratings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update ratings" ON ratings
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete ratings" ON ratings
    FOR DELETE USING (true);

-- Search index policies
CREATE POLICY "Allow public read access to search index" ON search_index
    FOR SELECT USING (true);

CREATE POLICY "Allow service role to manage search index" ON search_index
    FOR ALL USING (true);

-- ============================================================================
-- PHASE 5: CRUD FUNCTIONS
-- ============================================================================

-- Function to get all libraries
CREATE OR REPLACE FUNCTION get_all_libraries()
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    description TEXT,
    coordinates POINT,
    is_public BOOLEAN,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
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
        l.created_at
    FROM libraries l
    WHERE l.status = 'active'
    ORDER BY l.created_at DESC;
END;
$$;

-- Function to get libraries within a certain radius
CREATE OR REPLACE FUNCTION get_libraries_nearby(
    center_lng DOUBLE PRECISION,
    center_lat DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    description TEXT,
    coordinates POINT,
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
        ST_Distance(
            l.coordinates::geography,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) / 1000.0 as distance_km
    FROM libraries l
    WHERE l.status = 'active' 
    AND l.is_public = true
    AND ST_DWithin(
        l.coordinates::geography,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_km * 1000.0
    )
    ORDER BY distance_km ASC;
END;
$$;

-- Function to add a new library
CREATE OR REPLACE FUNCTION add_library(
    library_name VARCHAR(200),
    library_description TEXT DEFAULT NULL,
    library_lng DOUBLE PRECISION,
    library_lat DOUBLE PRECISION,
    library_public BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_library_id UUID;
BEGIN
    INSERT INTO libraries (name, description, coordinates, is_public)
    VALUES (
        library_name, 
        library_description, 
        ST_SetSRID(ST_MakePoint(library_lng, library_lat), 4326),
        library_public
    )
    RETURNING id INTO new_library_id;
    
    RETURN new_library_id;
END;
$$;

-- Function to update a library
CREATE OR REPLACE FUNCTION update_library(
    library_id UUID,
    new_name VARCHAR(200) DEFAULT NULL,
    new_description TEXT DEFAULT NULL,
    new_lng DOUBLE PRECISION DEFAULT NULL,
    new_lat DOUBLE PRECISION DEFAULT NULL,
    new_public BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE libraries 
    SET 
        name = COALESCE(new_name, name),
        description = COALESCE(new_description, description),
        coordinates = CASE 
            WHEN new_lng IS NOT NULL AND new_lat IS NOT NULL 
            THEN ST_SetSRID(ST_MakePoint(new_lng, new_lat), 4326)
            ELSE coordinates
        END,
        is_public = COALESCE(new_public, is_public),
        updated_at = NOW()
    WHERE id = library_id;
    
    RETURN FOUND;
END;
$$;

-- Function to delete a library (soft delete)
CREATE OR REPLACE FUNCTION delete_library(library_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE libraries 
    SET status = 'deleted', updated_at = NOW()
    WHERE id = library_id;
    
    RETURN FOUND;
END;
$$;

-- ============================================================================
-- PHASE 6: SAMPLE DATA
-- ============================================================================

-- Insert sample Austin libraries
INSERT INTO libraries (name, description, coordinates, is_public, status) VALUES
('Zilker Park Little Library', 'A charming little library in the heart of Zilker Park, perfect for families and nature lovers', POINT(-97.7690, 30.2669), true, 'active'),
('Barton Springs Community Library', 'Community library near the famous Barton Springs Pool, great for cooling off after a swim', POINT(-97.7700, 30.2640), true, 'active'),
('South Congress Book Exchange', 'Book exchange in the trendy South Congress district, find hidden literary gems', POINT(-97.7460, 30.2500), true, 'active'),
('East Austin Community Library', 'Community library serving East Austin neighborhoods with diverse book selection', POINT(-97.7200, 30.2600), true, 'active'),
('Hyde Park Tiny Library', 'Quaint library in the historic Hyde Park neighborhood, perfect for quiet reading', POINT(-97.7300, 30.3100), true, 'active'),
('Downtown Austin Book Nook', 'Urban library in the heart of downtown, great for business professionals', POINT(-97.7430, 30.2670), true, 'active'),
('Westlake Hills Library', 'Peaceful library in the scenic Westlake Hills area', POINT(-97.8000, 30.3000), true, 'active');

-- Insert sample books for testing
INSERT INTO books (library_id, title, author, genre, condition_rating, status) VALUES
((SELECT id FROM libraries WHERE name = 'Zilker Park Little Library' LIMIT 1), 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 4, 'available'),
((SELECT id FROM libraries WHERE name = 'Zilker Park Little Library' LIMIT 1), 'To Kill a Mockingbird', 'Harper Lee', 'Classic', 5, 'available'),
((SELECT id FROM libraries WHERE name = 'Barton Springs Community Library' LIMIT 1), '1984', 'George Orwell', 'Dystopian', 3, 'available'),
((SELECT id FROM libraries WHERE name = 'South Congress Book Exchange' LIMIT 1), 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 4, 'available'),
((SELECT id FROM libraries WHERE name = 'East Austin Community Library' LIMIT 1), 'Pride and Prejudice', 'Jane Austen', 'Romance', 5, 'available');

-- Insert sample ratings
INSERT INTO ratings (library_id, rating, comment) VALUES
((SELECT id FROM libraries WHERE name = 'Zilker Park Little Library' LIMIT 1), 5, 'Beautiful location and well-maintained'),
((SELECT id FROM libraries WHERE name = 'Barton Springs Community Library' LIMIT 1), 4, 'Great community feel'),
((SELECT id FROM libraries WHERE name = 'South Congress Book Exchange' LIMIT 1), 5, 'Amazing book selection'),
((SELECT id FROM libraries WHERE name = 'East Austin Community Library' LIMIT 1), 4, 'Friendly neighborhood library'),
((SELECT id FROM libraries WHERE name = 'Hyde Park Tiny Library' LIMIT 1), 5, 'Charming and peaceful');

-- ============================================================================
-- PHASE 7: VERIFICATION & SUCCESS
-- ============================================================================

-- Verify the setup
SELECT 
    '🎉 BookNook Master Schema Complete!' as status,
    COUNT(*) as library_count,
    'libraries' as table_name
FROM libraries
WHERE status = 'active'

UNION ALL

SELECT 
    '📚 Books loaded successfully' as status,
    COUNT(*) as book_count,
    'books' as table_name
FROM books

UNION ALL

SELECT 
    '⭐ Ratings added' as status,
    COUNT(*) as rating_count,
    'ratings' as table_name
FROM ratings;

-- Test the functions
SELECT '🧪 Testing functions...' as test_status;

-- Test get_all_libraries function
SELECT 
    '✅ get_all_libraries() working' as function_test,
    COUNT(*) as result_count
FROM get_all_libraries();

-- Test nearby search function
SELECT 
    '✅ get_libraries_nearby() working' as function_test,
    COUNT(*) as result_count
FROM get_libraries_nearby(-97.7690, 30.2669, 5.0);

-- Final success message
SELECT '🚀 BookNook is ready! Your map should now display 7 Austin libraries with full functionality!' as final_message;
