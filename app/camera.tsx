import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { Colors } from '../constants/colors';
import { useLanguage } from '../contexts/LanguageProvider';
import { useLocation } from '../contexts/LocationProvider';
import { useReportDraft } from '../contexts/ReportDraftProvider';
import LocationCard from './components/LocationCard';
import MediaEditor from './components/MediaEditor';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  hasBlur?: boolean;
}

const CameraScreen = () => {
  const router = useRouter();
  const { agency } = useLocalSearchParams<{ agency: Agency }>();
  const { t } = useLanguage();
  
  // Use global location from context (fetched on app startup)
  const { location: globalLocation, loading: locationLoading, permissionDenied, refreshLocation } = useLocation();
  
  // Use draft context for persisting media and form data
  const { draft, setAgency, setMedia: setDraftMedia, addMedia: addDraftMedia, removeMedia: removeDraftMedia, updateMedia: updateDraftMedia, setLocation: setDraftLocation } = useReportDraft();
  
  // Local state for location (can be edited by user)
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  // Use draft media instead of local state
  const media = draft.media;
  const [loading, setLoading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  
  // Initialize local location from global location
  useEffect(() => {
    if (globalLocation && !location) {
      setLocation(globalLocation);
    }
  }, [globalLocation]);

  useEffect(() => {
    // Set agency in draft when screen loads
    if (agency) {
      setAgency(agency);
    }
    requestPermissions();
    // Auto-open camera when screen loads (only if no media yet)
    if (draft.media.length === 0) {
      handleTakePhoto();
    }
  }, []);

  const requestPermissions = async () => {
    // Request camera permission
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to capture evidence.');
    }
    
    // Location permission is handled by LocationProvider on app startup
    // If permission was denied, try to refresh
    if (permissionDenied) {
      await refreshLocation();
    }
  };

  const handleRetryLocation = async () => {
    await refreshLocation();
    if (permissionDenied) {
      Alert.alert(
        'Location Required',
        'Please enable location access in your device settings to continue.',
        [{ text: 'OK' }]
      );
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
        addDraftMedia([{ uri: result.assets[0].uri, type: 'image' }]);
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
        addDraftMedia([{ uri: result.assets[0].uri, type: 'video' }]);
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
        addDraftMedia(newMedia);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select media');
    }
  };

  const handleRemoveMedia = (index: number) => {
    removeDraftMedia(index);
  };

  const handleContinue = () => {
    if (media.length === 0) {
      Alert.alert('No Media', 'Please capture at least one photo or video as evidence.');
      return;
    }

    // Check if location is available
    if (!location) {
      Alert.alert(
        'Location Required',
        'Location is required to submit a report. Please enable location access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable Location', onPress: handleRetryLocation },
        ]
      );
      return;
    }

    // Save location to draft
    setDraftLocation(location.coords.latitude, location.coords.longitude);

    // Navigate to incident form (data is already in draft context)
    router.push({
      pathname: '/incident-form',
      params: {
        agency,
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
        return t('form.crimeReport');
      case 'BFP':
        return t('form.fireReport');
      case 'PDRRMO':
        return t('form.disasterReport');
      default:
        return t('form.incidentReport');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getAgencyColor() }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getAgencyName()}</Text>
        <Text style={styles.headerSubtitle}>{t('camera.title')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Location Info */}
        {permissionDenied ? (
          <View style={styles.locationDeniedCard}>
            <Text style={styles.locationDeniedTitle}>{t('camera.locationRequired')}</Text>
            <Text style={styles.locationDeniedText}>
              {t('camera.locationPermission')}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: getAgencyColor() }]}
              onPress={handleRetryLocation}
            >
              <Text style={styles.retryButtonText}>
                {locationLoading ? t('camera.locationLoading') : t('camera.grantPermission')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <LocationCard 
            location={location} 
            title={t('form.incidentLocation')} 
            editable={true}
            onLocationChange={setLocation}
          />
        )}

        {/* Instructions - only show if no media yet */}
        {media.length === 0 && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>{t('camera.title')}</Text>
            <Text style={styles.instructionText}>
              {t('camera.subtitle')}
            </Text>
          </View>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>{t('camera.capturedMedia')} ({media.length})</Text>
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
                  {item.type === 'image' && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setEditingMediaIndex(index)}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                  {item.type === 'video' && (
                    <View style={styles.videoBadge}>
                      <Text style={styles.videoBadgeText}>VIDEO</Text>
                    </View>
                  )}
                  {item.hasBlur && (
                    <View style={styles.blurBadge}>
                      <Text style={styles.blurBadgeText}>🔲</Text>
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
            <Text style={styles.cameraButtonText}>{t('camera.takeAnotherPhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraButton, styles.secondaryButton]}
            onPress={handleTakeVideo}
          >
            <Text style={styles.secondaryButtonText}>{t('camera.takeVideo')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraButton, styles.secondaryButton]}
            onPress={handleSelectFromGallery}
          >
            <Text style={styles.secondaryButtonText}>{t('camera.chooseFromGallery')}</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        {media.length > 0 && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{t('camera.continueToForm')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Media Editor */}
      {editingMediaIndex !== null && media[editingMediaIndex] && (
        <MediaEditor
          visible={true}
          imageUri={media[editingMediaIndex].uri}
          onSave={(editedUri: string, hasBlur: boolean) => {
            updateDraftMedia(editingMediaIndex, {
              ...media[editingMediaIndex],
              uri: editedUri,
              hasBlur,
            });
            setEditingMediaIndex(null);
          }}
          onCancel={() => setEditingMediaIndex(null)}
        />
      )}

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
              {previewMedia.type === 'video' ? (
                <Video
                  source={{ uri: previewMedia.uri }}
                  style={styles.previewVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                />
              ) : (
                <Image 
                  source={{ uri: previewMedia.uri }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
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
  locationDeniedCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    alignItems: 'center',
  },
  locationDeniedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  locationDeniedText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  previewVideo: {
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
  editButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
  },
  blurBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBadgeText: {
    fontSize: 12,
  },
});

export default CameraScreen;
