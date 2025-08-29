import { LibraryForm, LibraryView } from '@/components/library/LibraryForm';
import QuickActions from '@/components/ui/QuickActions';
import type { Library } from '@/types/database';

interface BottomSheetContentProps {
  libraryOperation: {
    mode: 'add' | 'edit' | 'view';
    coordinates?: [number, number];
    library?: Library;
  } | null;
  onClose: () => void;
  onSwitchToEdit: () => void;
  children?: React.ReactNode;
}

export default function BottomSheetContent({ 
  libraryOperation, 
  onClose, 
  onSwitchToEdit, 
  children 
}: BottomSheetContentProps) {
  // Common handle line component
  const HandleLine = () => (
    <div className="flex justify-center pt-2 pb-4">
      <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );

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
      <QuickActions />
      {children}
    </>
  );
}
