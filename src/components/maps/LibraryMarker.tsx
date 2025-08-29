'use client';

import { useState } from 'react';
import { MapPin, BookOpen, Star, MapPinOff } from 'lucide-react';
import type { Library } from '@/types/database';

interface LibraryMarkerProps {
  library: Library;
  onClick?: (library: Library) => void;
  isSelected?: boolean;
}

export function LibraryMarker({ library, onClick, isSelected }: LibraryMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(library);
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Marker Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'bg-blue-600 text-white shadow-lg scale-110'
            : isHovered
            ? 'bg-blue-500 text-white shadow-md scale-105'
            : 'bg-white text-blue-600 shadow-md border-2 border-blue-600'
        }`}
      >
        <MapPin size={20} />
      </div>

      {/* Library Info Popup */}
      {(isHovered || isSelected) && (
        <div
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] ${
            isSelected ? 'opacity-100' : 'opacity-90'
          }`}
        >
          {/* Library Name */}
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {library.name}
          </h3>
          
          {/* Description */}
          {library.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {library.description}
            </p>
          )}
          

          
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs">
              <BookOpen size={12} className="mr-1 text-blue-600" />
              <span className="text-gray-600">Active</span>
            </div>
            
            {/* Public/Private indicator */}
            <div className={`px-2 py-1 rounded-full text-xs ${
              library.is_public 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {library.is_public ? 'Public' : 'Private'}
            </div>
          </div>
          
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
}
