export interface LibraryFormData {
  name: string;
  description: string;
  isPublic: boolean;
}

export interface LibraryOperationProps {
  mode: 'add' | 'edit' | 'view';
  coordinates?: [number, number];
  library?: any; // Library type from database
  onClose: () => void;
  onSwitchToEdit?: () => void;
}
