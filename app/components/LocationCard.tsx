import * as Location from 'expo-location';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Temporarily disabled until development build
// import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { formatPhilippineAddress, reverseGeocodeWithOSM } from '../../lib/geocoding';

interface LocationCardProps {
  location: Location.LocationObject | null;
  title?: string;
  editable?: boolean;
  onLocationChange?: (location: Location.LocationObject) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  title = '📍 Location',
  editable = false,
  onLocationChange,
}) => {
  const [address, setAddress] = useState<string>('Loading address...');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const result = await reverseGeocodeWithOSM(latitude, longitude);
      const formattedAddress = formatPhilippineAddress(result.formattedAddress);
      setAddress(formattedAddress);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress('Unable to fetch address');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!editable || !onLocationChange) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation: Location.LocationObject = {
      coords: {
        latitude,
        longitude,
        altitude: location?.coords.altitude || null,
        accuracy: location?.coords.accuracy || null,
        altitudeAccuracy: location?.coords.altitudeAccuracy || null,
        heading: location?.coords.heading || null,
        speed: location?.coords.speed || null,
      },
      timestamp: Date.now(),
    };

    onLocationChange(newLocation);
    await reverseGeocode(latitude, longitude);
  };

  if (!location) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.text}>Location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.label}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandButton}>
          {expanded ? (
            <ChevronUp size={20} color={Colors.text.secondary} />
          ) : (
            <ChevronDown size={20} color={Colors.text.secondary} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
      ) : (
        <Text style={styles.address}>{address}</Text>
      )}

      <Text style={styles.coordinates}>
        {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
      </Text>

      {editable && (
        <Text style={styles.hint}>Tap map to change location</Text>
      )}

      {expanded && (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderTitle}>🗺️ Map View</Text>
            <Text style={styles.mapPlaceholderText}>
              Interactive map will be available after running:
            </Text>
            <Text style={styles.mapPlaceholderCode}>npx expo run:android</Text>
            <Text style={styles.mapPlaceholderText}>
              Current coordinates:
            </Text>
            <Text style={styles.mapPlaceholderCoords}>
              {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  expandButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  coordinates: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  hint: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  loader: {
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  mapContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderCode: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  mapPlaceholderCoords: {
    fontSize: 14,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
});

export default LocationCard;
