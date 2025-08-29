import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  isSignedIn: boolean;
  isLoaded: boolean;
}

export function useAuth(): AuthenticatedUser {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  return {
    id: user?.id || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    firstName: user?.firstName || undefined,
    lastName: user?.lastName || undefined,
    fullName: user?.fullName || undefined,
    imageUrl: user?.imageUrl || undefined,
    isSignedIn: isSignedIn || false,
    isLoaded: isLoaded || false,
  };
}

export function useRequireAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  
  const requireAuth = useCallback((callback: () => void) => {
    if (!isLoaded) {
      return false;
    }
    
    if (!isSignedIn) {
      // Could redirect to sign-in here if needed
      return false;
    }
    
    callback();
    return true;
  }, [isSignedIn, isLoaded]);

  return {
    requireAuth,
    isSignedIn,
    isLoaded,
  };
}
