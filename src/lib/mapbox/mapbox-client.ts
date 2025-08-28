import mapboxgl from 'mapbox-gl';

// Mapbox configuration
export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.006, 40.7128] as [number, number], // Default to NYC, will be overridden by user location
  zoom: 12,
  pitch: 0,
  bearing: 0,
} as const;

// Map initialization function
export const initializeMap = (container: string | HTMLElement): mapboxgl.Map => {
  if (!MAPBOX_CONFIG.accessToken) {
    throw new Error('Mapbox access token is required');
  }

  // Set the access token globally before creating the map
  mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

  return new mapboxgl.Map({
    container,
    style: MAPBOX_CONFIG.style,
    center: MAPBOX_CONFIG.center,
    zoom: MAPBOX_CONFIG.zoom,
    pitch: MAPBOX_CONFIG.pitch,
    bearing: MAPBOX_CONFIG.bearing,
    attributionControl: false, // We'll add custom attribution
    logoPosition: 'bottom-right',
    preserveDrawingBuffer: true, // For screenshots
  });
};

// Map controls setup
export const setupMapControls = (map: mapboxgl.Map): void => {
  // Add navigation control (zoom in/out, compass)
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  
  // Add geolocate control (locate me button)
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    'top-right'
  );
};

// Utility functions for map interactions
export const flyToLocation = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  zoom: number = 15
): void => {
  map.flyTo({
    center: coordinates,
    zoom,
    duration: 2000,
    curve: 1.42,
    easing: (t: number) => t,
  });
};

export const addMarker = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  options: {
    color?: string;
    size?: number;
    popup?: string;
  } = {}
): mapboxgl.Marker => {
  const { color = '#3B82F6', size = 20, popup } = options;
  
  const marker = new mapboxgl.Marker({
    color,
    scale: size / 20,
  })
    .setLngLat(coordinates)
    .addTo(map);

  if (popup) {
    const popupElement = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
    })
      .setHTML(popup)
      .setLngLat(coordinates);
    
    marker.setPopup(popupElement);
  }

  return marker;
};

// Cleanup function
export const cleanupMap = (map: mapboxgl.Map): void => {
  if (map) {
    map.remove();
  }
};
