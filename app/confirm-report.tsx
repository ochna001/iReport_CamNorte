import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { useLanguage } from '../contexts/LanguageProvider';
import { useReportDraft } from '../contexts/ReportDraftProvider';
import { formatPhilippineAddress, reverseGeocodeWithOSM } from '../lib/geocoding';
import { addToQueue, isOnline } from '../lib/offlineQueue';
import { supabase } from '../lib/supabase';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

const ConfirmReportScreen = () => {
  const router = useRouter();
  const { session, isGuestMode, signInAnonymously } = useAuth();
  const { draft, clearDraft, deleteSavedDraft } = useReportDraft();
  const { agency, draftId } = useLocalSearchParams<{ agency: Agency; draftId?: string }>();
  const { t } = useLanguage();

  // Get data from draft context
  const { media, latitude, longitude, reporterLatitude, reporterLongitude, name, age, description, phone } = draft;
  const mediaUris = JSON.stringify(media.map(m => m.uri));

  const [address, setAddress] = useState<string>('Loading address...');
  const [submitting, setSubmitting] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const timestamp = new Date();

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      if (!latitude || !longitude) {
        setAddress('Location not available');
        return;
      }
      const lat = latitude;
      const lon = longitude;
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
        return t('confirm.crimeReport');
      case 'BFP':
        return t('confirm.fireReport');
      case 'PDRRMO':
        return t('confirm.disasterReport');
      default:
        return t('confirm.incidentReport');
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
          t('confirm.noInternet'),
          t('confirm.offlineMessage'),
          [
            {
              text: 'OK',
              onPress: async () => {
                await addToQueue({
                  agency,
                  name,
                  age,
                  description,
                  latitude: latitude?.toString() || '0',
                  longitude: longitude?.toString() || '0',
                  reporterLatitude: reporterLatitude?.toString(),
                  reporterLongitude: reporterLongitude?.toString(),
                  address,
                  mediaUris,
                });
                
                // Clear draft after queuing
                await clearDraft();

                // If this report came from a saved draft, remove it from the drafts list
                if (draftId) {
                  await deleteSavedDraft(draftId as string);
                }
                
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
        Alert.alert(t('confirm.tooManyFiles'), t('confirm.maxFiles'));
        setSubmitting(false);
        return;
      }

      // Check for duplicate reports (same location, description, agency within last 5 minutes)
      if (latitude && longitude) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: existingReports } = await supabase
          .from('incidents')
          .select('id, description, created_at')
          .eq('agency_type', agency.toLowerCase())
          .gte('created_at', fiveMinutesAgo)
          .gte('latitude', latitude - 0.001) // ~100m radius
          .lte('latitude', latitude + 0.001)
          .gte('longitude', longitude - 0.001)
          .lte('longitude', longitude + 0.001);

        if (existingReports && existingReports.length > 0) {
          // Check if description is similar (simple check)
          const similarReport = existingReports.find(r => 
            r.description.toLowerCase().includes(description.toLowerCase().substring(0, 20)) ||
            description.toLowerCase().includes(r.description.toLowerCase().substring(0, 20))
          );
          
          if (similarReport) {
            Alert.alert(
              t('confirm.duplicateTitle'),
              t('confirm.duplicateMessage'),
              [
                { text: t('common.cancel'), style: 'cancel', onPress: () => setSubmitting(false) },
                { text: t('confirm.submitAnyway'), onPress: () => proceedWithSubmission() },
              ]
            );
            return;
          }
        }
      }

      await proceedWithSubmission();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(t('confirm.error'), t('confirm.errorMessage'));
      setSubmitting(false);
    }
  };

  const proceedWithSubmission = async () => {
    try {
      // Get or create reporter ID
      let reporterId = session?.user?.id || null;
      if (isGuestMode && !session) {
        try {
          await signInAnonymously();
          const { data: { session: newSession } } = await supabase.auth.getSession();
          reporterId = newSession?.user?.id || null;
          console.log('Created anonymous session for report submission:', reporterId);
        } catch (authError) {
          console.error('Failed to create anonymous session:', authError);
        }
      }

      // 1. Upload media files to Supabase Storage
      const uploadedMediaUrls: string[] = [];
      
      for (const mediaItem of media) {
        // Get file extension from URI, handling query params
        const uriWithoutParams = mediaItem.uri.split('?')[0];
        let fileExt = uriWithoutParams.split('.').pop()?.toLowerCase() || 'jpg';
        
        // Normalize extension
        if (fileExt === 'jpeg') fileExt = 'jpg';
        
        // Determine content type based on media type
        let contentType: string;
        if (mediaItem.type === 'video') {
          // Common video extensions and their MIME types
          const videoMimeTypes: Record<string, string> = {
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            'webm': 'video/webm',
            '3gp': 'video/3gpp',
          };
          contentType = videoMimeTypes[fileExt] || 'video/mp4';
          // Ensure video has proper extension
          if (!['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp'].includes(fileExt)) {
            fileExt = 'mp4';
          }
        } else {
          // Image MIME types
          const imageMimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'heic': 'image/heic',
            'heif': 'image/heif',
          };
          contentType = imageMimeTypes[fileExt] || 'image/jpeg';
          // Ensure image has proper extension
          if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileExt)) {
            fileExt = 'jpg';
          }
        }
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `incidents/${fileName}`;

        // Read file as ArrayBuffer for React Native
        const response = await fetch(mediaItem.uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        console.log(`Uploading ${mediaItem.type}: ${fileName} (${contentType})`);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-media')
          .upload(filePath, fileData, {
            contentType: contentType,
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

        console.log(`Uploaded successfully: ${urlData.publicUrl}`);
        uploadedMediaUrls.push(urlData.publicUrl);
      }

      // 2. Create incident record
      const incidentData: any = {
        agency_type: agency.toLowerCase(),
        reporter_id: reporterId,
        reporter_name: name,
        reporter_age: parseInt(age),
        description: description,
        latitude: latitude,
        longitude: longitude,
        reporter_latitude: reporterLatitude,
        reporter_longitude: reporterLongitude,
        location_address: address,
        media_urls: uploadedMediaUrls,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      
      // Add phone for guest reporters
      if (phone && phone.trim()) {
        incidentData.reporter_phone = phone.trim();
      }
      
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();

      if (incidentError) throw incidentError;

      // 3. Auto-assign to nearest station
      let assignedStationName: string | null = null;
      try {
        // Get agency_id for the agency type
        const agencyIdMap: Record<string, number> = {
          'pnp': 1,
          'bfp': 2,
          'pdrrmo': 3,
        };
        const agencyId = agencyIdMap[agency.toLowerCase()];
        
        if (agencyId && latitude && longitude) {
          // Call the find_nearest_station function
          // RPC returns: station_id, station_name, distance_km
          const { data: nearestStation, error: stationError } = await supabase
            .rpc('find_nearest_station', {
              incident_lat: latitude,
              incident_lon: longitude,
              target_agency_id: agencyId,
            })
            .single<{ station_id: number; station_name: string; distance_km: number }>();

          if (!stationError && nearestStation && nearestStation.station_id) {
            // Update incident with assigned station
            await supabase
              .from('incidents')
              .update({ 
                assigned_station_id: nearestStation.station_id,
                status: 'assigned'
              })
              .eq('id', incident.id);
            
            // Add status history entry for auto-assignment
            await supabase
              .from('incident_status_history')
              .insert({
                incident_id: incident.id,
                status: 'assigned',
                notes: `Auto-assigned to ${nearestStation.station_name} (${nearestStation.distance_km?.toFixed(2)} km away)`,
                changed_by: 'System',
              });
            
            assignedStationName = nearestStation.station_name;
            console.log(`Auto-assigned to station: ${nearestStation.station_name} (${nearestStation.distance_km?.toFixed(2)} km away)`);
          }
        }
      } catch (assignError) {
        // Don't fail the submission if auto-assignment fails
        console.warn('Auto-assignment failed:', assignError);
      }

      // 4. Clear draft after successful submission
      await clearDraft();

      // If this report came from a saved draft, remove it from the drafts list
      if (draftId) {
        await deleteSavedDraft(draftId as string);
      }

      // 5. Navigate to success screen
      router.replace({
        pathname: '/report-success',
        params: {
          incidentId: incident.id,
          agency: agency,
          assignedStation: assignedStationName || '',
        },
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Handle specific error types
      let errorTitle = t('confirm.submissionFailed');
      let errorMessage = t('confirm.tryAgain');
      
      if (error.message?.includes('Rate limit exceeded')) {
        errorTitle = t('confirm.tooManyReports');
        errorMessage = t('confirm.rateLimitMessage');
      } else if (error.message?.includes('Invalid')) {
        errorTitle = t('confirm.invalidData');
        errorMessage = error.message;
      } else if (error.message?.includes('too long')) {
        errorTitle = t('confirm.contentTooLong');
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
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('confirm.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('confirm.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('confirm.summary')}</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('confirm.reportType')}:</Text>
            <Text style={styles.summaryValue}>{getAgencyName()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('confirm.location')}:</Text>
            <Text style={styles.summaryValue}>{address}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('confirm.dateTime')}:</Text>
            <Text style={styles.summaryValue}>
              {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('confirm.evidence')}:</Text>
            <Text style={styles.summaryValue}>
              {media.filter(m => m.type === 'image').length} photo(s), {media.filter(m => m.type === 'video').length} video(s)
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('confirm.reporter')}:</Text>
            <Text style={styles.summaryValue}>{name}, {age} years old</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionLabel}>{t('confirm.description')}:</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={styles.mediaCard}>
            <Text style={styles.mediaLabel}>{t('confirm.evidence')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.mediaGrid}>
                {media.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.mediaThumbnailWrapper}
                    onPress={() => setPreviewMedia(item)}
                  >
                    <Image 
                      source={{ uri: item.uri }} 
                      style={styles.mediaThumbnail}
                    />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <Text style={styles.videoIcon}>▶</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
            <Text style={styles.editButtonText}>{t('confirm.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button, 
              styles.submitButton, 
              { backgroundColor: getAgencyColor() },
              (!confirmed || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!confirmed || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{t('confirm.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Confirmation Checkbox */}
        <TouchableOpacity 
          style={styles.confirmationRow}
          onPress={() => setConfirmed(!confirmed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.confirmationText}>
            {t('confirm.agreement')}
          </Text>
        </TouchableOpacity>
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
  mediaThumbnailWrapper: {
    position: 'relative',
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.text.secondary,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmationText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
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

export default ConfirmReportScreen;
