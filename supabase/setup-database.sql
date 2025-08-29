-- BookNook Database Setup Script
-- Run this in your Supabase SQL editor to fix the current issues

-- Step 1: Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Step 2: Drop existing libraries table if it exists
DROP TABLE IF EXISTS libraries CASCADE;

-- Step 3: Create the libraries table with the correct schema
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    coordinates POINT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create geospatial index
CREATE INDEX idx_libraries_coordinates ON libraries USING GIST (coordinates);

-- Step 5: Enable Row Level Security
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies to allow access
-- Allow public read access to all libraries
CREATE POLICY "Allow public read access to libraries" ON libraries
    FOR SELECT USING (true);

-- Allow authenticated users to insert libraries
CREATE POLICY "Allow authenticated users to insert libraries" ON libraries
    FOR INSERT WITH CHECK (true);

-- Allow users to update libraries (we'll restrict this later when we add creator_id)
CREATE POLICY "Allow users to update libraries" ON libraries
    FOR UPDATE USING (true);

-- Allow users to delete libraries (we'll restrict this later when we add creator_id)
CREATE POLICY "Allow users to delete libraries" ON libraries
    FOR DELETE USING (true);

-- Step 7: Insert sample Austin libraries
INSERT INTO libraries (name, description, coordinates, is_public) VALUES
('Zilker Park Little Library', 'A charming little library in the heart of Zilker Park', POINT(-97.7690, 30.2669), true),
('Barton Springs Community Library', 'Community library near the famous Barton Springs Pool', POINT(-97.7700, 30.2640), true),
('South Congress Book Exchange', 'Book exchange in the trendy South Congress district', POINT(-97.7460, 30.2500), true),
('East Austin Community Library', 'Community library serving East Austin neighborhoods', POINT(-97.7200, 30.2600), true),
('Hyde Park Tiny Library', 'Quaint library in the historic Hyde Park neighborhood', POINT(-97.7300, 30.3100), true);

-- Step 8: Verify the setup
SELECT 
    '🎉 Database setup complete!' as status,
    COUNT(*) as library_count,
    'libraries' as table_name
FROM libraries;

-- Step 9: Test a simple query
SELECT 
    id,
    name,
    ST_X(coordinates) as longitude,
    ST_Y(coordinates) as latitude,
    created_at
FROM libraries
ORDER BY created_at DESC;
