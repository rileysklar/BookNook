import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting library:', error)
    return NextResponse.json(
      { error: 'Failed to delete library' },
      { status: 500 }
    )
  }
}
