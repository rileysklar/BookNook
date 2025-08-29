import { useState, useEffect, useCallback } from 'react'
import type { Library } from '@/types/database'

interface UseLibrariesOptions {
  coordinates?: [number, number]
  radius?: number
  autoFetch?: boolean
}

export function useLibraries(options: UseLibrariesOptions = {}) {
  const { coordinates, radius = 10, autoFetch = true } = options
  
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLibraries = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let url = '/api/libraries'
      
      if (coordinates) {
        const params = new URLSearchParams({
          lat: coordinates[1].toString(),
          lng: coordinates[0].toString(),
          radius: radius.toString()
        })
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch libraries: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLibraries(data.libraries || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching libraries:', err)
    } finally {
      setLoading(false)
    }
  }, [coordinates, radius])

  const createLibrary = useCallback(async (libraryData: {
    name: string;
    description?: string;
    coordinates: [number, number];
    is_public: boolean;
  }) => {
    try {
      const response = await fetch('/api/libraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(libraryData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create library: ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('📚 New library created:', data.library);
      console.log('📚 Current libraries before update:', libraries);
      
      // Add the new library to the current list
      setLibraries(prev => {
        const newLibraries = [data.library, ...prev];
        console.log('📚 Updated libraries list:', newLibraries);
        return newLibraries;
      })
      
      return data.library
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [libraries])

  const updateLibrary = useCallback(async (libraryId: string, updateData: Partial<Library>) => {
    try {
      const response = await fetch(`/api/libraries/${libraryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update library: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update the library in the current list
      setLibraries(prev => prev.map(lib => 
        lib.id === libraryId ? { ...lib, ...data.library } : lib
      ))
      
      return data.library
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteLibrary = useCallback(async (libraryId: string) => {
    try {
      const response = await fetch(`/api/libraries/${libraryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete library: ${response.statusText}`)
      }

      // Remove the library from the current list
      setLibraries(prev => prev.filter(lib => lib.id !== libraryId))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Auto-fetch libraries when coordinates change
  useEffect(() => {
    if (autoFetch) {
      fetchLibraries()
    }
  }, [fetchLibraries, autoFetch])

  return {
    libraries,
    loading,
    error,
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    refetch: fetchLibraries
  }
}
