// Geolocation utilities for IP-based location and distance calculation

export interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Fetch user's location based on their IP address
 * Uses ipapi.co free API (no API key required for basic usage)
 */
export async function getUserLocation(): Promise<LocationData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    const data = await response.json();

    return {
      ip: data.ip || '',
      city: data.city || 'Unknown',
      region: data.region || '',
      country: data.country_name || 'Unknown',
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      timezone: data.timezone || ''
    };
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  } else if (km < 10) {
    return `${km.toFixed(1)} km away`;
  } else if (km < 50) {
    return `${Math.round(km)} km away`;
  } else if (km < 100) {
    return `Within 100 km`;
  } else if (km < 500) {
    return `Within 500 km`;
  } else {
    return `${Math.round(km / 100) * 100}+ km away`;
  }
}

/**
 * Get proximity category for sorting
 */
export function getProximityCategory(km: number): string {
  if (km < 5) return 'nearby';
  if (km < 25) return 'local';
  if (km < 100) return 'regional';
  return 'distant';
}

/**
 * Check if two locations are in the same city
 */
export function isSameCity(city1: string, city2: string): boolean {
  return city1.toLowerCase().trim() === city2.toLowerCase().trim();
}
