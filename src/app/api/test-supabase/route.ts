import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('libraries')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection test failed:', error)
      throw error
    }
    
    console.log('✅ Connection test successful')
    
    // Test actual data fetch
    const { data: libraries, error: fetchError } = await supabase
      .from('libraries')
      .select('*')
      .eq('status', 'active')
      .limit(5)
    
    if (fetchError) {
      console.log('❌ Data fetch failed:', fetchError)
      throw fetchError
    }
    
    console.log('✅ Data fetch successful, count:', libraries?.length || 0)
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      librariesCount: libraries?.length || 0,
      sampleData: libraries?.slice(0, 2) || [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.log('💥 Test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
