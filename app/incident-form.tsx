import { ResizeMode, Video } from 'expo-av';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { useLanguage } from '../contexts/LanguageProvider';
import { useReportDraft } from '../contexts/ReportDraftProvider';
import { supabase } from '../lib/supabase';
import LocationCard from './components/LocationCard';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

const IncidentFormScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { agency } = useLocalSearchParams<{
    agency: Agency;
  }>();

  // Use draft context for persisting form data
  const { 
    draft, 
    setName: setDraftName, 
    setAge: setDraftAge, 
    setPhone: setDraftPhone, 
    setDescription: setDraftDescription,
    removeMedia: removeDraftMedia,
    clearDraft,
    saveDraftToList,
    hasDraft
  } = useReportDraft();

  const { session, isAnonymous } = useAuth();
  
  // Use draft values for form fields
  const [description, setDescription] = useState(draft.description);
  const [name, setName] = useState(draft.name);
  const [age, setAge] = useState(draft.age);
  const [phone, setPhone] = useState(draft.phone);
  
  // Guest users need to provide contact info
  const isGuest = !session || isAnonymous;
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [residentLocation, setResidentLocation] = useState<Location.LocationObject | null>(null);
  const [incidentLocation, setIncidentLocation] = useState<Location.LocationObject | null>(null);
  const [currentDateTime] = useState(new Date());

  useEffect(() => {
    // Get resident's current location
    getCurrentLocation();
    // Set incident location from draft
    if (draft.latitude && draft.longitude) {
      setIncidentLocation({
        coords: {
          latitude: draft.latitude,
          longitude: draft.longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }
    
    // Auto-fill name and calculate age from DOB if logged in (only if draft is empty)
    const fetchUserProfile = async () => {
      if (session?.user && !draft.name) {
        // Try metadata first
        const metadata = session.user.user_metadata;
        if (metadata?.full_name) {
          setName(metadata.full_name);
          setDraftName(metadata.full_name);
        }
        
        // Calculate age from date of birth
        if (metadata?.date_of_birth && !draft.age) {
          const dob = new Date(metadata.date_of_birth);
          const today = new Date();
          const ageVal = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? ageVal - 1 : ageVal;
          setAge(actualAge.toString());
          setDraftAge(actualAge.toString());
        }
        
        // Fallback: fetch from profiles table if metadata missing
        if (!metadata?.full_name || !metadata?.date_of_birth) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, date_of_birth')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            if (!metadata?.full_name && profile.display_name) {
              setName(profile.display_name);
              setDraftName(profile.display_name);
            }
            if (!metadata?.date_of_birth && profile.date_of_birth && !draft.age) {
              const dob = new Date(profile.date_of_birth);
              const today = new Date();
              const ageVal = today.getFullYear() - dob.getFullYear();
              const monthDiff = today.getMonth() - dob.getMonth();
              const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? ageVal - 1 : ageVal;
              setAge(actualAge.toString());
              setDraftAge(actualAge.toString());
            }
          }
        }
      }
    };
    
    fetchUserProfile();
  }, [draft.latitude, draft.longitude, session]);

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setResidentLocation(loc);
    } catch (error) {
      console.error('Error getting resident location:', error);
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
        return t('form.crimeReport');
      case 'BFP':
        return t('form.fireReport');
      case 'PDRRMO':
        return t('form.disasterReport');
      default:
        return t('form.incidentReport');
    }
  };

  const getSuggestedDescriptions = () => {
    switch (agency) {
      case 'PNP':
        return [
          t('form.crime.theft'),
          t('form.crime.assault'),
          t('form.crime.vandalism'),
          t('form.crime.drugs'),
          t('form.crime.domestic'),
        ];
      case 'BFP':
        return [
          t('form.fire.building'),
          t('form.fire.vehicle'),
          t('form.fire.electrical'),
          t('form.fire.grass'),
          t('form.fire.smoke'),
          t('form.fire.gas'),
        ];
      case 'PDRRMO':
        return [
          t('form.disaster.flood'),
          t('form.disaster.landslide'),
          t('form.disaster.tree'),
          t('form.disaster.storm'),
          t('form.disaster.powerlines'),
          t('form.disaster.earthquake'),
        ];
      default:
        return [];
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setDescription(suggestion);
    setDraftDescription(suggestion);
    setShowSuggestions(false);
  };

  const handleBack = () => {
    // Check if there's any data to save
    if (hasDraft) {
      Alert.alert(
        'Save Draft?',
        'Would you like to save this report as a draft? You can continue it later from My Reports.',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              await clearDraft();
              router.back();
            },
          },
          {
            text: 'Save Draft',
            onPress: async () => {
              // Get address for the draft if location is available
              let address: string | undefined;
              if (incidentLocation) {
                try {
                  const { formatPhilippineAddress, reverseGeocodeWithOSM } = await import('../lib/geocoding');
                  const result = await reverseGeocodeWithOSM(
                    incidentLocation.coords.latitude,
                    incidentLocation.coords.longitude
                  );
                  address = formatPhilippineAddress(result.formattedAddress);
                } catch (e) {
                  // Ignore geocoding errors
                }
              }
              await saveDraftToList(address);
              router.back();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    // Validate name
    if (!name.trim()) {
      Alert.alert(t('common.required'), t('form.error.nameRequired'));
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert(t('form.validationError'), t('form.error.nameTooShort'));
      return;
    }
    if (name.length > 100) {
      Alert.alert(t('form.validationError'), t('form.error.nameTooLong'));
      return;
    }
    
    // Validate age
    if (!age.trim() || isNaN(parseInt(age))) {
      Alert.alert(t('common.required'), t('form.error.ageRequired'));
      return;
    }
    const ageNum = parseInt(age);
    if (ageNum < 13 || ageNum > 120) {
      Alert.alert(t('form.validationError'), t('form.error.ageInvalid'));
      return;
    }
    
    // Validate phone for guests (required)
    if (isGuest) {
      if (!phone.trim()) {
        Alert.alert(t('common.required'), t('form.error.phoneRequired'));
        return;
      }
      // Basic Philippine phone validation (09XX or +639XX)
      const phoneClean = phone.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+63|0)?9\d{9}$/;
      if (!phoneRegex.test(phoneClean)) {
        Alert.alert(t('form.validationError'), t('form.error.phoneInvalid'));
        return;
      }
    }
    
    // Validate description
    if (!description.trim()) {
      Alert.alert(t('common.required'), t('form.error.descriptionRequired'));
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert(t('form.validationError'), t('form.error.descriptionTooShort'));
      return;
    }
    if (description.length > 5000) {
      Alert.alert(t('form.validationError'), t('form.error.descriptionTooLong'));
      return;
    }

    // Save form data to draft before navigating
    setDraftName(name);
    setDraftAge(age);
    setDraftPhone(phone);
    setDraftDescription(description);

    // Navigate to confirmation screen
    router.push({
      pathname: '/confirm-report',
      params: {
        agency,
      },
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getAgencyColor() }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getAgencyName()}</Text>
          <Text style={styles.headerSubtitle}>{t('form.incidentDetails')}</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Report Information */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>{t('form.reportInfo')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoText}>{currentDateTime.toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoText}>
                {currentDateTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })} 
              </Text>
            </View>
            {draft.media.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Evidence:</Text>
                <Text style={styles.infoText}>
                  {draft.media.length} photo(s)/video(s)
                </Text>
              </View>
            )}
          </View>

          {/* Media Preview Section */}
          {draft.media.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>📸 {t('form.evidence')} ({draft.media.filter(m => m.type === 'image').length} {t('camera.photos')}, {draft.media.filter(m => m.type === 'video').length} {t('camera.videos')})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                {draft.media.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.mediaThumbnailContainer}
                    onPress={() => setPreviewMedia(item)}
                  >
                    <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <Text style={styles.videoIcon}>▶</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={() => removeDraftMedia(index)}
                    >
                      <Text style={styles.removeMediaText}>✕</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity 
                style={[styles.addMediaButton, { borderColor: getAgencyColor() }]}
                onPress={() => router.push({ pathname: '/camera', params: { agency } })}
              >
                <Text style={[styles.addMediaText, { color: getAgencyColor() }]}>+ {t('camera.takeAnotherPhoto')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resident Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('form.yourInfo')}</Text>
            
            <Text style={styles.label}>{t('form.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.enterFullName')}
              placeholderTextColor={Colors.text.secondary}
              value={name}
              onChangeText={(text) => { setName(text); setDraftName(text); }}
            />

            <Text style={styles.label}>{t('form.age')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.enterAge')}
              placeholderTextColor={Colors.text.secondary}
              value={age}
              onChangeText={(text) => { setAge(text); setDraftAge(text); }}
              keyboardType="numeric"
            />

            {/* Phone number - required for guests */}
            {isGuest && (
              <>
                <Text style={styles.label}>{t('form.contactNumber')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09171234567"
                  placeholderTextColor={Colors.text.secondary}
                  value={phone}
                  onChangeText={(text) => { setPhone(text); setDraftPhone(text); }}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
                <Text style={styles.helperText}>
                  {t('form.contactHelper')}
                </Text>
              </>
            )}
          </View>

          {/* Resident Location */}
          <LocationCard 
            location={residentLocation} 
            title={t('form.yourLocation')} 
          />

          {/* Incident Location */}
          <LocationCard 
            location={incidentLocation} 
            title={t('form.incidentLocation')}
            editable={true}
            onLocationChange={setIncidentLocation}
          />

          {/* Description */}
          <View style={styles.formSection}>
            <Text style={styles.label}>{t('form.description')}</Text>
            
            {/* Suggested Descriptions */}
            {showSuggestions && description === '' && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>{t('form.quickSelect')}</Text>
                <View style={styles.suggestionsGrid}>
                  {getSuggestedDescriptions().map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionChip, { borderColor: getAgencyColor() }]}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text style={[styles.suggestionText, { color: getAgencyColor() }]}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.suggestionsHelper}>{t('form.orTypeBelow')}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.textArea}
              placeholder={t('form.descriptionPlaceholder')}
              placeholderTextColor={Colors.text.secondary}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setDraftDescription(text);
                if (text === '') setShowSuggestions(true);
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? t('form.submitting') : t('form.reviewReport')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
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
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsHelper: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  mediaSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mediaScroll: {
    marginBottom: 12,
  },
  mediaThumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 24,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addMediaButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
});

export default IncidentFormScreen;
