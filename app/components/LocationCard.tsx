import * as Location from 'expo-location';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react-native';
import React, { useEffect, useState, Component } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { formatPhilippineAddress, reverseGeocodeWithOSM } from '../../lib/geocoding';
import { getMapDiagnostics, logMapLoadAttempt, logMapLoadSuccess, logMapLoadFailure, suggestSolution } from '../../lib/mapDiagnostics';

// Error boundary for map crashes with detailed logging
class MapErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; errorDetails: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorDetails: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorDetails: error.toString() };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Get diagnostics
    const diagnostics = getMapDiagnostics();
    
    // Detailed error logging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      platform: Platform.OS,
      platformVersion: Platform.Version,
      diagnostics,
    };
    
    console.error('═══════════════════════════════════════');
    console.error('MAP CRASH ERROR LOG');
    console.error('═══════════════════════════════════════');
    console.error('Timestamp:', errorLog.timestamp);
    console.error('Platform:', errorLog.platform);
    console.error('Platform Version:', errorLog.platformVersion);
    console.error('Error Name:', errorLog.errorName);
    console.error('Error Message:', errorLog.errorMessage);
    console.error('Error Stack:', errorLog.errorStack);
    console.error('Component Stack:', errorLog.componentStack);
    console.error('═══════════════════════════════════════');
    
    // Suggest solution
    const solution = suggestSolution(error.message || error.toString());
    console.error('💡 SUGGESTED SOLUTION:', solution);
    console.error('═══════════════════════════════════════');
    
    // Log to console in JSON format for easy copying
    console.error('JSON Error Log:', JSON.stringify(errorLog, null, 2));
    
    // Log failure
    logMapLoadFailure(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (location) {
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  // Log when map is expanded
  useEffect(() => {
    if (expanded && location) {
      logMapLoadAttempt({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [expanded, location]);

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
          <MapErrorBoundary
            fallback={
              <View style={styles.mapErrorContainer}>
                <Text style={styles.mapErrorText}>Map temporarily unavailable</Text>
                <Text style={styles.mapErrorSubtext}>
                  Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
              </View>
            }
          >
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onPress={editable ? handleMapPress : undefined}
              scrollEnabled={editable}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
              onMapReady={() => {
                logMapLoadSuccess();
                console.log('✅ Map rendered successfully');
              }}
            >
              {/* Using OSM France HOT tile server for compliance with OSM tile usage policy
                  - Designed for humanitarian/emergency apps (perfect for incident reporting)
                  - More permissive than main OSM tiles for mobile apps
                  - No User-Agent header issues
                  - See: https://wiki.openstreetmap.org/wiki/Tile_usage_policy */}
              <UrlTile
                urlTemplate="https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
                tileSize={256}
              />
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title={editable ? 'Tap map to change' : 'Location'}
                description={address}
                draggable={editable}
                onDragEnd={editable ? handleMapPress : undefined}
              />
            </MapView>
          </MapErrorBoundary>
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
  mapErrorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  mapErrorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  mapErrorSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  mapPlaceholderCoords: {
    fontSize: 14,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
});

export default LocationCard;
