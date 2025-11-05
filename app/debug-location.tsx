import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { formatPhilippineAddress, reverseGeocodeWithOSM, type OSMAddress } from '../lib/geocoding';

const DebugLocationScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [rawAddress, setRawAddress] = useState<OSMAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getLocation = async () => {
    try {
      setLoading(true);
      setError('');

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);

      // Reverse geocode with OSM Nominatim
      const osmAddress = await reverseGeocodeWithOSM(
        loc.coords.latitude,
        loc.coords.longitude
      );

      if (osmAddress) {
        setRawAddress(osmAddress);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const formatAddress = () => {
    if (!rawAddress) return 'No address data';
    return formatPhilippineAddress(rawAddress.formattedAddress);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Location Debug Tool</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={getLocation}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Error: {error}</Text>
        </View>
      )}

      {location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Coordinates</Text>
          <Text style={styles.dataText}>Latitude: {location.coords.latitude}</Text>
          <Text style={styles.dataText}>Longitude: {location.coords.longitude}</Text>
        </View>
      )}

      {rawAddress && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Address Comparison</Text>
            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonLabel}>Nominatim (Original):</Text>
              <Text style={styles.comparisonText}>{rawAddress.formattedAddress}</Text>
              
              <Text style={[styles.comparisonLabel, { marginTop: 12 }]}>App Display (Cleaned):</Text>
              <Text style={styles.comparisonTextHighlight}>{formatAddress()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Raw API Response</Text>
            <View style={styles.rawData}>
              {Object.entries(rawAddress).map(([key, value]) => (
                <View key={key} style={styles.dataRow}>
                  <Text style={styles.dataKey}>{key}:</Text>
                  <Text style={styles.dataValue}>
                    {value ? String(value) : 'null'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 JSON Output</Text>
            <ScrollView horizontal>
              <Text style={styles.jsonText}>
                {JSON.stringify(rawAddress, null, 2)}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Address Parts Analysis</Text>
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisText}>
                name: "{rawAddress.name || 'null'}" {rawAddress.name ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                street: "{rawAddress.street || 'null'}" {rawAddress.street ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                streetNumber: "{rawAddress.streetNumber || 'null'}" {rawAddress.streetNumber ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                district: "{rawAddress.district || 'null'}" {rawAddress.district ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                subregion: "{rawAddress.subregion || 'null'}" {rawAddress.subregion ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                city: "{rawAddress.city || 'null'}" {rawAddress.city ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                region: "{rawAddress.region || 'null'}" {rawAddress.region ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                country: "{rawAddress.country || 'null'}" {rawAddress.country ? '✅' : '❌'}
              </Text>
              <Text style={styles.analysisText}>
                postalCode: "{rawAddress.postalCode || 'null'}" {rawAddress.postalCode ? '✅' : '❌'}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  formattedAddress: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 24,
  },
  comparisonContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  comparisonText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  comparisonTextHighlight: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 20,
  },
  dataText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  rawData: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataKey: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    width: 120,
  },
  dataValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  analysisContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  analysisText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
    marginBottom: 6,
  },
});

export default DebugLocationScreen;
