-- Ultra-simple BookNook functions - just CRUD for name + coordinates
-- Run this after creating the simple schema

-- Function to get all libraries
CREATE OR REPLACE FUNCTION get_all_libraries()
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    coordinates POINT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.coordinates,
        l.created_at
    FROM libraries l
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
    coordinates POINT,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.coordinates,
        ST_Distance(
            l.coordinates::geography,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) / 1000.0 as distance_km
    FROM libraries l
    WHERE ST_DWithin(
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
    library_lng DOUBLE PRECISION,
    library_lat DOUBLE PRECISION
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_library_id UUID;
BEGIN
    INSERT INTO libraries (name, coordinates)
    VALUES (library_name, ST_SetSRID(ST_MakePoint(library_lng, library_lat), 4326))
    RETURNING id INTO new_library_id;
    
    RETURN new_library_id;
END;
$$;

-- Function to update a library
CREATE OR REPLACE FUNCTION update_library(
    library_id UUID,
    new_name VARCHAR(200),
    new_lng DOUBLE PRECISION,
    new_lat DOUBLE PRECISION
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE libraries 
    SET 
        name = new_name,
        coordinates = ST_SetSRID(ST_MakePoint(new_lng, new_lat), 4326)
    WHERE id = library_id;
    
    RETURN FOUND;
END;
$$;

-- Function to delete a library
CREATE OR REPLACE FUNCTION delete_library(library_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM libraries WHERE id = library_id;
    RETURN FOUND;
END;
$$;

-- Success message
SELECT '🎉 Simple CRUD functions created! Ready for basic library operations.' as message;