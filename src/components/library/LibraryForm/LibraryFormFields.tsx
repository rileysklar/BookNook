import { MapPin } from 'lucide-react';
import type { LibraryFormData } from './types';

interface LibraryFormFieldsProps {
  mode: 'add' | 'edit';
  formData: LibraryFormData;
  coordinates?: [number, number];
  onInputChange: (field: keyof LibraryFormData, value: string | boolean) => void;
}

export default function LibraryFormFields({ 
  mode, 
  formData, 
  coordinates, 
  onInputChange 
}: LibraryFormFieldsProps) {
  return (
    <>
      {/* Location Info - Only show for add mode */}
      {mode === 'add' && coordinates && (
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="flex items-center space-x-2 text-blue-700">
            <MapPin size={14} />
            <span className="text-xs font-medium">Location Selected</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
          </p>
        </div>
      )}

      {/* Library Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
          Library Name *
        </label>
                    <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
              placeholder="e.g., Oak Street Little Library"
              required
            />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
          Description
        </label>
                    <textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
              placeholder="Tell us about this library..."
            />
      </div>

      

      {/* Public/Private Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => onInputChange('isPublic', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPublic" className="text-xs text-gray-700">
          Make this library public
        </label>
      </div>
    </>
  );
}
