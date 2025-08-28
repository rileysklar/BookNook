'use client';

import { useState, useCallback } from 'react';
import Map from '@/components/maps/Map';
import BottomSheet from '@/components/maps/BottomSheet';
import { Map as MapboxMap } from 'mapbox-gl';

export default function MapPage() {
  console.log('🗺️ Map page rendering')
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleMapReady = useCallback((map: MapboxMap) => {
    setMapInstance(map);
    // Only log once per map instance to reduce console noise during development
    if (!mapInstance) {
      console.log('Map is ready!');
    }
  }, [mapInstance]);

  const handleLocationUpdate = useCallback((coordinates: [number, number]) => {
    setUserLocation(coordinates);
    console.log('User location updated:', coordinates);
  }, []);

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  return (
    <div className="relative w-full h-full">
      {/* Full-screen map */}
      <Map 
        onMapReady={handleMapReady}
        onLocationUpdate={handleLocationUpdate}
      />
      
      {/* Floating action button to open bottom sheet */}
      <button
        onClick={toggleBottomSheet}
        className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-30"
        aria-label="Open menu"
      >
        <svg 
          className="w-6 h-6 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
      </button>
      
      {/* Bottom sheet menu */}
      <BottomSheet 
        isOpen={isBottomSheetOpen}
        onToggle={toggleBottomSheet}
      />
      
      {/* Status indicator */}
      {userLocation && (
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg z-30">
          <p className="text-sm font-medium text-gray-700">
            📍 {userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}
