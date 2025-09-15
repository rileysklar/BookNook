import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

// Update library
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const libraryId = (await params).id
    const body = await request.json()
    const { name, description, is_public } = body

    console.log('🔄 Updating library:', libraryId)
    console.log('📝 Update data:', { name, description, is_public })

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Library name is required' },
        { status: 400 }
      )
    }

    // Update the library
    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      is_public: is_public ?? true,
      updated_at: new Date().toISOString()
    }
    
    console.log('🗄️ Supabase update data:', updateData)
    console.log('🔍 Library ID to update:', libraryId)
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...')
    const supabase = createClient();
    const { data: testData, error: testError } = await supabase
      .from('libraries')
      .select('id')
      .eq('id', libraryId)
      .limit(1)
    
    if (testError) {
      console.error('❌ Connection test failed:', testError)
      return NextResponse.json(
        { error: `Connection test failed: ${testError.message}` },
        { status: 500 }
      )
    }
    
    if (!testData || testData.length === 0) {
      console.error('❌ Library not found:', libraryId)
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Library found, proceeding with update...')
    
    const { data, error } = await supabase
      .from('libraries')
      .update(updateData)
      .eq('id', libraryId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      return NextResponse.json(
        { error: `Failed to update library: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Library updated successfully:', data)

    // Log the library update activity
    try {
      const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          activity_type: 'library_updated',
          entity_type: 'library',
          entity_id: libraryId,
          title: `Updated library: ${data.name}`,
          description: data.description || 'No description provided',
          metadata: {
            library_name: data.name,
            library_id: libraryId,
            updated_fields: { name, description, is_public }
          }
        })
      });
      
      if (activityResponse.ok) {
        console.log('✅ Library update activity logged');
      } else {
        console.log('⚠️ Failed to log library update activity');
      }
    } catch (activityError) {
      console.log('⚠️ Error logging library update activity:', activityError);
    }

    return NextResponse.json({ library: data })
  } catch (error) {
    console.error('Error updating library:', error)
    return NextResponse.json(
      { error: 'Failed to update library' },
      { status: 500 }
    )
  }
}

// Delete library
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const libraryId = (await params).id

    // Delete the library (soft delete using status)
    console.log('🗑️ Soft deleting library:', libraryId)
    
    const supabase = createClient();
    const { error } = await supabase
      .from('libraries')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', libraryId)

    if (error) {
      console.error('❌ Failed to delete library:', error)
      return NextResponse.json(
        { error: 'Failed to delete library' },
        { status: 500 }
      )
    }
    
    console.log('✅ Library soft deleted successfully')

    // Log the library deletion activity
    try {
      const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          activity_type: 'library_deleted',
          entity_type: 'library',
          entity_id: libraryId,
          title: `Deleted library: ${libraryId}`,
          description: 'Library was soft deleted',
          metadata: {
            library_id: libraryId,
            deletion_type: 'soft_delete'
          }
        })
      });
      
      if (activityResponse.ok) {
        console.log('✅ Library deletion activity logged');
      } else {
        console.log('⚠️ Failed to log library deletion activity');
      }
    } catch (activityError) {
      console.log('⚠️ Error logging library deletion activity:', activityError);
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting library:', error)
    return NextResponse.json(
      { error: 'Failed to delete library' },
      { status: 500 }
    )
  }
}
