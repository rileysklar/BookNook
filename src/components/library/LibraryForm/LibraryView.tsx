import { MapPin, Edit3, User } from 'lucide-react';
import Image from 'next/image';
import type { Library } from '@/types/database';

interface LibraryViewProps {
  library: Library;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

export default function LibraryView({ library, onClose, onSwitchToEdit }: LibraryViewProps) {
  const formatCoordinates = (coordinates: string | number[]) => {
    if (!coordinates) return 'Coordinates not available';
    
    try {
      let lat: number, lng: number;
      
      // Handle array format: [-97.8305727728882, 30.1900296455126]
      if (Array.isArray(coordinates)) {
        [lng, lat] = coordinates;
      } 
      // Handle string format: "(-97.769,30.2669)"
      else if (typeof coordinates === 'string') {
        const coords = coordinates.replace(/[()]/g, '').split(',');
        lng = parseFloat(coords[0]);
        lat = parseFloat(coords[1]);
      } else {
        return 'Coordinates not available';
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return 'Coordinates not available';
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      {/* Library Info */}
      <div className="space-y-3">
      <h2 className="text-lg text-slate-900 font-bold">{library.name}</h2>
        <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">Location</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            {formatCoordinates(library.coordinates)}
          </p>
        </div>
        </div>
      </div>

      {library.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Description</h4>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {library.description}
          </p>
        </div>
      )}

      {/* Creator Information */}
      {library.creator && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Created by</h4>
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
            {library.creator.avatar_url ? (
              <Image
                src={library.creator.avatar_url}
                alt={library.creator.display_name || library.creator.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {library.creator.display_name || library.creator.username}
              </p>
              {library.creator.display_name && (
                <p className="text-xs text-gray-500">@{library.creator.username}</p>
              )}
            </div>
          </div>
        </div>
      )}

      

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Status</h4>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            library.is_public ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-600">
            {library.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onSwitchToEdit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Edit3 size={16} />
          <span>Edit Library</span>
        </button>
      </div>
    </div>
  );
}
