// Add this to Map.tsx after the existing useEffect hooks

// Handle location selection from search
const handleLocationSelect = useCallback((coordinates: [number, number], placeName: string) => {
  if (map.current) {
    console.log('🗺️ Moving map to:', coordinates, placeName);
    
    // Fly to the selected location
    map.current.flyTo({
      center: coordinates,
      zoom: 14, // Good zoom level for city/neighborhood view
      duration: 2000, // 2 second animation
      essential: true
    });
    
    // Call the callback if provided
    onLocationSelect?.(coordinates, placeName);
  }
}, [onLocationSelect]);

// Expose location selection globally
useEffect(() => {
  (window as any).MapLocationControl = {
    flyToLocation: handleLocationSelect
  };
}, [handleLocationSelect]);
