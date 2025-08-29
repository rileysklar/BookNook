-- Simple BookNook schema with basic descriptions
-- Run this in your Supabase SQL editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop any existing tables (clean slate)
DROP TABLE IF EXISTS libraries CASCADE;

-- Create libraries table with required fields
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    coordinates POINT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for coordinates
CREATE INDEX idx_libraries_coordinates ON libraries USING GIST (coordinates);

-- Insert sample Austin libraries with very simple descriptions
-- Using placeholder creator_id for sample data
INSERT INTO libraries (creator_id, name, description, coordinates, is_public) VALUES
('00000000-0000-0000-0000-000000000001', 'Zilker Park Little Library', 'A charming little library in Zilker Park', POINT(-97.7690, 30.2669), true),
('00000000-0000-0000-0000-000000000001', 'Barton Springs Community Library', 'Community library near Barton Springs Pool', POINT(-97.7700, 30.2640), true),
('00000000-0000-0000-0000-000000000001', 'South Congress Book Exchange', 'Book exchange in South Congress district', POINT(-97.7460, 30.2500), true),
('00000000-0000-0000-0000-000000000001', 'East Austin Community Library', 'Community library serving East Austin neighborhoods', POINT(-97.7200, 30.2600), true),
('00000000-0000-0000-0000-000000000001', 'Hyde Park Tiny Library', 'Quaint library in Hyde Park neighborhood', POINT(-97.7300, 30.3100), true);

-- Success message
SELECT 'Enhanced schema created! 5 Austin libraries with creator_id and status ready for your map!' as message;
