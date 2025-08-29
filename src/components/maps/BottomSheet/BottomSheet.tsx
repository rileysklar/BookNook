'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Library } from '@/types/database';
import BottomSheetContent from './BottomSheetContent';
import BottomSheetHandle from './BottomSheetHandle';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

// ============================================================================
// MAIN BOTTOM SHEET COMPONENT
// ============================================================================

export default function BottomSheet({ isOpen, onToggle, children }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Library operation state
  const [libraryOperation, setLibraryOperation] = useState<{
    mode: 'add' | 'edit' | 'view';
    coordinates?: [number, number];
    library?: Library;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    const threshold = 50; // Minimum drag distance to trigger toggle
    
    if (deltaY > threshold && isOpen) {
      onToggle(); // Close sheet
    } else if (deltaY < -threshold && !isOpen) {
      onToggle(); // Open sheet
    }
    
    setIsDragging(false);
  };

  // Close library operation when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setLibraryOperation(null);
    }
  }, [isOpen]);

  // Public methods for external components to trigger library operations
  const openAddLibrary = useCallback((coordinates: [number, number]) => {
    setLibraryOperation({
      mode: 'add',
      coordinates
    });
    onToggle(); // Open the sheet
  }, [onToggle]);

  const openEditLibrary = useCallback((library: Library) => {
    setLibraryOperation({
      mode: 'view',
      library
    });
    onToggle(); // Open the sheet
  }, [onToggle]);

  const closeLibraryOperation = useCallback(() => {
    setLibraryOperation(null);
    onToggle(); // Close the sheet
  }, [onToggle]);

  const switchToEditMode = () => {
    if (libraryOperation?.library) {
      setLibraryOperation({
        mode: 'edit',
        library: libraryOperation.library
      });
    }
  };

  // Expose methods globally for external access
  useEffect(() => {
    (window as any).LibraryBottomSheet = {
      openAddLibrary,
      openEditLibrary,
      closeLibraryOperation
    };
  }, [openAddLibrary, openEditLibrary, closeLibraryOperation]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Handle - Always visible for tap/drag interaction */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomSheetHandle
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onToggle}
        />
      </div>
      
      {/* Bottom Sheet Content */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: isDragging 
            ? `translateY(${Math.max(0, currentY - startY)}px)` 
            : undefined
        }}
      >
        {/* Content */}
        <div className="bg-white px-6 pb-8 rounded-t-3xl shadow-2xl">
          <BottomSheetContent
            libraryOperation={libraryOperation}
            onClose={closeLibraryOperation}
            onSwitchToEdit={switchToEditMode}
          >
            {children}
          </BottomSheetContent>
        </div>
      </div>
    </>
  );
}
