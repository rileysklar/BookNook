'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, Search, List, User, LogIn, LogOut } from 'lucide-react';
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';

interface BottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export default function BottomSheet({ isOpen, onToggle, children }: BottomSheetProps) {
  const { user, isSignedIn } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Bottom Sheet */}
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
        {/* Handle */}
        <div 
          className="flex justify-center pt-3 pb-2 rounded-t-3xl shadow-2xl absolute top-1 left-0 right-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="bg-white px-6 pb-8 rounded-t-3xl shadow-2xl">
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 py-6">
            <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Add Book</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Search</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <List className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">List View</span>
            </button>
            
            <SignedIn>
              <div className="flex flex-col items-center space-y-2 p-3 rounded-2xl">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-12 h-12"
                      }
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {user?.firstName || user?.username || 'Profile'}
                </span>
              </div>
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Sign In</span>
                </button>
              </SignInButton>
            </SignedOut>
          </div>
          
          {/* Recent Activity */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">📚</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New book added</p>
                  <p className="text-xs text-gray-500">"The Great Gatsby" at Central Park Library</p>
                </div>
                <span className="text-xs text-gray-400">2m ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">⭐</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Library rated</p>
                  <p className="text-xs text-gray-500">Brooklyn Bridge Library got 5 stars</p>
                </div>
                <span className="text-xs text-gray-400">15m ago</span>
              </div>
            </div>
          </div>
          
          {/* User Profile Section */}
          <SignedIn>
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">📚</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Books Added</p>
                    <p className="text-xs text-gray-500">0 books contributed</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">⭐</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Libraries Rated</p>
                    <p className="text-xs text-gray-500">0 libraries rated</p>
                  </div>
                </div>
              </div>
            </div>
          </SignedIn>
          
          {/* Custom content */}
          {children}
        </div>
      </div>
    </>
  );
}
