'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn } = useClerkAuth();
  const { isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('🔐 ProtectedRoute useEffect:', { isLoaded, isSignedIn });
    if (isLoaded && !isSignedIn) {
      console.log('🚫 User not signed in, redirecting to home');
      router.push('/');
    }
  }, [isLoaded, isSignedIn]); // Remove router from dependencies

  // Always render the same structure, but conditionally show content
  return (
    <div className="min-h-screen">
      {!isLoaded ? (
        // Loading state
        <div className="flex items-center justify-center min-h-screen bg-rainbow-tech-bg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      ) : !isSignedIn ? (
        // Not signed in - show loading while redirecting
        <div className="flex items-center justify-center min-h-screen bg-rainbow-tech-bg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Redirecting to sign in...</p>
          </div>
        </div>
      ) : (
        // Signed in - show children
        children
      )}
    </div>
  );
}
