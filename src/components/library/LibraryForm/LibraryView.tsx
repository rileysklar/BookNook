import { MapPin, Edit3 } from 'lucide-react';
import type { Library } from '@/types/database';

interface LibraryViewProps {
  library: Library;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

export default function LibraryView({ library, onClose, onSwitchToEdit }: LibraryViewProps) {
  const formatCoordinates = (coordinates: string) => {
    if (!coordinates) return 'Coordinates not available';
    
    try {
      const coords = coordinates.replace(/[()]/g, '').split(',');
      const lat = parseFloat(coords[1]).toFixed(4);
      const lng = parseFloat(coords[0]).toFixed(4);
      return `${lat}, ${lng}`;
    } catch {
      return 'Coordinates not available';
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      {/* Library Info */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">Location</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            {formatCoordinates(library.coordinates)}
          </p>
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
