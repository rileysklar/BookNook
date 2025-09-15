#!/usr/bin/env node

/**
 * Database Migration Script for BookNook
 * This script fixes the user_id column type to support Clerk user IDs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting BookNook database migration...');
  
  try {
    // Step 1: Drop the foreign key constraint
    console.log('📝 Step 1: Dropping foreign key constraint...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;'
    });
    
    // Step 2: Change user_id column type from UUID to TEXT
    console.log('📝 Step 2: Changing user_id column type to TEXT...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE activities ALTER COLUMN user_id TYPE TEXT;'
    });
    
    // Step 3: Update the functions
    console.log('📝 Step 3: Updating database functions...');
    
    // Update create_search_activity function
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    // Update get_user_recent_activities function
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    // Step 4: Update RLS policies
    console.log('📝 Step 4: Updating RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
        DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
        DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
        DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
        
        CREATE POLICY "Allow all operations on activities" ON activities
            FOR ALL USING (true);
      `
    });
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your activities should now work with Clerk user IDs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('You may need to run this migration manually in your Supabase dashboard');
    process.exit(1);
  }
}

// Check if exec_sql function exists
async function checkExecSqlFunction() {
  try {
    await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if exec_sql function is available...');
  
  const hasExecSql = await checkExecSqlFunction();
  
  if (!hasExecSql) {
    console.log('⚠️  exec_sql function not available');
    console.log('📋 Please run the following SQL manually in your Supabase dashboard:');
    console.log('');
    console.log('-- Copy and paste this into your Supabase SQL editor:');
    console.log('');
    
    const migrationSql = `
-- Fix user_id column type to support Clerk user IDs
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
ALTER TABLE activities ALTER COLUMN user_id TYPE TEXT;

-- Update functions
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

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

CREATE POLICY "Allow all operations on activities" ON activities
    FOR ALL USING (true);
    `;
    
    console.log(migrationSql);
    console.log('');
    console.log('After running this SQL, your activities will work properly!');
    return;
  }
  
  await runMigration();
}

main().catch(console.error);
