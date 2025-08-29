import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabase = createClient(
  'https://sjespiofspkuhqvlpymy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Delete the library
    const { error } = await supabase
      .from('libraries')
      .delete()
      .eq('id', libraryId)

    if (error) {
      console.error('Failed to delete library:', error)
      return NextResponse.json(
        { error: 'Failed to delete library' },
        { status: 500 }
      )
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
