'use client';

import { useEffect, useCallback } from 'react';
import { X, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CrosshairsProps {
  isVisible: boolean;
  coordinates: [number, number] | null;
  onAddLibraryAction: (coordinates: [number, number]) => void;
  onCloseAction: () => void;
}

export function Crosshairs({ isVisible, coordinates, onAddLibraryAction, onCloseAction }: CrosshairsProps) {
  const { isSignedIn } = useAuth();

  // Close crosshairs when user is not signed in
  useEffect(() => {
    if (!isSignedIn) {
      onCloseAction();
    }
  }, [isSignedIn, onCloseAction]);

  if (!isVisible || !coordinates || !isSignedIn) {
    return null;
  }

  const handleAddLibrary = () => {
    console.log('🎯 Crosshairs: Add Library clicked', coordinates);
    onAddLibraryAction(coordinates);
    onCloseAction();
  };

  const handleClose = () => {
    onCloseAction();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ pointerEvents: 'none' }}>
      {/* Crosshairs overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Vertical line */}
        <div className="absolute w-px h-16 bg-blue-500 opacity-80" />
        
        {/* Horizontal line */}
        <div className="absolute h-px w-16 bg-blue-500 opacity-80" />
        
        {/* Center dot */}
        {/* <div className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg" /> */}
        
        
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-12 left-1/2 w-full px-8 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center space-x-3 w-full">
          {/* Add Library Button */}
          <button
            onClick={handleAddLibrary}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex flex-row items-center align-center justify-center gap-2 transition-all duration-200 w-full hover:scale-105"
          >
            <MapPin className="w-5 h-5" />
            <span className="font-small">Add Library</span>
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

     
      
    </div>
  );
}
