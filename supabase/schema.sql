-- Ultra-simple BookNook schema - just coordinates to get started
-- Run this in your Supabase SQL editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop any existing tables (clean slate)
DROP TABLE IF EXISTS libraries CASCADE;

-- Create libraries table with required fields
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    coordinates POINT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for coordinates
CREATE INDEX idx_libraries_coordinates ON libraries USING GIST (coordinates);

-- Insert sample Austin libraries
INSERT INTO libraries (name, description, coordinates, is_public) VALUES
('Zilker Park Little Library', 'A charming little library in the heart of Zilker Park', POINT(-97.7690, 30.2669), true),
('Barton Springs Community Library', 'Community library near the famous Barton Springs Pool', POINT(-97.7700, 30.2640), true),
('South Congress Book Exchange', 'Book exchange in the trendy South Congress district', POINT(-97.7460, 30.2500), true),
('East Austin Community Library', 'Community library serving East Austin neighborhoods', POINT(-97.7200, 30.2600), true),
('Hyde Park Tiny Library', 'Quaint library in the historic Hyde Park neighborhood', POINT(-97.7300, 30.3100), true);

-- Success message
SELECT '🎉 Enhanced schema created! 5 Austin libraries with descriptions, addresses, and coordinates ready for your map!' as message;