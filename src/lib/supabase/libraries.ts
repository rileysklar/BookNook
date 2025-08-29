import { supabase } from './client'
import type { Library, InsertTables } from '@/types/database'

export const librariesApi = {
  // Get all public libraries
  async getAll(): Promise<Library[]> {
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching libraries:', error)
      throw error
    }

    return data || []
  },

  // Get libraries within a certain radius of coordinates
  async getNearby(
    coordinates: [number, number], // [longitude, latitude]
    radiusKm: number = 10
  ): Promise<Library[]> {
    const { data, error } = await supabase
      .rpc('get_libraries_within_radius', {
        center_lng: coordinates[0],
        center_lat: coordinates[1],
        radius_km: radiusKm
      })

    if (error) {
      console.error('Error fetching nearby libraries:', error)
      throw error
    }

    return data || []
  },

  // Get library by ID
  async getById(id: string): Promise<Library | null> {
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching library:', error)
      throw error
    }

    return data
  },

  // Create new library
  async create(library: InsertTables['libraries']): Promise<Library> {
    const { data, error } = await supabase
      .from('libraries')
      .insert(library)
      .select()
      .single()

    if (error) {
      console.error('Error creating library:', error)
      throw error
    }

    return data
  },

  // Update library
  async update(id: string, updates: Partial<Library>): Promise<Library> {
    const { data, error } = await supabase
      .from('libraries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating library:', error)
      throw error
    }

    return data
  },

  // Delete library (soft delete by setting status to inactive)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('libraries')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) {
      console.error('Error deleting library:', error)
      throw error
    }
  }
}
