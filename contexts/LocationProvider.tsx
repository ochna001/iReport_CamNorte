import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  location: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  loading: true,
  error: null,
  permissionDenied: false,
  refreshLocation: async () => {},
});

export const useLocation = () => {
  return useContext(LocationContext);
};

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check/request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      setPermissionDenied(false);

      // Get current location with high accuracy
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc);
      console.log('[LocationProvider] Location fetched:', loc.coords.latitude, loc.coords.longitude);
    } catch (err: any) {
      console.error('[LocationProvider] Error fetching location:', err);
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  // Fetch location on app startup
  useEffect(() => {
    fetchLocation();

    // Also set up a watcher to keep location updated
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 50, // Or when moved 50 meters
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      }
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const refreshLocation = async () => {
    await fetchLocation();
  };

  return (
    <LocationContext.Provider value={{ location, loading, error, permissionDenied, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
