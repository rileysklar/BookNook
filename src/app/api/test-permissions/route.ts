import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🔐 Testing Supabase permissions...')
    
    // Test 1: Basic schema access
    console.log('🧪 Test 1: Checking schema access...')
    const { data: schemaTest, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)
    
    if (schemaError) {
      console.log('❌ Schema access failed:', schemaError)
    } else {
      console.log('✅ Schema access working, tables found:', schemaTest?.length || 0)
    }
    
    // Test 2: Check if libraries table exists
    console.log('🧪 Test 2: Checking libraries table...')
    const { data: tableTest, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'libraries')
    
    if (tableError) {
      console.log('❌ Table check failed:', tableError)
    } else {
      console.log('✅ Table check working, libraries table exists:', tableTest?.length > 0)
    }
    
    // Test 3: Try to access libraries table directly
    console.log('🧪 Test 3: Trying to access libraries table...')
    const { data: libraries, error: libError } = await supabase
      .from('libraries')
      .select('count')
      .limit(1)
    
    if (libError) {
      console.log('❌ Libraries table access failed:', libError)
      return NextResponse.json({
        success: false,
        error: 'Permission denied for libraries table',
        details: libError,
        schemaAccess: schemaTest?.length || 0,
        tableExists: tableTest?.length > 0,
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }
    
    console.log('✅ Libraries table access working!')
    
    return NextResponse.json({
      success: true,
      permissions: 'OK',
      schemaAccess: schemaTest?.length || 0,
      tableExists: tableTest?.length > 0,
      librariesAccess: 'OK',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.log('💥 Permission test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
