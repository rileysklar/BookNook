'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { MAPBOX_CONFIG } from '@/lib/mapbox/mapbox-client';
import { useActivities } from '@/hooks/useActivities';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapSearchProps {
  onLocationSelectAction: (coordinates: [number, number], placeName: string) => void;
  onClose?: () => void;
}

export default function MapSearch({ onLocationSelectAction, onClose }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const { logSearchActivity } = useActivities();

  // Focus input when component mounts
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search function
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${MAPBOX_CONFIG.accessToken}&` +
        `limit=5&` +
        `types=place,locality,neighborhood,address,poi&` +
        `country=US`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const searchResults = data.features || [];
      setResults(searchResults);
      
      // Log the search activity
      await logSearchActivity(searchQuery, searchResults.length);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [logSearchActivity]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  }, [searchPlaces]);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    onLocationSelectAction(result.center, result.place_name);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  }, [onLocationSelectAction]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setResults([]);
        onClose?.();
        break;
    }
  }, [results, selectedIndex, onClose, handleResultSelect]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Handle open search
  const handleOpenSearch = useCallback(() => {
    setIsOpen(true);
    inputRef.current?.focus();
  }, []);

  // Handle close search
  const handleCloseSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    onClose?.();
  }, [onClose]);

  // Format place name for display
  const formatPlaceName = useCallback((result: SearchResult) => {
    const parts = result.place_name.split(', ');
    if (parts.length > 2) {
      return `${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    return result.place_name;
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenSearch}
        className="w-full flex items-center space-x-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Search className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-700">Search for a location</p>
          <p className="text-xs text-gray-500">Find libraries near any place</p>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city, address, or place..."
            className="w-full pl-12 pr-12 py-4 border border-gray-300 text-stone-500 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={handleCloseSearch}
          className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Search Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleResultSelect(result)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${
                index === selectedIndex
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatPlaceName(result)}
                </p>
                <p className="text-xs text-gray-500">
                  {result.context?.[0]?.text || 'Location'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No locations found</p>
          <p className="text-sm text-gray-400">Try a different search term</p>
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Search Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Try city names like &quot;Austin, TX&quot;</li>
            <li>• Search for neighborhoods like &quot;Downtown Austin&quot;</li>
            <li>• Use addresses like &quot;123 Main St, Austin&quot;</li>
            <li>• Look for landmarks like &quot;Zilker Park&quot;</li>
          </ul>
        </div>
      )}
    </div>
  );
}
