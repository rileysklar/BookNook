import { Plus, Search, List, User, LogIn, LogOut, ChevronDown, ChevronUp, MapPin, Calendar } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useUser, SignOutButton } from '@clerk/nextjs';
import { useState } from 'react';
import MapSearch from '@/components/maps/MapSearch';
import { useActivities } from '@/hooks/useActivities';

interface QuickActionsProps {
  onLocationSelect?: (coordinates: [number, number], placeName: string) => void;
  onViewModeChange?: (mode: 'quick-actions' | 'list-view') => void;
}

export default function QuickActions({ onLocationSelect, onViewModeChange }: QuickActionsProps) {
  const { user } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const { activities, logSearchActivity, error: activitiesError } = useActivities();

  const handleLocationSelect = (coordinates: [number, number], placeName: string) => {
    // Call the global handler if it exists
    if ((window as any).handleLocationSelect) {
      (window as any).handleLocationSelect(coordinates, placeName);
    }
    
    // Also call the original callback if provided
    onLocationSelect?.(coordinates, placeName);
    setShowSearch(false);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
  };

  // Helper functions for activities
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'library_created':
        return '📚';
      case 'search_performed':
        return '🔍';
      case 'library_viewed':
        return '👁️';
      case 'library_rated':
        return '⭐';
      default:
        return '📝';
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'library_created':
        return 'bg-blue-100 text-blue-600';
      case 'search_performed':
        return 'bg-green-100 text-green-600';
      case 'library_viewed':
        return 'bg-purple-100 text-purple-600';
      case 'library_rated':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleActivityClick = (activity: any) => {
    if (activity.activity_type === 'search_performed' && activity.metadata?.search_query) {
      // Re-run the search
      setShowSearch(true);
      // The search will be logged again when the user searches
    } else if (activity.activity_type === 'library_created' && activity.entity_id) {
      // Open the library
      if ((window as any).LibraryBottomSheet) {
        // We need to find the library by ID - this would require fetching library details
        console.log('Opening library:', activity.entity_id);
      }
    }
  };

  return (
    <>
      {/* Search Component */}
      {showSearch && (
        <div className="mb-6">
          <MapSearch 
            onLocationSelectAction={handleLocationSelect}
            onClose={handleCloseSearch}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={() => {
            console.log('📚 Add Book button clicked - triggering crosshairs');
            // Trigger crosshairs to show library creation mode
            if ((window as any).triggerCrosshairs) {
              (window as any).triggerCrosshairs();
            } else {
              console.log('⚠️ triggerCrosshairs function not found on window object');
            }
          }}
          className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Add Library</span>
        </button>
        
        <button 
          onClick={() => setShowSearch(true)}
          className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Search</span>
        </button>
        
        <button 
          onClick={() => onViewModeChange?.('list-view')}
          className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
        >
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
      
      {/* Recent Activity Accordion */}
      <div className="border-t border-gray-100 pt-6">
        <button
          onClick={() => setShowRecentActivity(!showRecentActivity)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          {showRecentActivity ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showRecentActivity && (
          <div className="mt-4 space-y-3">
            {activitiesError ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm text-yellow-700 font-medium">Activity tracking unavailable</p>
                <p className="text-xs text-yellow-600 mt-1">{activitiesError}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Run the database migration to enable activity tracking
                </p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">Your activity will appear here</p>
              </div>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className={`w-10 h-10 ${getActivityColor(activity.activity_type)} rounded-full flex items-center justify-center`}>
                    <span className="text-sm font-medium">{getActivityIcon(activity.activity_type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* User Profile Accordion */}
      <SignedIn>
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
            {showProfile ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showProfile && (
            <div className="mt-4 space-y-3">
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
          )}
        </div>
      </SignedIn>
    </>
  );
}
