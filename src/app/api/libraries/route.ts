import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  console.log('🚀 GET request received')
  
  try {
    // Fetch libraries (basic query for now)
    console.log('📚 Fetching libraries from Supabase...')
    const supabase = createClient();
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    // Transform coordinates from string format to array format for frontend consistency
    const transformedLibraries = data?.map(library => ({
      ...library,
      coordinates: library.coordinates ? 
        (library.coordinates.startsWith('(') && library.coordinates.endsWith(')') ?
          library.coordinates.slice(1, -1).split(',').map(Number) :
          library.coordinates
        ) : 
        library.coordinates,
      // Only add default creator_id if it doesn't already exist
      creator_id: library.creator_id || '00000000-0000-0000-0000-000000000000'
    })) || []
    
    return NextResponse.json({ libraries: transformedLibraries })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch libraries', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST request received')
  
  try {
    // Check authentication
    const { userId } = await auth()
    console.log('🔑 User ID:', userId)
    
    if (!userId) {
      console.log('❌ No user ID found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 Request body:', body)
    const { name, coordinates, description, is_public } = body

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      console.log('❌ Missing required fields:', { name, coordinates })
      return NextResponse.json(
        { error: 'Missing required fields: name and coordinates [lng, lat]' },
        { status: 400 }
      )
    }

    const [lng, lat] = coordinates
    console.log('📍 Coordinates:', { lng, lat })

    // Insert into the libraries table (without creator_id until migration is run)
    console.log('📝 Inserting new library into Supabase...')
    const supabase = createClient();
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
      console.error('❌ Supabase insert error:', error)
      throw error
    }

    console.log('✅ Library created successfully:', data)

    // Log the library creation activity
    try {
      const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          activity_type: 'library_created',
          entity_type: 'library',
          entity_id: data.id,
          title: `Created library: ${data.name}`,
          description: data.description || 'No description provided',
          metadata: {
            library_name: data.name,
            library_id: data.id,
            coordinates: coordinates,
            is_public: is_public
          }
        })
      });
      
      if (activityResponse.ok) {
        console.log('✅ Library creation activity logged');
      } else {
        console.log('⚠️ Failed to log library creation activity');
      }
    } catch (activityError) {
      console.log('⚠️ Error logging library creation activity:', activityError);
    }

    // Transform the response to match frontend expectations
    const transformedLibrary = {
      ...data,
      coordinates: coordinates, // Return the original array format
      creator_id: userId // Add creator_id for frontend use
    }

    return NextResponse.json({ library: transformedLibrary }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating library:', error)
    return NextResponse.json(
      { error: 'Failed to create library' },
      { status: 500 }
    )
  }
}