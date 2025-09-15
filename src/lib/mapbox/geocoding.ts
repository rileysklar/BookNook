// Mapbox reverse geocoding utilities
import { MAPBOX_CONFIG } from './mapbox-client';

export interface GeocodingResult {
  neighborhood?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

/**
 * Reverse geocoding using Mapbox Geocoding API
 * Converts coordinates to human-readable address information
 */
export async function reverseGeocode(
  coordinates: [number, number]
): Promise<GeocodingResult | null> {
  const [lng, lat] = coordinates;
  
  if (!MAPBOX_CONFIG.accessToken) {
    console.warn('Mapbox access token not available for reverse geocoding');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_CONFIG.accessToken}&types=neighborhood,locality,place,region,country&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const context = feature.context || [];
    
    // Extract information from the feature and context
    const result: GeocodingResult = {
      address: feature.place_name,
    };

    // Parse context to extract specific location types
    context.forEach((item: any) => {
      const id = item.id;
      if (id.startsWith('neighborhood')) {
        result.neighborhood = item.text;
      } else if (id.startsWith('locality')) {
        result.locality = item.text;
      } else if (id.startsWith('place')) {
        result.city = item.text;
      } else if (id.startsWith('region')) {
        result.state = item.text;
      } else if (id.startsWith('country')) {
        result.country = item.text;
      }
    });

    return result;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Get a friendly location string from geocoding result
 * Prioritizes neighborhood > locality > city
 */
export function getLocationString(result: GeocodingResult | null): string {
  if (!result) return 'Location not available';
  
  // Priority: neighborhood > locality > city
  if (result.neighborhood) {
    return result.neighborhood;
  }
  
  if (result.locality) {
    return result.locality;
  }
  
  if (result.city) {
    return result.city;
  }
  
  return 'Location not available';
}

/**
 * Get full address string from geocoding result
 */
export function getFullAddress(result: GeocodingResult | null): string {
  if (!result) return 'Address not available';
  
  const parts = [];
  
  if (result.neighborhood) parts.push(result.neighborhood);
  if (result.locality) parts.push(result.locality);
  if (result.city) parts.push(result.city);
  if (result.state) parts.push(result.state);
  
  return parts.join(', ') || result.address || 'Address not available';
}
