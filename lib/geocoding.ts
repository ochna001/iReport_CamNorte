/**
 * OpenStreetMap Nominatim Geocoding Utilities
 * 
 * Provides functions for reverse geocoding using OSM Nominatim API
 * and formatting addresses for Philippine locations.
 */

export interface OSMAddress {
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
 * Reverse geocode coordinates using OpenStreetMap Nominatim API
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<OSMAddress> - Formatted address object
 */
export async function reverseGeocodeWithOSM(
  latitude: number,
  longitude: number,
  retries = 2
): Promise<OSMAddress> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'iReport-CamNorte/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Map OSM response to standardized format
    const address = data.address || {};
    
    return {
      street: address.road || null,
      postalCode: address.postcode || null,
      streetNumber: address.house_number || null,
      region: address.state || address.province || null,
      name: address.hamlet || address.village || address.suburb || address.neighbourhood || data.display_name?.split(',')[0] || null,
      district: address.municipality || address.county || null,
      country: address.country || null,
      isoCountryCode: address.country_code?.toUpperCase() || null,
      formattedAddress: data.display_name || null,
      subregion: address.state_district || address.county || null,
      timezone: null,
      city: address.city || address.town || address.village || null,
    };
  } catch (err: any) {
    console.error('OSM Geocoding error:', err);
    
    // Retry on network errors
    if (retries > 0 && (err.name === 'AbortError' || err.message?.includes('Network request failed'))) {
      console.log(`Retrying geocoding... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return reverseGeocodeWithOSM(latitude, longitude, retries - 1);
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
 * @param osmAddress - OSM address object
 * @returns Short address string
 */
export function getShortAddress(osmAddress: OSMAddress): string {
  const parts = [];
  
  // Add name if it's not a Plus Code
  if (osmAddress.name && !osmAddress.name.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/)) {
    parts.push(osmAddress.name);
  }
  
  // Add city
  if (osmAddress.city) {
    parts.push(osmAddress.city);
  }
  
  return parts.join(', ') || 'Unknown location';
}
