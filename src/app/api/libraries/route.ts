import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  console.log('🚀 GET request received')
  
  try {
    console.log('✅ Try block started')
    
    // Check environment variables
    const supabaseUrl = 'https://sjespiofspkuhqvlpymy.supabase.co'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔑 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyLength: serviceRoleKey?.length || 0
    })
    
    if (!serviceRoleKey) {
      console.log('❌ Service role key missing')
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
    }
    
    console.log('✅ Service role key found')
    
    // Create client
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    console.log('✅ Supabase client created')
    
    // Test basic connection first
    console.log('🔌 Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('libraries')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Basic connection test failed:', testError)
      throw testError
    }
    
    console.log('✅ Basic connection test passed')
    
    // Now try the function
    console.log('📞 Calling get_all_libraries function...')
    const { data, error } = await supabase
      .rpc('get_all_libraries')
    
    if (error) {
      console.log('❌ Function call failed:', error)
      throw error
    }
    
    console.log('✅ Function call successful, data length:', data?.length || 0)
    return NextResponse.json({ libraries: data })
    
  } catch (error) {
    console.log('💥 CATCH BLOCK - Error occurred')
    console.log('Error type:', typeof error)
    console.log('Error message:', error instanceof Error ? error.message : error)
    console.log('Full error object:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch libraries', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, coordinates, description, is_public } = body

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        { error: 'Missing required fields: name and coordinates [lng, lat]' },
        { status: 400 }
      )
    }

    const [lng, lat] = coordinates

    // Create client for POST request
    const supabaseUrl = 'https://sjespiofspkuhqvlpymy.supabase.co'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Insert directly into the libraries table instead of using the RPC function
    const { data, error } = await supabase
      .from('libraries')
      .insert({
        creator_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        coordinates: `(${lng},${lat})`,
        is_public: is_public ?? true
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json({ library: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating library:', error)
    return NextResponse.json(
      { error: 'Failed to create library' },
      { status: 500 }
    )
  }
}