-- Test script to verify the migration worked
-- This will insert a test activity with a Clerk-style user ID

INSERT INTO activities (
    user_id,
    activity_type,
    entity_type,
    title,
    description,
    metadata
) VALUES (
    'user_test123',
    'search_performed',
    'search',
    'Test search activity',
    'This is a test to verify the migration worked',
    '{"test": true, "search_query": "test query"}'
);

-- Check if the insert worked
SELECT * FROM activities WHERE user_id = 'user_test123';
