'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Library } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

interface LibraryContextType {
  libraries: Library[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  fetchLibraries: (isRetry?: boolean) => Promise<void>;
  createLibrary: (libraryData: {
    name: string;
    description?: string;
    coordinates: [number, number];
    is_public: boolean;
  }) => Promise<Library>;
  updateLibrary: (libraryId: string, updateData: Partial<Library>) => Promise<Library>;
  deleteLibrary: (libraryId: string) => Promise<boolean>;
  refreshLibraries: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

interface LibraryProviderProps {
  children: React.ReactNode;
  coordinates?: [number, number];
  radius?: number;
  autoFetch?: boolean;
}

export function LibraryProvider({ 
  children, 
  coordinates, 
  radius = 10, 
  autoFetch = true 
}: LibraryProviderProps) {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const { isSignedIn } = useAuth();
  const { getToken } = useClerkAuth();
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchLibraries = useCallback(async (isRetry = false) => {
    // Prevent multiple simultaneous requests
    if (loading && !isRetry) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/libraries';
      const params = new URLSearchParams();
      
      if (coordinates) {
        params.append('lng', coordinates[0].toString());
        params.append('lat', coordinates[1].toString());
        params.append('radius', radius.toString());
        url += `?${params.toString()}`;
      }
      
      console.log('🔍 Fetching libraries from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = response.statusText || `HTTP ${response.status}`;
        throw new Error(`Failed to fetch libraries: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Libraries fetched successfully:', data.libraries?.length || 0);
      
      setLibraries(data.libraries || []);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching libraries:', err);
      
      // Only retry if we haven't exceeded max retries and this isn't a retry
      if (retryCount < maxRetries && !isRetry) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, nextRetryCount - 1) * 1000;
        
        console.log(`🔄 Retrying in ${delay}ms (attempt ${nextRetryCount}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchLibraries(true);
        }, delay);
      } else if (retryCount >= maxRetries) {
        console.log('🚫 Max retries exceeded, stopping attempts');
        setError('Failed to fetch libraries after multiple attempts. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [coordinates, radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Prevent multiple fetches
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    console.log('🔄 LibraryProvider useEffect running, autoFetch:', autoFetch, 'coordinates:', coordinates);
    
    if (autoFetch) {
      fetchLibraries();
    }
  }, [autoFetch, coordinates, fetchLibraries]); // Allow refetching when coordinates change

  const createLibrary = useCallback(async (libraryData: {
    name: string;
    description?: string;
    coordinates: [number, number];
    is_public: boolean;
  }) => {
    try {
      // Get the auth token from Clerk
      const token = await getToken();
      console.log('🔑 Auth token obtained:', token ? 'Yes' : 'No');
      
      const response = await fetch('/api/libraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(libraryData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`Failed to create library: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📚 New library created:', data.library);
      console.log('📚 Current libraries before update:', libraries);
      
      // Add the new library to the current list
      setLibraries(prev => {
        const newLibraries = [data.library, ...prev];
        console.log('📚 Updated libraries list:', newLibraries);
        console.log('📚 Context state updated - libraries count:', newLibraries.length);
        return newLibraries;
      });
      
      return data.library;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [getToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateLibrary = useCallback(async (libraryId: string, updateData: Partial<Library>) => {
    try {
      // Get the auth token from Clerk
      const token = await getToken();
      
      const response = await fetch(`/api/libraries/${libraryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update library: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the library in the current list
      setLibraries(prev => prev.map(lib => 
        lib.id === libraryId ? { ...lib, ...data.library } : lib
      ));
      
      return data.library;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [getToken]);

  const deleteLibrary = useCallback(async (libraryId: string) => {
    try {
      // Get the auth token from Clerk
      const token = await getToken();
      
      const response = await fetch(`/api/libraries/${libraryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete library: ${response.statusText}`);
      }

      // Remove the library from the current list
      setLibraries(prev => prev.filter(lib => lib.id !== libraryId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [getToken]);

  const refreshLibraries = useCallback(() => {
    setRetryCount(0); // Reset retry count
    fetchLibraries();
  }, [fetchLibraries]);

  const value: LibraryContextType = {
    libraries,
    loading,
    error,
    retryCount,
    maxRetries,
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    refreshLibraries,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibraryContext() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibraryContext must be used within a LibraryProvider');
  }
  return context;
}
