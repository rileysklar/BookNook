'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, MapPin, Star, Calendar, User, X } from 'lucide-react';
import Image from 'next/image';
import type { Library } from '@/types/database';
import { useUserInfo } from '@/lib/utils/user-info';

interface LibraryListViewProps {
  libraries: Library[];
  onLibrarySelect?: (library: Library) => void;
  onClose?: () => void;
}

interface FilterState {
  search: string;
  sortBy: 'name' | 'created_at' | 'distance';
  sortOrder: 'asc' | 'desc';
  showOnlyPublic: boolean;
}

export default function LibraryListView({ libraries, onLibrarySelect, onClose }: LibraryListViewProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showOnlyPublic: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort libraries
  const filteredLibraries = useMemo(() => {
    const filtered = libraries.filter(library => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = library.name.toLowerCase().includes(searchLower);
        const matchesDescription = library.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesName && !matchesDescription) return false;
      }

      // Public filter
      if (filters.showOnlyPublic && !library.is_public) {
        return false;
      }

      return true;
    });

    // Sort libraries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'distance':
          // For now, we'll use a simple distance calculation based on coordinates
          // In a real app, you'd calculate actual distance from user location
          const aCoords = Array.isArray(a.coordinates) ? a.coordinates : 
            a.coordinates.replace(/[()]/g, '').split(',').map(Number);
          const bCoords = Array.isArray(b.coordinates) ? b.coordinates : 
            b.coordinates.replace(/[()]/g, '').split(',').map(Number);
          
          // Simple distance calculation (not accurate, just for sorting)
          const aDistance = Math.sqrt(aCoords[0] ** 2 + aCoords[1] ** 2);
          const bDistance = Math.sqrt(bCoords[0] ** 2 + bCoords[1] ** 2);
          comparison = aDistance - bDistance;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [libraries, filters]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const handleSortChange = useCallback((sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handlePublicFilterToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, showOnlyPublic: !prev.showOnlyPublic }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
      showOnlyPublic: false
    });
  }, []);

  const formatCoordinates = useCallback((coordinates: string | number[]) => {
    if (Array.isArray(coordinates)) {
      return `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`;
    }
    const coords = coordinates.replace(/[()]/g, '').split(',').map(Number);
    return `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Libraries</h2>
          <p className="text-sm text-gray-500">
            {filteredLibraries.length} of {libraries.length} libraries
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search libraries..."
            className="w-full pl-10 pr-4 py-3 text-stone-500 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {(filters.search || filters.showOnlyPublic || filters.sortBy !== 'name') && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <div className="flex space-x-2">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'created_at', label: 'Date' },
                  { key: 'distance', label: 'Distance' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSortChange(key as FilterState['sortBy'])}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filters.sortBy === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                    {filters.sortBy === key && (
                      <span className="ml-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Public Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public-only"
                checked={filters.showOnlyPublic}
                onChange={handlePublicFilterToggle}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="public-only" className="text-sm text-gray-700">
                Show only public libraries
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Library List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLibraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MapPin className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No libraries found</p>
            <p className="text-sm text-center">
              {filters.search ? 'Try adjusting your search terms' : 'No libraries match your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredLibraries.map((library) => (
              <LibraryListItem
                key={library.id}
                library={library}
                onSelect={onLibrarySelect}
                formatCoordinates={formatCoordinates}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual library list item component
function LibraryListItem({ 
  library, 
  onSelect, 
  formatCoordinates, 
  formatDate 
}: {
  library: Library;
  onSelect?: (library: Library) => void;
  formatCoordinates: (coords: string | number[]) => string;
  formatDate: (date: string) => string;
}) {
  const creatorInfo = useUserInfo(library.creator_id);

  return (
    <button
      onClick={() => onSelect?.(library)}
      className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
    >
      <div className="flex items-start space-x-3">
        {/* Library Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>

        {/* Library Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {library.name}
              </h3>
              {library.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {library.description}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className="flex-shrink-0 ml-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                library.is_public 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {library.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="mt-3 space-y-2">
            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{formatCoordinates(library.coordinates)}</span>
            </div>

            {/* Creator */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>
                {creatorInfo ? (
                  <>
                    {creatorInfo.display_name || creatorInfo.username}
                    {creatorInfo.avatar_url && (
                      <Image
                        src={creatorInfo.avatar_url}
                        alt={creatorInfo.display_name || creatorInfo.username}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full ml-1 inline"
                      />
                    )}
                  </>
                ) : (
                  'Unknown User'
                )}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(library.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
