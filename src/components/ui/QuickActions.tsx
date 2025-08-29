import { Plus, Search, List, User, LogIn, LogOut } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useUser, SignOutButton } from '@clerk/nextjs';

export default function QuickActions() {
  const { user } = useUser();

  return (
    <>
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
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center overflow-hidden">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12 !bg-transparent",
                    avatarImage: "w-full h-full object-cover"
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
          <div className="flex flex-col space-y-2">
            <SignInButton mode="modal">
              <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Sign In</span>
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Sign Up</span>
              </button>
            </SignUpButton>
          </div>
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
              <p className="text-xs text-gray-500">&ldquo;The Great Gatsby&rdquo; at Central Park Library</p>
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
              <SignOutButton>
                <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
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
    </>
  );
}
