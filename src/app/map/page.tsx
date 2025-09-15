'use client';

import { useState, useCallback, memo } from 'react';
import Map from '@/components/maps/Map';
import { BottomSheet } from '@/components/maps/BottomSheet';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { LibraryProvider } from '@/contexts/LibraryContext';

const MapPage = memo(function MapPage() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleMapReady = useCallback((map: any) => {
    // Map is ready - could be used for future functionality
  }, []);

  const handleLocationUpdate = useCallback((coordinates: [number, number]) => {
    setUserLocation(coordinates);
  }, []);

  const handleLocationSelect = useCallback((coordinates: [number, number], placeName: string) => {
    console.log('📍 Map page - location selected:', coordinates, placeName);
    // The Map component will handle the actual flying to the location
  }, []);

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  return (
    <ProtectedRoute>
      <LibraryProvider 
        coordinates={userLocation || undefined}
        radius={10}
        autoFetch={true}
      >
        <div className="relative w-full h-full">
          {/* Full-screen map */}
          <Map 
            onMapReady={handleMapReady}
            onLocationUpdate={handleLocationUpdate}
            onLocationSelect={handleLocationSelect}
          />
          
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
      </LibraryProvider>
    </ProtectedRoute>
  );
});

export default MapPage;
