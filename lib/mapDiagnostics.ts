import { Platform } from 'react-native';

/**
 * Map Diagnostics Utility
 * Helps diagnose why maps might crash in development builds
 */

export interface MapDiagnostics {
  platform: string;
  platformVersion: string;
  timestamp: string;
}

export const getMapDiagnostics = (): MapDiagnostics => {
  const diagnostics: MapDiagnostics = {
    platform: Platform.OS,
    platformVersion: Platform.Version.toString(),
    timestamp: new Date().toISOString(),
  };

  // Log diagnostics
  console.log('═══════════════════════════════════════');
  console.log('MAP DIAGNOSTICS');
  console.log('═══════════════════════════════════════');
  console.log('Platform:', diagnostics.platform);
  console.log('Platform Version:', diagnostics.platformVersion);
  console.log('Timestamp:', diagnostics.timestamp);
  console.log('═══════════════════════════════════════');

  return diagnostics;
};

export const logMapLoadAttempt = (location: { latitude: number; longitude: number }) => {
  console.log('═══════════════════════════════════════');
  console.log('MAP LOAD ATTEMPT');
  console.log('═══════════════════════════════════════');
  console.log('Latitude:', location.latitude);
  console.log('Longitude:', location.longitude);
  console.log('Timestamp:', new Date().toISOString());
  console.log('═══════════════════════════════════════');
};

export const logMapLoadSuccess = () => {
  console.log('✅ MAP LOADED SUCCESSFULLY');
};

export const logMapLoadFailure = (error: any) => {
  console.error('═══════════════════════════════════════');
  console.error('❌ MAP LOAD FAILURE');
  console.error('═══════════════════════════════════════');
  console.error('Error:', error);
  console.error('Error Type:', typeof error);
  console.error('Error Name:', error?.name);
  console.error('Error Message:', error?.message);
  console.error('Error Stack:', error?.stack);
  console.error('Timestamp:', new Date().toISOString());
  console.error('═══════════════════════════════════════');
};

/**
 * Common map crash causes and solutions
 */
export const MAP_CRASH_SOLUTIONS = {
  MEMORY_ISSUE: {
    cause: 'Device running low on memory',
    solution: 'Close other apps, restart device, or use a device with more RAM',
  },
  NATIVE_MODULE_MISSING: {
    cause: 'react-native-maps not properly linked',
    solution: 'Rebuild the development build with: eas build --profile development --platform android',
  },
  GOOGLE_MAPS_API: {
    cause: 'Google Maps API key missing or invalid',
    solution: 'We use OpenStreetMap, so this should not be an issue. Check app.json config.',
  },
  NETWORK_ISSUE: {
    cause: 'Cannot load map tiles from OSM server',
    solution: 'Check internet connection. OSM tiles require network access.',
  },
  ANDROID_VERSION: {
    cause: 'Old Android version incompatibility',
    solution: 'Ensure device is running Android 5.0 (API 21) or higher',
  },
};

export const suggestSolution = (errorMessage: string): string => {
  const msg = errorMessage.toLowerCase();
  
  if (msg.includes('memory') || msg.includes('heap')) {
    return MAP_CRASH_SOLUTIONS.MEMORY_ISSUE.solution;
  }
  
  if (msg.includes('native') || msg.includes('module') || msg.includes('undefined')) {
    return MAP_CRASH_SOLUTIONS.NATIVE_MODULE_MISSING.solution;
  }
  
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return MAP_CRASH_SOLUTIONS.NETWORK_ISSUE.solution;
  }
  
  if (msg.includes('api') || msg.includes('key')) {
    return MAP_CRASH_SOLUTIONS.GOOGLE_MAPS_API.solution;
  }
  
  return 'Unknown error. Please check logs and rebuild the app.';
};
