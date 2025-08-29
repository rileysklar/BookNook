import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  console.log('🚀 GET request received')
  
  try {
    console.log('✅ Try block started')
    
    // Test basic connection first
    console.log('🔌 Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('libraries')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.log('❌ Basic connection test failed:', testError)
      throw testError
    }
    
    console.log('✅ Basic connection test passed')
    
    // Fetch libraries directly from the table
    console.log('📚 Fetching libraries from table...')
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Table fetch failed:', error)
      throw error
    }
    
    console.log('✅ Table fetch successful, data length:', data?.length || 0)
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

    // Insert into the libraries table using the existing client
    const { data, error } = await supabase
      .from('libraries')
      .insert({
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