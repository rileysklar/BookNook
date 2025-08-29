'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import Image from 'next/image';
import { initializeMap, setupMapControls, cleanupMap } from '@/lib/mapbox/mapbox-client';
import { useLibraries } from '@/hooks/useLibraries';
import { LibraryMarker } from './LibraryMarker';
import { BottomSheet } from './BottomSheet';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { Plus, User } from 'lucide-react';
import type { Library } from '@/types/database';
import '@/lib/mapbox/mapbox.css';

interface MapProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  onLocationUpdate?: (coordinates: [number, number]) => void;
  onLibrarySelect?: (library: Library) => void;
  showCrosshairs?: boolean;
  onCrosshairsClick?: (coordinates: [number, number]) => void;
}

const Map = memo(function Map({ onMapReady, onLocationUpdate, onLibrarySelect, showCrosshairs, onCrosshairsClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Prevent excessive re-renders
  const hasInitialized = useRef(false);
  const mapReadyCalled = useRef(false);
  
  // Memoize the component to prevent unnecessary re-renders
  const memoizedOnMapReady = useRef(onMapReady);
  const memoizedOnLocationUpdate = useRef(onLocationUpdate);

  // Fetch libraries based on user location
  const { libraries, loading: librariesLoading, error: librariesError } = useLibraries({
    coordinates: userLocation || undefined,
    radius: 10,
    autoFetch: true  // ✅ Always fetch libraries
  });

  // Debug: Log when libraries change
  const prevLibrariesRef = useRef(libraries);
  useEffect(() => {
    // Only log if libraries actually changed
    if (prevLibrariesRef.current !== libraries) {
      console.log('🔍 Libraries changed:', {
        count: libraries.length,
        firstLibrary: libraries[0]?.name,
        timestamp: new Date().toISOString(),
        prevCount: prevLibrariesRef.current?.length || 0
      });
      prevLibrariesRef.current = libraries;
    }
  }, [libraries]);

  // State to track Mapbox markers
  const [mapMarkers, setMapMarkers] = useState<mapboxgl.Marker[]>([]);

  // Get authentication state
  const { isSignedIn, isLoaded: authLoaded, imageUrl } = useAuth();

  const handleLibraryClick = useCallback((library: Library) => {
    setSelectedLibrary(prev => prev?.id === library.id ? null : library);
    onLibrarySelect?.(library);
  }, [onLibrarySelect]);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (authLoaded && isSignedIn) {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // If crosshairs are shown, call the crosshairs click handler
      if (showCrosshairs && onCrosshairsClick) {
        onCrosshairsClick(coordinates);
        return;
      }
      
      // Otherwise, use the global BottomSheet methods for regular map clicks
      if ((window as any).LibraryBottomSheet) {
        (window as any).LibraryBottomSheet.openAddLibrary(coordinates);
      }
    }
  }, [authLoaded, isSignedIn, showCrosshairs, onCrosshairsClick]);

  // Helper function to parse coordinate strings from database
  const parseCoordinates = useCallback((coordString: string): [number, number] => {
    // Remove parentheses and split by comma
    const clean = coordString.replace(/[()]/g, '');
    const [lng, lat] = clean.split(',').map(Number);
    return [lng, lat];
  }, []);

  useEffect(() => {
    console.log('🗺️ Map initialization useEffect running:', {
      hasContainer: !!mapContainer.current,
      hasMap: !!map.current,
      hasInitialized: hasInitialized.current
    });
    
    if (!mapContainer.current || map.current || hasInitialized.current) {
      console.log('🚫 Map initialization skipped');
      return;
    }

    // Store ref value in variable to avoid stale closure warning
    const containerElement = mapContainer.current;
    let mapInstance: mapboxgl.Map | null = null;

    // Define handler functions
    const handleLoad = () => {
      console.log('🗺️ Map load event triggered');
      
      // Always set map as loaded (this is the mapbox event, not our callback)
      setIsMapLoaded(true);
      console.log('✅ Map loaded state set to true');
      
      // Only call the callback once
      if (!mapReadyCalled.current) {
        memoizedOnMapReady.current?.(mapInstance!);
        mapReadyCalled.current = true;
        console.log('✅ Map ready callback called (first time only)');
      } else {
        console.log('🚫 Map ready callback already called, skipping');
      }
    };

    const handleGeolocate = (e: any) => {
      const { coords } = e;
      const coordinates: [number, number] = [coords.longitude, coords.latitude];
      
      setUserLocation(coordinates);
      
      // Fly to user location
      mapInstance!.flyTo({
        center: coordinates,
        zoom: 15,
        duration: 2000,
      });

      memoizedOnLocationUpdate.current?.(coordinates);
    };

    const handleError = (e: any) => {
      console.error('Mapbox error:', e);
    };

    try {
      // Initialize the map
      mapInstance = initializeMap(mapContainer.current);
      map.current = mapInstance;
      hasInitialized.current = true;

      // Setup controls
      setupMapControls(mapInstance);

      // Add event listeners
      mapInstance.on('load', handleLoad);
      mapInstance.on('geolocate', handleGeolocate);
      mapInstance.on('error', handleError);
      
      // Add click handler for adding libraries (only when authenticated)
      mapInstance.on('click', handleMapClick);

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance && containerElement) {
        try {
          // Remove all event listeners first
          mapInstance.off('load', handleLoad);
          mapInstance.off('geolocate', handleGeolocate);
          mapInstance.off('error', handleError);
          mapInstance.off('click', handleMapClick);
          
          // Remove the map
          mapInstance.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
        map.current = null;
        hasInitialized.current = false;
        setIsMapLoaded(false);
      }
    };
  }, [handleMapClick]); // Include handleMapClick dependency

  // Create and manage Mapbox markers when libraries change
  const markersCreatedRef = useRef(false);
  
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    // Prevent multiple marker creation
    if (markersCreatedRef.current) {
      console.log('🚫 Markers already created, skipping recreation');
      return;
    }

    console.log('🔄 Creating map markers, libraries count:', libraries.length);
    
    // Remove existing markers
    mapMarkers.forEach(marker => marker.remove());
    
    // Create new markers
    const newMarkers = libraries.map((library) => {
      console.log('📍 Creating marker for library:', library.name, 'coordinates:', library.coordinates);
      
      let lng: number, lat: number;
      
      // Handle different coordinate formats
      if (Array.isArray(library.coordinates)) {
        // If coordinates are already an array [lng, lat]
        [lng, lat] = library.coordinates;
      } else if (typeof library.coordinates === 'string') {
        // If coordinates are a string like "(lng,lat)"
        [lng, lat] = parseCoordinates(library.coordinates);
      } else {
        console.error('❌ Invalid coordinates format for library:', library.name, library.coordinates);
        return null;
      }
      
      // Create DOM element for marker
      const markerEl = document.createElement('div');
      markerEl.className = 'cursor-pointer';
      
      // Create a simple marker icon (we'll use a basic pin for now)
      markerEl.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;
      
      // Create the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat({ lng, lat })
        .addTo(map.current!);
      
      // Add click handler
      markerEl.addEventListener('click', (e) => {
        // Stop event propagation so map click handler doesn't fire
        e.stopPropagation();
        
        // Open library info view when clicking on existing library
        if ((window as any).LibraryBottomSheet) {
          (window as any).LibraryBottomSheet.openEditLibrary(library);
        }
        // Also call the original click handler for any other functionality
        handleLibraryClick(library);
      });
      
      return marker;
    }).filter(Boolean); // Remove any null markers
    
    console.log('✅ Created', newMarkers.length, 'markers');
    setMapMarkers(newMarkers as mapboxgl.Marker[]);
    markersCreatedRef.current = true;
    
    // Cleanup on unmount
    return () => {
      newMarkers.forEach(marker => marker?.remove());
      markersCreatedRef.current = false;
    };
  }, [libraries, isMapLoaded]); // Simplified dependencies

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ 
          width: '100dvw', 
          height: '100dvh' 
        }}
      />
      
      {/* Loading indicator */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-rainbow-tech-bg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Library Markers - Now handled by native Mapbox markers */}

      {/* Libraries Loading Indicator */}
      {librariesLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading libraries...</span>
          </div>
        </div>
      )}

      {/* Libraries Error Indicator */}
      {librariesError && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-600">Error loading libraries</span>
          </div>
        </div>
      )}

      {/* User Profile Button */}
      {authLoaded && (
        <button
          onClick={() => setShowUserProfile(true)}
          className="absolute top-4 right-12 w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="User Profile"
        >
          {isSignedIn ? (
            imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={20} />
            )
          ) : (
            <User size={20} />
          )}
        </button>
      )}

      {/* Libraries Count */}
      {libraries.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'} nearby
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Button - Only show when authenticated */}
      {authLoaded && isSignedIn && (
        <button
          onClick={() => {
            if (userLocation && (window as any).LibraryBottomSheet) {
              (window as any).LibraryBottomSheet.openAddLibrary(userLocation);
            }
          }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Add new library"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onToggle={() => setShowBottomSheet(!showBottomSheet)}
      />
      


      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
});

export default Map;
