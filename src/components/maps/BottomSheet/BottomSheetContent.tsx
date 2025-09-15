import { LibraryForm, LibraryView } from '@/components/library/LibraryForm';
import LibraryListView from '@/components/library/LibraryListView';
import QuickActions from '@/components/ui/QuickActions';
import { useLibraryContext } from '@/contexts/LibraryContext';
import type { Library } from '@/types/database';

interface BottomSheetContentProps {
  libraryOperation: {
    mode: 'add' | 'edit' | 'view';
    coordinates?: [number, number];
    library?: Library;
  } | null;
  viewMode?: 'quick-actions' | 'list-view';
  onClose: () => void;
  onSwitchToEdit: () => void;
  onLocationSelect?: (coordinates: [number, number], placeName: string) => void;
  onViewModeChange?: (mode: 'quick-actions' | 'list-view') => void;
  children?: React.ReactNode;
}

export default function BottomSheetContent({ 
  libraryOperation, 
  viewMode = 'quick-actions',
  onClose, 
  onSwitchToEdit, 
  onLocationSelect,
  onViewModeChange,
  children 
}: BottomSheetContentProps) {
  const { libraries } = useLibraryContext();

  // Common handle line component
  const HandleLine = () => (
    <div className="flex justify-center pt-2 pb-4">
      <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );

  const handleLibrarySelect = (library: Library) => {
    // First, zoom the map to the library location
    if ((window as any).handleLocationSelect) {
      // Parse coordinates from the library
      let coordinates: [number, number];
      if (Array.isArray(library.coordinates)) {
        coordinates = [library.coordinates[0], library.coordinates[1]];
      } else {
        // Parse string coordinates like "(-97.769,30.2669)"
        const coords = library.coordinates.replace(/[()]/g, '').split(',').map(Number);
        coordinates = [coords[0], coords[1]];
      }
      
      // Fly to the library location with library ID for popup
      (window as any).handleLocationSelect(coordinates, library.name, library.id);
    }
    
    // Then open the library in view mode
    if ((window as any).LibraryBottomSheet) {
      (window as any).LibraryBottomSheet.openEditLibrary(library);
    }
  };

  if (libraryOperation) {
    return (
      <div className="py-4 -mx-6">
        <HandleLine />
        {libraryOperation.mode === 'view' ? (
          <LibraryView
            library={libraryOperation.library!}
            onClose={onClose}
            onSwitchToEdit={onSwitchToEdit}
          />
        ) : (
          <LibraryForm
            mode={libraryOperation.mode}
            coordinates={libraryOperation.coordinates}
            library={libraryOperation.library}
            onClose={onClose}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <HandleLine />
      {viewMode === 'list-view' ? (
        <div className="h-[70vh]">
          <LibraryListView
            libraries={libraries}
            onLibrarySelect={handleLibrarySelect}
            onClose={() => onViewModeChange?.('quick-actions')}
          />
        </div>
      ) : (
        <QuickActions 
          onLocationSelect={onLocationSelect}
          onViewModeChange={onViewModeChange}
        />
      )}
      {children}
    </>
  );
}
