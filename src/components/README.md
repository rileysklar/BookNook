# BookNook Component Architecture

## 🏗️ **Component Organization**

This directory follows a clean, modular architecture that separates concerns and makes components easy to maintain and test.

## 📁 **Directory Structure**

```
src/components/
├── maps/                          # Map-related components
│   ├── BottomSheet/              # Bottom sheet system
│   │   ├── index.ts             # Main exports
│   │   ├── BottomSheet.tsx      # Core container & logic
│   │   ├── BottomSheetContent.tsx # Content switching logic
│   │   └── BottomSheetHandle.tsx # Drag handle component
│   ├── Map.tsx                   # Main map component
│   └── LibraryMarker.tsx         # Individual library markers
├── library/                       # Library management components
│   └── LibraryForm/              # Library form system
│       ├── index.ts              # Main exports
│       ├── LibraryForm.tsx       # Main form orchestrator
│       ├── LibraryView.tsx       # Library information view
│       ├── LibraryFormFields.tsx # Form input fields
│       ├── DeleteConfirmModal.tsx # Delete confirmation
│       └── types.ts              # Type definitions
└── ui/                           # Reusable UI components
    └── QuickActions.tsx          # Quick action buttons
```

## 🎯 **Component Responsibilities**

### **BottomSheet System**
- **`BottomSheet.tsx`** - Main container, drag logic, state management
- **`BottomSheetContent.tsx`** - Content switching between library operations and default content
- **`BottomSheetHandle.tsx`** - Touch/drag handle for mobile interaction

### **LibraryForm System**
- **`LibraryForm.tsx`** - Main form orchestrator, handles CRUD operations
- **`LibraryView.tsx`** - Displays library information in view mode
- **`LibraryFormFields.tsx`** - Reusable form input fields
- **`DeleteConfirmModal.tsx`** - Confirmation dialog for deletions
- **`types.ts`** - Shared type definitions

### **UI Components**
- **`QuickActions.tsx`** - Default bottom sheet content with quick actions

## 🔄 **Data Flow**

1. **Map Component** → Triggers library operations via global `LibraryBottomSheet` API
2. **BottomSheet** → Manages operation state and coordinates
3. **BottomSheetContent** → Routes to appropriate component based on operation mode
4. **Library Components** → Handle specific operations (view, edit, add, delete)

## 🎨 **Design Principles**

### **Single Responsibility**
Each component has one clear purpose and handles one aspect of functionality.

### **Composition Over Inheritance**
Components are composed together rather than extended, making them more flexible.

### **Props Down, Events Up**
Data flows down through props, events bubble up through callbacks.

### **Type Safety**
All components use TypeScript interfaces for props and state.

## 🚀 **Usage Examples**

### **Opening Library Operations**
```typescript
// From Map component
(window as any).LibraryBottomSheet.openAddLibrary([lng, lat]);
(window as any).LibraryBottomSheet.openEditLibrary(library);
```

### **Component Composition**
```typescript
import { BottomSheet } from '@/components/maps/BottomSheet';
import { LibraryForm } from '@/components/library/LibraryForm';

// Use in your component
<BottomSheet isOpen={isOpen} onToggle={onToggle}>
  <CustomContent />
</BottomSheet>
```

## 🔧 **Maintenance & Testing**

### **Adding New Features**
1. Create new component in appropriate directory
2. Export from index.ts
3. Update types if needed
4. Add tests

### **Modifying Existing Components**
1. Identify the specific responsibility
2. Make changes in the focused component
3. Update related components if interfaces change
4. Test the change doesn't break other functionality

### **Testing Strategy**
- **Unit Tests** - Test individual components in isolation
- **Integration Tests** - Test component interactions
- **E2E Tests** - Test complete user workflows

## 📚 **Best Practices**

1. **Keep components small** - Aim for <100 lines per component
2. **Use descriptive names** - Component names should clearly indicate purpose
3. **Extract reusable logic** - Move common patterns to custom hooks
4. **Document complex logic** - Add comments for business logic
5. **Consistent styling** - Use Tailwind classes consistently
6. **Error boundaries** - Wrap components that might fail
7. **Loading states** - Always show loading indicators for async operations

## 🎉 **Benefits of This Architecture**

- **Maintainability** - Easy to find and modify specific functionality
- **Testability** - Components can be tested in isolation
- **Reusability** - Components can be reused across the application
- **Scalability** - Easy to add new features without affecting existing code
- **Team Development** - Multiple developers can work on different components
- **Performance** - Components can be optimized individually
- **Debugging** - Issues are isolated to specific components

---

**Remember**: This architecture is designed to grow with your application. Keep components focused, interfaces clean, and always consider the user experience when making changes.
