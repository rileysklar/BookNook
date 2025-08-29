'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, MapPin, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLibraries } from '@/hooks/useLibraries';
import { useClerk } from '@clerk/nextjs';
import type { Library } from '@/types/database';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'libraries'>('profile');
  const { id, email, firstName, lastName, fullName, imageUrl, isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  
  // Fetch libraries created by the current user
  const { libraries: userLibraries, loading: librariesLoading } = useLibraries({
    autoFetch: false
  });

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Not Signed In</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={fullName || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {fullName || 'User Profile'}
              </h2>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'libraries'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Libraries
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Personal Information</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {fullName || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {email}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md font-mono text-xs">
                    {id}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-gray-900">Account Actions</h3>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">My Libraries</h3>
              
              {librariesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userLibraries.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Libraries Yet</h4>
                  <p className="text-gray-600 mb-4">
                    You haven&apos;t created any libraries yet. Start by adding one to the map!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userLibraries.map((library) => (
                    <div
                      key={library.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{library.name}</h4>
                          {library.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {library.description}
                            </p>
                          )}

                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          library.is_public 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {library.is_public ? 'Public' : 'Private'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
