'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap, setupMapControls, cleanupMap } from '@/lib/mapbox/mapbox-client';
import '@/lib/mapbox/mapbox.css';

interface MapProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  onLocationUpdate?: (coordinates: [number, number]) => void;
}

export default function Map({ onMapReady, onLocationUpdate }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Prevent excessive re-renders
  const hasInitialized = useRef(false);
  
  // Memoize the component to prevent unnecessary re-renders
  const memoizedOnMapReady = useRef(onMapReady);
  const memoizedOnLocationUpdate = useRef(onLocationUpdate);

  useEffect(() => {
    if (!mapContainer.current || map.current || hasInitialized.current) {
      console.log('🚫 Map already exists, no container, or already initialized, skipping');
      return;
    }

    let mapInstance: mapboxgl.Map | null = null;

    // Define handler functions
    const handleLoad = () => {
      setIsMapLoaded(true);
      memoizedOnMapReady.current?.(mapInstance!);
    };

    const handleGeolocate = (e: any) => {
      const { coords } = e;
      const coordinates: [number, number] = [coords.longitude, coords.latitude];
      
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

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance && mapContainer.current) {
        try {
          // Remove all event listeners first
          mapInstance.off('load', handleLoad);
          mapInstance.off('geolocate', handleGeolocate);
          mapInstance.off('error', handleError);
          
          // Remove the map
          mapInstance.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
        map.current = null;
      }
    };
  }, []); // Empty dependency array - memoized callbacks prevent stale closures

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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
