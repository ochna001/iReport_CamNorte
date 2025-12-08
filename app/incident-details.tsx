import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, Calendar, Clock, FileText, MapPin, Phone, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useLanguage } from '../contexts/LanguageProvider';
import { supabase } from '../lib/supabase';
import LocationCard from './components/LocationCard';

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

interface Incident {
  id: string;
  agency_type: string;
  description: string;
  status: string;
  location_address: string;
  latitude: number;
  longitude: number;
  reporter_latitude?: number;
  reporter_longitude?: number;
  created_at: string;
  updated_at: string;
  media_urls: string[];
  reporter_id: string;
  assigned_station_id?: string;
  // Agency-specific fields
  crime_type?: string;
  suspect_description?: string;
  fire_type?: string;
  estimated_damage?: string;
  disaster_type?: string;
  affected_count?: number;
}

interface AssignedStation {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  latitude: number;
  longitude: number;
}

interface StatusHistoryItem {
  id: string;
  status: string;
  notes: string | null;
  changed_at: string;
  changed_by: string | null; // Now stores name directly as text
}

const { width } = Dimensions.get('window');

export default function IncidentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const incidentId = params.id as string;
  const { t } = useLanguage();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [assignedStation, setAssignedStation] = useState<AssignedStation | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);

  useEffect(() => {
    if (incidentId) {
      fetchIncidentDetails();
      fetchStatusHistory();
    }
  }, [incidentId]);

  const fetchIncidentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (error) throw error;

      setIncident(data);

      // Fetch assigned station if exists
      if (data.assigned_station_id) {
        fetchAssignedStation(data.assigned_station_id);
      }
    } catch (error: any) {
      console.error('Error fetching incident:', error);
      Alert.alert('Error', 'Failed to load incident details', [
        { text: 'Go Back', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedStation = async (stationId: string | number) => {
    try {
      const { data, error } = await supabase
        .from('agency_stations')
        .select('id, name, address, contact_number, latitude, longitude')
        .eq('id', stationId)
        .single();

      if (!error && data) {
        setAssignedStation(data);
      }
    } catch (error) {
      console.error('Error fetching station:', error);
    }
  };

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_status_history')
        .select('id, status, notes, changed_at, changed_by')
        .eq('incident_id', incidentId)
        .order('changed_at', { ascending: true });

      if (!error && data) {
        setStatusHistory(data as StatusHistoryItem[]);
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getAgencyColor = (agencyType: string) => {
    switch (agencyType) {
      case 'pnp':
        return Colors.agencies.pnp;
      case 'bfp':
        return Colors.agencies.bfp;
      case 'pdrrmo':
        return Colors.agencies.pdrrmo;
      default:
        return Colors.primary;
    }
  };

  const getAgencyName = (agencyType: string) => {
    switch (agencyType) {
      case 'pnp':
        return 'Philippine National Police';
      case 'bfp':
        return 'Bureau of Fire Protection';
      case 'pdrrmo':
        return 'PDRRMO';
      default:
        return 'Unknown Agency';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'assigned':
        return '#3b82f6';
      case 'in_progress':
        return '#8b5cf6';
      case 'resolved':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading incident details...  </Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Incident not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const agencyColor = getAgencyColor(incident.agency_type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: agencyColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Incident Report</Text>
          <Text style={styles.headerSubtitle}>
            ID: #{incident.id.substring(0, 8).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(incident.status)}</Text>
          </View>
        </View>

        {/* Media Gallery */}
        {incident.media_urls && incident.media_urls.length > 0 ? (
          <View style={styles.mediaSection}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setSelectedImageIndex(index);
              }}
            >
              {incident.media_urls.map((url, index) => (
                <View key={index} style={styles.mediaImageContainer}>
                  {isVideoUrl(url) ? (
                    <Video
                      source={{ uri: url }}
                      style={styles.mediaVideo}
                      useNativeControls
                      resizeMode={ResizeMode.COVER}
                      isLooping={false}
                      onError={(error) => console.log('Video load error:', error, 'URL:', url)}
                    />
                  ) : (
                    <Image
                      source={{ uri: url }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URL:', url)}
                    />
                  )}
                </View>
              ))}
            </ScrollView>
            {incident.media_urls.length > 1 && (
              <View style={styles.mediaPagination}>
                {incident.media_urls.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === selectedImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noMediaSection}>
            <Text style={styles.noMediaText}>No media attached</Text>
          </View>
        )}

        {/* Agency Info */}
        <View style={styles.section}>
          <View style={[styles.agencyBadge, { backgroundColor: agencyColor }]}>
            <Text style={styles.agencyBadgeText}>{getAgencyName(incident.agency_type)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={Colors.text.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>{incident.description}</Text>
        </View>

        {/* Incident Location */}
        <View style={styles.locationCardWrapper}>
          <LocationCard
            location={{
              coords: {
                latitude: incident.latitude,
                longitude: incident.longitude,
                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: new Date(incident.created_at).getTime(),
            }}
            title={t('details.incidentLocation')}
          />
        </View>

        {/* Reporter Location (if different from incident) */}
        {incident.reporter_latitude && incident.reporter_longitude && (
          <View style={styles.locationCardWrapper}>
            <LocationCard
              location={{
                coords: {
                  latitude: incident.reporter_latitude,
                  longitude: incident.reporter_longitude,
                  altitude: null,
                  accuracy: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: new Date(incident.created_at).getTime(),
              }}
              title={t('details.reporterLocation')}
            />
          </View>
        )}

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.text.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Reported On</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(incident.created_at)}</Text>
          <View style={styles.timeRow}>
            <Clock size={16} color={Colors.text.secondary} strokeWidth={2} />
            <Text style={styles.timeText}>{formatTime(incident.created_at)} </Text>
          </View>
        </View>

        {/* Agency-Specific Details */}
        {incident.agency_type === 'pnp' && (incident.crime_type || incident.suspect_description) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crime Details</Text>
            {incident.crime_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Crime Type:</Text>
                <Text style={styles.detailValue}>{incident.crime_type}</Text>
              </View>
            )}
            {incident.suspect_description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Suspect Description:</Text>
                <Text style={styles.detailValue}>{incident.suspect_description}</Text>
              </View>
            )}
          </View>
        )}

        {incident.agency_type === 'bfp' && (incident.fire_type || incident.estimated_damage) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fire Details</Text>
            {incident.fire_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fire Type:</Text>
                <Text style={styles.detailValue}>{incident.fire_type}</Text>
              </View>
            )}
            {incident.estimated_damage && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated Damage:</Text>
                <Text style={styles.detailValue}>{incident.estimated_damage}</Text>
              </View>
            )}
          </View>
        )}

        {incident.agency_type === 'pdrrmo' && (incident.disaster_type || incident.affected_count) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disaster Details</Text>
            {incident.disaster_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Disaster Type:</Text>
                <Text style={styles.detailValue}>{incident.disaster_type}</Text>
              </View>
            )}
            {incident.affected_count && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>People Affected:</Text>
                <Text style={styles.detailValue}>{incident.affected_count}</Text>
              </View>
            )}
          </View>
        )}

        {/* Assigned Station Info */}
        {assignedStation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building2 size={20} color={Colors.text.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Assigned Station</Text>
            </View>
            
            <Text style={styles.stationName}>{assignedStation.name}</Text>
            
            {assignedStation.address && (
              <View style={styles.stationRow}>
                <MapPin size={16} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.stationText}>{assignedStation.address}</Text>
              </View>
            )}
            
            {assignedStation.contact_number && (
              <TouchableOpacity 
                style={styles.stationRow}
                onPress={() => Linking.openURL(`tel:${assignedStation.contact_number}`)}
              >
                <Phone size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={[styles.stationText, styles.stationPhone]}>{assignedStation.contact_number}</Text>
              </TouchableOpacity>
            )}
            
            {incident.latitude && assignedStation.latitude && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Distance from incident:</Text>
                <Text style={styles.distanceValue}>
                  {calculateDistance(
                    incident.latitude, 
                    incident.longitude, 
                    assignedStation.latitude, 
                    assignedStation.longitude
                  ).toFixed(1)} km
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {/* Initial pending status */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>Report Submitted</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(incident.created_at)} at {formatTime(incident.created_at)}
                </Text>
              </View>
            </View>

            {/* Status history from database */}
            {statusHistory.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
                  {index < statusHistory.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{getStatusLabel(item.status)}</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(item.changed_at)} at {formatTime(item.changed_at)}
                  </Text>
                  {item.changed_by && (
                    <View style={styles.timelineOfficer}>
                      <User size={12} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.timelineOfficerText}>{item.changed_by}</Text>
                    </View>
                  )}
                  {item.notes && (
                    <View style={styles.timelineNotes}>
                      <Text style={styles.timelineNotesText}>"{item.notes}"</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Fallback if no history but status changed */}
            {statusHistory.length === 0 && incident.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: getStatusColor(incident.status) }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{getStatusLabel(incident.status)}</Text>
                  <Text style={styles.timelineDate}>{formatDate(incident.updated_at)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBackButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaImageContainer: {
    width: width,
    height: 300,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: width,
    height: 300,
    backgroundColor: Colors.secondary,
  },
  mediaVideo: {
    width: width,
    height: 300,
    backgroundColor: '#000',
  },
  noMediaSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    backgroundColor: Colors.secondary + '40',
    borderRadius: 12,
    alignItems: 'center',
  },
  noMediaText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  locationCardWrapper: {
    marginHorizontal: 16,
  },
  mediaPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  agencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  agencyBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.secondary,
    marginTop: 4,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  timelineOfficer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timelineOfficerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  timelineNotes: {
    backgroundColor: Colors.accent,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineNotesText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  // Station styles
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  stationPhone: {
    color: Colors.primary,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary,
  },
  distanceLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 32,
  },
});
