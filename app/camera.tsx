import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import LocationCard from './components/LocationCard';
import { Colors } from '../constants/colors';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

const CameraScreen = () => {
  const router = useRouter();
  const { agency } = useLocalSearchParams<{ agency: Agency }>();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
    // Auto-open camera when screen loads
    handleTakePhoto();
  }, []);

  const requestPermissions = async () => {
    // Request camera permission
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to capture evidence.');
    }

    // Request location permission
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    if (locationStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is required to tag incident location.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        setMedia([...media, { uri: result.assets[0].uri, type: 'image' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleTakeVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        setMedia([...media, { uri: result.assets[0].uri, type: 'video' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture video');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' as const : 'image' as const,
        }));
        setMedia([...media, ...newMedia]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select media');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (media.length === 0) {
      Alert.alert('No Media', 'Please capture at least one photo or video as evidence.');
      return;
    }

    // Navigate to incident form with media and location
    router.push({
      pathname: '/incident-form',
      params: {
        agency,
        mediaUris: JSON.stringify(media.map(m => m.uri)),
        latitude: location?.coords.latitude.toString(),
        longitude: location?.coords.longitude.toString(),
      },
    });
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getAgencyColor() }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getAgencyName()}</Text>
        <Text style={styles.headerSubtitle}>Capture Evidence</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Location Info */}
        <LocationCard location={location} title="📍 Incident Location" />

        {/* Instructions - only show if no media yet */}
        {media.length === 0 && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📸 Capture Evidence</Text>
            <Text style={styles.instructionText}>
              Camera will open automatically. Take photos or videos of the incident.
            </Text>
          </View>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Captured Media ({media.length})</Text>
            <View style={styles.mediaGrid}>
              {media.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.mediaItem}
                  onPress={() => setPreviewMedia(item)}
                >
                  <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMedia(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                  {item.type === 'video' && (
                    <View style={styles.videoBadge}>
                      <Text style={styles.videoBadgeText}>VIDEO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Camera Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.cameraButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleTakePhoto}
          >
            <Camera size={24} color="#fff" />
            <Text style={styles.cameraButtonText}>Take Another Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraButton, styles.secondaryButton]}
            onPress={handleTakeVideo}
          >
            <Text style={styles.secondaryButtonText}>📹 Record Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraButton, styles.secondaryButton]}
            onPress={handleSelectFromGallery}
          >
            <Text style={styles.secondaryButtonText}>📁 Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        {media.length > 0 && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to Report Form →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Media Preview Modal */}
      <Modal
        visible={previewMedia !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewMedia(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalClose}
            onPress={() => setPreviewMedia(null)}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          
          {previewMedia && (
            <View style={styles.modalContent}>
              <Image 
                source={{ uri: previewMedia.uri }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
              {previewMedia.type === 'video' && (
                <View style={styles.videoPreviewBadge}>
                  <Text style={styles.videoPreviewText}>📹 Video Preview</Text>
                  <Text style={styles.videoPreviewSubtext}>Tap play in the form to view</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
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
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  instructionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  mediaSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 24,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  videoPreviewBadge: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoPreviewSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default CameraScreen;
