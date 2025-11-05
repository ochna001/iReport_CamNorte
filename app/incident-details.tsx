import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react-native';
import LocationCard from './components/LocationCard';

interface Incident {
  id: string;
  agency_type: string;
  description: string;
  status: string;
  location_address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  media_urls: string[];
  reporter_id: string;
  // Agency-specific fields
  crime_type?: string;
  suspect_description?: string;
  fire_type?: string;
  estimated_damage?: string;
  disaster_type?: string;
  affected_count?: number;
}

const { width } = Dimensions.get('window');

export default function IncidentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (incidentId) {
      fetchIncidentDetails();
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
    } catch (error: any) {
      console.error('Error fetching incident:', error);
      Alert.alert('Error', 'Failed to load incident details', [
        { text: 'Go Back', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.loadingText}>Loading incident details...</Text>
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
        {incident.media_urls && incident.media_urls.length > 0 && (
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
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
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

        {/* Location */}
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
          title="🚨 Incident Location"
        />

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.text.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Reported On</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(incident.created_at)}</Text>
          <View style={styles.timeRow}>
            <Clock size={16} color={Colors.text.secondary} strokeWidth={2} />
            <Text style={styles.timeText}>{formatTime(incident.created_at)}</Text>
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

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>Pending</Text>
                <Text style={styles.timelineDate}>{formatDate(incident.created_at)}</Text>
              </View>
            </View>
            {incident.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(incident.status) }]} />
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
  mediaImage: {
    width: width,
    height: 300,
    backgroundColor: Colors.secondary,
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
