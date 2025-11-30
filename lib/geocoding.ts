/**
 * Geocoding Utilities
 * 
 * Provides functions for reverse geocoding using Google Maps Geocoding API
 * and formatting addresses for Philippine locations.
 */

// Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export interface GeocodedAddress {
  street: string | null;
  postalCode: string | null;
  streetNumber: string | null;
  region: string | null;
  name: string | null;
  district: string | null;
  country: string | null;
  isoCountryCode: string | null;
  formattedAddress: string | null;
  subregion: string | null;
  timezone: string | null;
  city: string | null;
}

/**
 * Reverse geocode coordinates using Google Maps Geocoding API
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<GeocodedAddress> - Formatted address object
 */
export async function reverseGeocodeWithGoogle(
  latitude: number,
  longitude: number,
  retries = 2
): Promise<GeocodedAddress> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    // Parse Google's address components
    const result = data.results[0];
    const components = result.address_components || [];
    
    const getComponent = (type: string): string | null => {
      const component = components.find((c: any) => c.types.includes(type));
      return component?.long_name || null;
    };

    const getShortComponent = (type: string): string | null => {
      const component = components.find((c: any) => c.types.includes(type));
      return component?.short_name || null;
    };
    
    return {
      street: getComponent('route'),
      postalCode: getComponent('postal_code'),
      streetNumber: getComponent('street_number'),
      region: getComponent('administrative_area_level_1'),
      name: getComponent('sublocality_level_1') || getComponent('neighborhood') || getComponent('locality'),
      district: getComponent('administrative_area_level_2'),
      country: getComponent('country'),
      isoCountryCode: getShortComponent('country'),
      formattedAddress: result.formatted_address || null,
      subregion: getComponent('administrative_area_level_3'),
      timezone: null,
      city: getComponent('locality') || getComponent('administrative_area_level_2'),
    };
  } catch (err: any) {
    console.error('Google Geocoding error:', err);
    
    // Retry on network errors
    if (retries > 0 && (err.name === 'AbortError' || err.message?.includes('Network request failed'))) {
      console.log(`Retrying geocoding... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return reverseGeocodeWithGoogle(latitude, longitude, retries - 1);
    }
    
    // Return fallback address instead of throwing
    console.warn('Using fallback address due to geocoding failure');
    return {
      street: null,
      postalCode: null,
      streetNumber: null,
      region: 'Camarines Norte',
      name: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      district: null,
      country: 'Philippines',
      isoCountryCode: 'PH',
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      subregion: null,
      timezone: null,
      city: null,
    };
  }
}

// Alias for backward compatibility
export const reverseGeocodeWithOSM = reverseGeocodeWithGoogle;

/**
 * Format OSM address for display in the Philippines
 * Removes unnecessary parts like "Bicol Region", postal codes, and "Philippines"
 * 
 * @param formattedAddress - The display_name from Nominatim
 * @returns Cleaned address string
 */
export function formatPhilippineAddress(formattedAddress: string | null): string {
  if (!formattedAddress) return 'Address not found';

  let address = formattedAddress;
  
  // Remove "Bicol Region" or just "Bicol" (regional name not needed)
  address = address.replace(/,?\s*Bicol\s*Region\s*/gi, '');
  address = address.replace(/,?\s*Bicol\s*/gi, '');
  
  // Remove postal code patterns (4 digits)
  address = address.replace(/,?\s*\d{4}\s*/g, '');
  
  // Remove country name at the end
  address = address.replace(/,?\s*Philippines\s*$/gi, '');
  
  // Clean up multiple commas and spaces
  address = address.replace(/,\s*,/g, ',').trim();
  address = address.replace(/^,\s*/, '').replace(/,\s*$/, '');
  
  return address || 'Address not found';
}

/**
 * Get a short address (just the main location name)
 * Useful for compact displays
 * 
 * @param address - Geocoded address object
 * @returns Short address string
 */
export function getShortAddress(address: GeocodedAddress): string {
  const parts = [];
  
  // Add name if it's not a Plus Code
  if (address.name && !address.name.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/)) {
    parts.push(address.name);
  }
  
  // Add city
  if (address.city) {
    parts.push(address.city);
  }
  
  return parts.join(', ') || 'Unknown location';
}

// Type alias for backward compatibility
export type OSMAddress = GeocodedAddress;
