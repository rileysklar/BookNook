'use client';

import { useState, useCallback, memo } from 'react';
import Map from '@/components/maps/Map';
import { BottomSheet } from '@/components/maps/BottomSheet';
import { Map as MapboxMap } from 'mapbox-gl';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

const MapPage = memo(function MapPage() {
  console.log('🔄 MapPage rendering at:', new Date().toISOString());
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showCrosshairs, setShowCrosshairs] = useState(false);

  const handleMapReady = useCallback((map: MapboxMap) => {
    // Prevent multiple calls
    if (mapInstance === map) {
      console.log('🚫 Map already set, skipping duplicate call');
      return;
    }
    setMapInstance(map);
    console.log('✅ Map is ready! (first time)');
  }, [mapInstance]);

  const handleLocationUpdate = useCallback((coordinates: [number, number]) => {
    setUserLocation(coordinates);
    console.log('User location updated:', coordinates);
  }, []);

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  return (
    <ProtectedRoute>
      <div className="relative w-full h-full">
        {/* Full-screen map */}
        <Map 
          onMapReady={handleMapReady}
          onLocationUpdate={handleLocationUpdate}
          showCrosshairs={showCrosshairs}
          onCrosshairsClick={(coordinates) => {
            setShowCrosshairs(false);
            // Open add library form with the clicked coordinates
            if ((window as any).LibraryBottomSheet) {
              (window as any).LibraryBottomSheet.openAddLibrary(coordinates);
            }
          }}
        />
        
        {/* Floating Action Button - Add New Library */}
        <button
          onClick={() => {
            setShowCrosshairs(true);
            // Auto-hide crosshairs after 3 seconds
            setTimeout(() => setShowCrosshairs(false), 3000);
          }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-30"
          title="Add new library at map center"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
        </button>
        
        {/* Crosshairs Indicator */}
        {showCrosshairs && (
          <>
            {/* Subtle overlay to highlight interaction area */}
            <div className="absolute inset-0 bg-blue-50/20 pointer-events-none z-20"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="relative animate-pulse">
              {/* Vertical line */}
              <div className="absolute left-1/2 top-0 w-0.5 h-12 bg-blue-600 transform -translate-x-1/2 shadow-lg"></div>
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-0 h-0.5 w-12 bg-blue-600 transform -translate-y-1/2 shadow-lg"></div>
              {/* Center dot */}
              <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg border-2 border-white animate-bounce"></div>
            </div>
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
              ✨ Click here to add library
            </div>
            </div>
          </>
        )}
        
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
    </ProtectedRoute>
  );
});

export default MapPage;
