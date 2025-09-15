-- Add users table and creator_id to libraries
-- This migration adds user management and creator tracking

-- ============================================================================
-- STEP 1: CREATE USERS TABLE
-- ============================================================================

-- Create users table (extends Clerk user data)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: ADD CREATOR_ID TO LIBRARIES
-- ============================================================================

-- Add creator_id column to libraries table
ALTER TABLE libraries 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Index for library creator lookups
CREATE INDEX IF NOT EXISTS idx_libraries_creator ON libraries(creator_id);

-- ============================================================================
-- STEP 4: ROW LEVEL SECURITY FOR USERS
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles
CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 5: UPDATE EXISTING LIBRARIES
-- ============================================================================

-- Create a default user for existing libraries (if no users exist)
INSERT INTO users (id, username, display_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system',
    'System User',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Update existing libraries to have a creator_id
UPDATE libraries 
SET creator_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE creator_id IS NULL;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

-- Verify the setup
SELECT 
    '🎉 Users table created!' as status,
    COUNT(*) as user_count
FROM users

UNION ALL

SELECT 
    '📚 Libraries updated!' as status,
    COUNT(*) as library_count
FROM libraries
WHERE creator_id IS NOT NULL

UNION ALL

SELECT 
    '🔍 Indexes created!' as status,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN ('users', 'libraries')
AND indexname LIKE 'idx_%';

-- Test the join query that the API will use
SELECT 
    '✅ API Join Test' as test,
    l.name as library_name,
    u.username as creator_username,
    u.display_name as creator_display_name
FROM libraries l
LEFT JOIN users u ON l.creator_id = u.id
LIMIT 3;
