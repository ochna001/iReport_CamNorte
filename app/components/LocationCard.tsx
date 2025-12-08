import * as Location from 'expo-location';
import { ChevronDown, ChevronUp, MapPin, Search, X } from 'lucide-react-native';
import React, { Component, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { formatPhilippineAddress, reverseGeocodeWithOSM } from '../../lib/geocoding';
import { getMapDiagnostics, logMapLoadAttempt, logMapLoadFailure, logMapLoadSuccess, suggestSolution } from '../../lib/mapDiagnostics';

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
  defaultExpanded?: boolean;
  onLocationChange?: (location: Location.LocationObject) => void;
}

// Google Maps API Key for Places autocomplete
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  title = '📍 Location',
  editable = false,
  defaultExpanded,
  onLocationChange,
}) => {
  const [address, setAddress] = useState<string>('Loading address...');
  // Default to expanded if editable or explicitly set
  const [expanded, setExpanded] = useState(defaultExpanded ?? editable);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Address search fallback state
  const [geocodingFailed, setGeocodingFailed] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Maps now use Google Places API which works in all builds
  const shouldShowMap = true;

  useEffect(() => {
    if (location) {
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  // Log when map is expanded and delay map rendering
  useEffect(() => {
    if (expanded && location) {
      logMapLoadAttempt({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Delay map rendering to allow UI to settle
      const timer = setTimeout(() => {
        setShowMap(true);
      }, 300);
      
      // Timeout to show error if map doesn't load in 10 seconds
      const errorTimer = setTimeout(() => {
        if (!mapLoaded) {
          console.error('Map failed to load within 10 seconds');
          setMapError(true);
        }
      }, 10000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(errorTimer);
      };
    } else {
      setShowMap(false);
      setMapLoaded(false);
      setMapError(false);
    }
  }, [expanded, location, mapLoaded]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setGeocodingFailed(false);
      const result = await reverseGeocodeWithOSM(latitude, longitude);
      const formattedAddress = formatPhilippineAddress(result.formattedAddress);
      
      // Check if the address is just coordinates (geocoding failed)
      const isCoordinatesOnly = formattedAddress.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/) ||
                                formattedAddress.includes('Location:') ||
                                formattedAddress === 'Address not found';
      
      if (isCoordinatesOnly) {
        setGeocodingFailed(true);
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      } else {
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setGeocodingFailed(true);
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  // Search for address suggestions using Google Places Autocomplete
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ph&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddresses(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAddresses]);

  // Select a suggestion and get its coordinates
  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSearchLoading(true);
    try {
      // Get place details to get coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        
        // Update location
        if (onLocationChange) {
          const newLocation: Location.LocationObject = {
            coords: {
              latitude: lat,
              longitude: lng,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          };
          onLocationChange(newLocation);
        }
        
        // Update address directly from the selected suggestion
        setAddress(formatPhilippineAddress(data.result.formatted_address || suggestion.description));
        setGeocodingFailed(false);
        setShowAddressSearch(false);
        setSearchQuery('');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Place details error:', error);
    } finally {
      setSearchLoading(false);
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
        <View>
          <Text style={styles.address}>{address}</Text>
          {geocodingFailed && editable && (
            <TouchableOpacity 
              style={styles.searchAddressButton}
              onPress={() => setShowAddressSearch(true)}
            >
              <Search size={14} color={Colors.primary} />
              <Text style={styles.searchAddressText}>Search for address</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Address Search Input */}
      {showAddressSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputRow}>
            <Search size={18} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Type address to search..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => {
              setShowAddressSearch(false);
              setSearchQuery('');
              setSuggestions([]);
            }}>
              <X size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          {searchLoading && (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.searchLoader} />
          )}
          
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => selectSuggestion(item)}
                >
                  <MapPin size={16} color={Colors.primary} />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionMainText}>
                      {item.structured_formatting?.main_text || item.description.split(',')[0]}
                    </Text>
                    <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
                      {item.structured_formatting?.secondary_text || item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
          
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
          )}
        </View>
      )}

      <Text style={styles.coordinates}>
        {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
      </Text>

      {editable && !showAddressSearch && (
        <Text style={styles.hint}>Tap map to change location</Text>
      )}

      {expanded && (
        <View style={styles.mapContainer}>
          {!shouldShowMap ? (
            <View style={styles.mapErrorContainer}>
              <MapPin size={48} color={Colors.primary} />
              <Text style={styles.mapErrorText}>Map view disabled in this build</Text>
              <Text style={styles.mapErrorSubtext}>
                Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={[styles.mapErrorSubtext, { marginTop: 8, fontSize: 11 }]}>
                Use development build for interactive maps
              </Text>
            </View>
          ) : !showMap ? (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.mapLoadingText}>Loading map...</Text>
            </View>
          ) : mapError ? (
            <View style={styles.mapErrorContainer}>
              <Text style={styles.mapErrorText}>Map temporarily unavailable</Text>
              <Text style={styles.mapErrorSubtext}>
                Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
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
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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
                setMapLoaded(true);
                logMapLoadSuccess();
                console.log('✅ Map rendered successfully with Google Maps');
              }}
            >
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
          )}
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
  mapLoadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  mapLoadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  mapPlaceholderCoords: {
    fontSize: 14,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  searchAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  searchAddressText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 8,
  },
  searchLoader: {
    marginTop: 12,
  },
  suggestionsList: {
    marginTop: 12,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  suggestionSecondaryText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  searchHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LocationCard;
