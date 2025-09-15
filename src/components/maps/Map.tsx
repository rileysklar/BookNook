'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import Image from 'next/image';
import { initializeMap, cleanupMap } from '@/lib/mapbox/mapbox-client';
import { useLibraryContext } from '@/contexts/LibraryContext';
import { LibraryMarker } from './LibraryMarker';
import { BottomSheet } from './BottomSheet';
import { UserProfile } from './UserProfile';
import { Crosshairs } from './Crosshairs';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';
import type { Library } from '@/types/database';
import '@/lib/mapbox/mapbox.css';

interface MapProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  onLocationUpdate?: (coordinates: [number, number]) => void;
  onLibrarySelect?: (library: Library) => void;
  onLocationSelect?: (coordinates: [number, number], placeName: string) => void;
}

const Map = memo(function Map({ onMapReady, onLocationUpdate, onLibrarySelect, onLocationSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCrosshairs, setShowCrosshairs] = useState(false);
  const [crosshairsCoordinates, setCrosshairsCoordinates] = useState<[number, number] | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  
  // Prevent excessive re-renders
  const hasInitialized = useRef(false);
  const mapReadyCalled = useRef(false);
  
  // Memoize the component to prevent unnecessary re-renders
  const memoizedOnMapReady = useRef(onMapReady);
  const memoizedOnLocationUpdate = useRef(onLocationUpdate);
  const memoizedOnLocationSelect = useRef(onLocationSelect);

  // Use global library context
  const { libraries, loading: librariesLoading, error: librariesError } = useLibraryContext();

  // Debug: Log when libraries change
  useEffect(() => {
    console.log('🗺️ Map component - libraries updated:', libraries.length, libraries);
  }, [libraries]);

  // Handle location selection from search
  useEffect(() => {
    if (onLocationSelect && map.current && isMapLoaded) {
      // Create a handler function that flies to the selected location
      const handleLocationSelect = (coordinates: [number, number], placeName: string, libraryId?: string) => {
        console.log('🗺️ Flying to selected location:', coordinates, placeName, libraryId);
        
        // Fly to the selected location with smooth animation
        map.current!.flyTo({
          center: coordinates,
          zoom: 15,
          duration: 2000,
          curve: 1.42,
          easing: (t: number) => t,
        });

        // If a library ID is provided, open that specific library's popup
        if (libraryId) {
          setTimeout(() => {
            const library = libraries.find(lib => lib.id === libraryId);
            if (library) {
              console.log('📚 Opening library popup:', library.name);
              if ((window as any).LibraryBottomSheet) {
                (window as any).LibraryBottomSheet.openEditLibrary(library);
              }
            }
          }, 2100); // Wait for flyTo animation to complete
        }

        // Call the original callback if provided
        memoizedOnLocationSelect.current?.(coordinates, placeName);
      };

      // Expose the handler globally so it can be called from search
      (window as any).handleLocationSelect = handleLocationSelect;
    }
  }, [onLocationSelect, isMapLoaded, libraries]);





  // State to track Mapbox markers
  const [mapMarkers, setMapMarkers] = useState<mapboxgl.Marker[]>([]);
  const geolocateControlRef = useRef<any>(null);

  // Get authentication state
  const { isSignedIn, isLoaded: authLoaded, imageUrl } = useAuth();

  const handleLibraryClick = useCallback((library: Library) => {
    setSelectedLibrary(prev => prev?.id === library.id ? null : library);
    onLibrarySelect?.(library);
  }, [onLibrarySelect]);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log('🗺️ Map clicked:', { authLoaded, isSignedIn, showCrosshairs });
    
    if (authLoaded && isSignedIn) {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      console.log('📍 Coordinates:', coordinates);
      
      // If crosshairs are already shown, close them
      if (showCrosshairs) {
        console.log('❌ Closing crosshairs');
        setShowCrosshairs(false);
        setCrosshairsCoordinates(null);
        return;
      }
      
      // Show crosshairs for adding a library
      console.log('✅ Showing crosshairs');
      setCrosshairsCoordinates(coordinates);
      setShowCrosshairs(true);
    } else {
      console.log('❌ Not authenticated or auth not loaded');
    }
  }, [authLoaded, isSignedIn, showCrosshairs]);

  // Store the current handleMapClick in a ref to avoid dependency issues
  const handleMapClickRef = useRef(handleMapClick);
  handleMapClickRef.current = handleMapClick;

  // Function to trigger crosshairs from external components (like QuickActions)
  const triggerCrosshairs = useCallback(() => {
    console.log('🎯 Triggering crosshairs from external component');
    if (authLoaded && isSignedIn) {
      // Close the BottomSheet first using the global method
      console.log('📱 Closing BottomSheet before showing crosshairs');
      if ((window as any).LibraryBottomSheet && (window as any).LibraryBottomSheet.close) {
        (window as any).LibraryBottomSheet.close();
      } else {
        console.log('⚠️ LibraryBottomSheet.close method not found');
        setShowBottomSheet(false);
      }
      
      // Get current map center as default coordinates
      if (map.current) {
        const center = map.current.getCenter();
        const coordinates: [number, number] = [center.lng, center.lat];
        console.log('📍 Using map center coordinates:', coordinates);
        
        setCrosshairsCoordinates(coordinates);
        setShowCrosshairs(true);
      } else {
        console.log('⚠️ Map not ready yet');
      }
    } else {
      console.log('❌ Not authenticated or auth not loaded');
    }
  }, [authLoaded, isSignedIn]);

  // Expose triggerCrosshairs function globally
  useEffect(() => {
    (window as any).triggerCrosshairs = triggerCrosshairs;
    
    return () => {
      delete (window as any).triggerCrosshairs;
    };
  }, [triggerCrosshairs]);

  // Helper function to parse coordinate strings from database
  const parseCoordinates = useCallback((coordString: string): [number, number] => {
    // Remove parentheses and split by comma
    const clean = coordString.replace(/[()]/g, '');
    const [lng, lat] = clean.split(',').map(Number);
    return [lng, lat];
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || hasInitialized.current) {
      return;
    }

    // Store ref value in variable to avoid stale closure warning
    const containerElement = mapContainer.current;
    let mapInstance: mapboxgl.Map | null = null;

    // Define handler functions
    const handleLoad = () => {
      // Always set map as loaded (this is the mapbox event, not our callback)
      setIsMapLoaded(true);
      
      // Only call the callback once
      if (!mapReadyCalled.current) {
        memoizedOnMapReady.current?.(mapInstance!);
        mapReadyCalled.current = true;
      }
      
      // Auto-trigger geolocation to center on user location if permission granted
      setTimeout(() => {
        if (geolocateControlRef.current && typeof geolocateControlRef.current.trigger === 'function') {
          geolocateControlRef.current.trigger();
        }
      }, 1000); // Small delay to ensure map is fully loaded
    };

    const handleGeolocate = (e: any) => {
      const { coords } = e;
      const coordinates: [number, number] = [coords.longitude, coords.latitude];
      
      setUserLocation(coordinates);
      setGeolocationError(null);
      setIsGeolocating(false);
      
      // Fly to user location with smooth animation
      mapInstance!.flyTo({
        center: coordinates,
        zoom: 15,
        duration: 2000,
        curve: 1.42,
        easing: (t: number) => t,
      });

      memoizedOnLocationUpdate.current?.(coordinates);
    };

    const handleError = (e: any) => {
      console.error('Mapbox error:', e);
    };

    const handleGeolocateStart = () => {
      setIsGeolocating(true);
      setGeolocationError(null);
    };

    const handleGeolocateError = (e: any) => {
      console.warn('Geolocation failed:', e);
      setIsGeolocating(false);
      
      // Determine the specific error type
      let errorMessage = 'Unable to determine your location.';
      
      if (e.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions in your browser.';
      } else if (e.code === 2) {
        errorMessage = 'Location unavailable. Please check your internet connection and try again.';
      } else if (e.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      setGeolocationError(errorMessage);
      
      // Keep the map centered on Austin if geolocation fails
      console.log('Staying centered on Austin due to geolocation failure');
    };

    try {
      // Initialize the map
      mapInstance = initializeMap(mapContainer.current);
      map.current = mapInstance;
      hasInitialized.current = true;

      // Setup controls and store reference to geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      mapInstance.addControl(geolocateControl, 'top-right');
      geolocateControlRef.current = geolocateControl;
      
      // Add other controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add event listeners
      mapInstance.on('load', handleLoad);
      mapInstance.on('geolocate', handleGeolocate);
      mapInstance.on('error', handleError);
      mapInstance.on('geolocateerror', handleGeolocateError);
      mapInstance.on('geolocatestart', handleGeolocateStart);
      
      // Add click handler for adding libraries (only when authenticated)
      mapInstance.on('click', handleMapClickRef.current);

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
          mapInstance.off('geolocateerror', handleGeolocateError);
          mapInstance.off('geolocatestart', handleGeolocateStart);
          mapInstance.off('click', handleMapClickRef.current);
          
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
  }, []); // No dependencies needed - using refs for functions

  // Create and manage Mapbox markers when libraries change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    // Remove existing markers
    mapMarkers.forEach(marker => marker.remove());
    
    // Create new markers
    const newMarkers = libraries.map((library) => {
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
    
    setMapMarkers(newMarkers as mapboxgl.Marker[]);
    
    // Cleanup on unmount
    return () => {
      newMarkers.forEach(marker => marker?.remove());
    };
  }, [libraries, isMapLoaded, handleLibraryClick, mapMarkers, parseCoordinates]);

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

      {/* Libraries Count 
      {libraries.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'} nearby
            </span>
          </div>
        </div>
      )}*/}

      {/* User location indicator */}
      {userLocation && (
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg z-30">
          <p className="text-sm font-medium text-gray-700">
            📍 {userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)}
          </p>
        </div>
      )}

      {/* Geolocation Loading Indicator */}
      {isGeolocating && (
        <div className="absolute top-20 left-6 bg-blue-50 border border-blue-200 rounded-lg shadow-md px-3 py-2 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Finding your location...</span>
          </div>
        </div>
      )}

      {/* Geolocation Error Indicator */}
      {geolocationError && (
        <div className="absolute top-20 left-6 bg-red-50 border border-red-200 rounded-lg shadow-md px-3 py-2 z-30 max-w-xs">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">Location Error</p>
              <p className="text-xs text-red-600 mt-1">{geolocationError}</p>
            </div>
            <button
              onClick={() => setGeolocationError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onToggle={() => setShowBottomSheet(!showBottomSheet)}
      />

      {/* Crosshairs Component */}
      <Crosshairs
        isVisible={showCrosshairs}
        coordinates={crosshairsCoordinates}
        onAddLibraryAction={(coordinates) => {
          console.log('🎯 Map: Opening add library form with coordinates:', coordinates);
          if ((window as any).LibraryBottomSheet) {
            (window as any).LibraryBottomSheet.openAddLibrary(coordinates);
          } else {
            console.error('❌ LibraryBottomSheet not found on window object');
          }
        }}
        onCloseAction={() => {
          setShowCrosshairs(false);
          setCrosshairsCoordinates(null);
        }}
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
