import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { formatPhilippineAddress, reverseGeocodeWithOSM } from '../lib/geocoding';
import { supabase } from '../lib/supabase';
import { isOnline, addToQueue } from '../lib/offlineQueue';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

const ConfirmReportScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const { 
    agency, 
    mediaUris, 
    latitude, 
    longitude, 
    name, 
    age, 
    description 
  } = useLocalSearchParams<{
    agency: Agency;
    mediaUris: string;
    latitude: string;
    longitude: string;
    name: string;
    age: string;
    description: string;
  }>();

  const [address, setAddress] = useState<string>('Loading address...');
  const [submitting, setSubmitting] = useState(false);
  const media = mediaUris ? JSON.parse(mediaUris) : [];
  const timestamp = new Date();

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const result = await reverseGeocodeWithOSM(lat, lon);
      setAddress(formatPhilippineAddress(result.formattedAddress));
    } catch (error) {
      setAddress('Address unavailable');
    }
  };

  const getAgencyColor = () => {
    switch (agency) {
      case 'PNP':
        return Colors.agencies.pnp;
      case 'BFP':
        return Colors.agencies.bfp;
      case 'PDRRMO':
        return Colors.agencies.pdrrmo;
      default:
        return Colors.primary;
    }
  };

  const getAgencyName = () => {
    switch (agency) {
      case 'PNP':
        return 'Crime Report';
      case 'BFP':
        return 'Fire Report';
      case 'PDRRMO':
        return 'Disaster Report';
      default:
        return 'Incident Report';
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Check if online
      const online = await isOnline();
      
      if (!online) {
        // Save to offline queue
        Alert.alert(
          'No Internet Connection',
          'Your report will be saved and submitted automatically when you\'re back online.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await addToQueue({
                  agency,
                  name,
                  age,
                  description,
                  latitude,
                  longitude,
                  address,
                  mediaUris,
                });
                
                router.replace({
                  pathname: '/report-success',
                  params: {
                    incidentId: 'offline_queued',
                    agency: agency,
                    offline: 'true',
                  },
                });
              }
            }
          ]
        );
        return;
      }

      // Validate media count
      if (media.length > 10) {
        Alert.alert('Too Many Files', 'You can only upload up to 10 photos/videos per report.');
        setSubmitting(false);
        return;
      }

      // 1. Upload media files to Supabase Storage
      const uploadedMediaUrls: string[] = [];
      
      for (const mediaUri of media) {
        const fileExt = mediaUri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `incidents/${fileName}`;

        // Read file as ArrayBuffer for React Native
        const response = await fetch(mediaUri);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-media')
          .upload(filePath, fileData, {
            contentType: `image/${fileExt}`,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('incident-media')
          .getPublicUrl(filePath);

        uploadedMediaUrls.push(urlData.publicUrl);
      }

      // 2. Create incident record
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert({
          agency_type: agency.toLowerCase(),
          reporter_id: session?.user?.id || null,
          reporter_name: name,
          reporter_age: parseInt(age),
          description: description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          location_address: address,
          media_urls: uploadedMediaUrls,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // 3. Navigate to success screen
      router.replace({
        pathname: '/report-success',
        params: {
          incidentId: incident.id,
          agency: agency,
        },
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Handle specific error types
      let errorTitle = 'Submission Failed';
      let errorMessage = 'Failed to submit report. Please try again.';
      
      if (error.message?.includes('Rate limit exceeded')) {
        errorTitle = 'Too Many Reports';
        errorMessage = 'You can only submit 5 reports per hour. Please try again later.';
      } else if (error.message?.includes('Invalid')) {
        errorTitle = 'Invalid Data';
        errorMessage = error.message;
      } else if (error.message?.includes('too long')) {
        errorTitle = 'Content Too Long';
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getAgencyColor() }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          disabled={submitting}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Report</Text>
        <Text style={styles.headerSubtitle}>Review before submitting</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>✅ Report Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type:</Text>
            <Text style={styles.summaryValue}>{getAgencyName()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>{address}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time:</Text>
            <Text style={styles.summaryValue}>
              {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Evidence:</Text>
            <Text style={styles.summaryValue}>{media.length} photo(s)</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reporter:</Text>
            <Text style={styles.summaryValue}>{name}, {age} years old</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={styles.mediaCard}>
            <Text style={styles.mediaLabel}>Captured Evidence:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.mediaGrid}>
                {media.map((uri: string, index: number) => (
                  <Image 
                    key={index} 
                    source={{ uri }} 
                    style={styles.mediaThumbnail}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text style={styles.editButtonText}>✏️ Edit Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>📤 Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    width: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  mediaCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  editButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    minHeight: 56,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ConfirmReportScreen;
