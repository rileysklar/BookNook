import { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Save, Trash2 } from 'lucide-react';
import { useLibraryContext } from '@/contexts/LibraryContext';
import { useAuth } from '@/hooks/useAuth';
import type { Library } from '@/types/database';
import type { LibraryFormData } from './types';
import LibraryFormFields from './LibraryFormFields';
import DeleteConfirmModal from './DeleteConfirmModal';

interface LibraryFormProps {
  mode: 'add' | 'edit';
  coordinates?: [number, number];
  library?: Library;
  onClose: () => void;
}

export default function LibraryForm({ mode, coordinates, library, onClose }: LibraryFormProps) {
  const [formData, setFormData] = useState<LibraryFormData>({
    name: '',
    description: '',
    isPublic: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { createLibrary, updateLibrary, deleteLibrary } = useLibraryContext();
  const { isSignedIn, isLoaded, id: userId } = useAuth();

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && library) {
      setFormData({
        name: library.name || '',
        description: library.description || '',
        isPublic: library.is_public || true
      });
    }
  }, [mode, library]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Library name is required');
      return;
    }

    if (mode === 'add' && !coordinates) {
      setError('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!isSignedIn || !userId) {
        setError('You must be signed in to manage libraries');
        return;
      }

      if (mode === 'add') {
        const libraryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          coordinates: coordinates!,
          is_public: formData.isPublic
        } as const;

        await createLibrary(libraryData);
        onClose();
      } else if (mode === 'edit' && library) {
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          is_public: formData.isPublic
        };

        await updateLibrary(library.id, updateData);
        onClose();
      }
    } catch (error) {
      console.error(`Failed to ${mode} library:`, error);
      setError(`Failed to ${mode} library. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!library) return;
    
    try {
      await deleteLibrary(library.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete library:', error);
      setError('Failed to delete library. Please try again.');
    }
  };

  const handleInputChange = (field: keyof LibraryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name.trim().length > 0 && 
    (mode === 'edit' || (mode === 'add' && coordinates));

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show authentication required
  if (!isSignedIn) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-4">You must be signed in to manage libraries.</p>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${
        mode === 'edit' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
      }`}>
        <div>
          <h2 className={`text-lg font-semibold ${
            mode === 'edit' ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {mode === 'add' ? 'Add New Library' : 'Edit Library'}
          </h2>
          {mode === 'edit' && library && (
            <p className="text-sm text-blue-600 mt-1">
              {library.name}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
        <LibraryFormFields
          mode={mode}
          formData={formData}
          coordinates={coordinates}
          onInputChange={handleInputChange}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 space-x-3 pt-4 pb-2">
          {/* Delete Button - Only for edit mode */}
          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ${
              mode === 'add' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{mode === 'add' ? 'Creating...' : 'Updating...'}</span>
              </>
            ) : (
              <>
                {mode === 'add' ? (
                  <>
                    <Plus size={16} />
                    <span>Create Library</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        library={library!}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
