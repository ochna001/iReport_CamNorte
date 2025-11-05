import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';
import AppHeader from '../../components/AppHeader';

interface Incident {
  id: string;
  agency_type: string;
  description: string;
  status: string;
  location_address: string;
  created_at: string;
  media_urls: string[];
}

export default function ReportsScreen() {
  const router = useRouter();
  const { session, isAnonymous, deviceId } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'agency'>('date');

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    sortIncidents();
  }, [sortBy]);

  const fetchIncidents = async () => {
    try {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      // For guest users, also fetch reports by device_id
      if (isAnonymous && deviceId) {
        // Get reports by either reporter_id OR device_id stored in user metadata
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .or(`reporter_id.eq.${session.user.id},reporter_id.in.(select id from auth.users where raw_user_meta_data->>'device_id'='${deviceId}')`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIncidents(data || []);
      } else {
        // Regular user - just fetch by reporter_id
        const { data, error } = await query.eq('reporter_id', session.user.id);
        if (error) throw error;
        setIncidents(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching incidents:', error);
      Alert.alert('Error', 'Failed to load your reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const sortIncidents = () => {
    const sorted = [...incidents].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          const statusOrder = { pending: 0, assigned: 1, in_progress: 2, resolved: 3, closed: 4 };
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
        case 'agency':
          return a.agency_type.localeCompare(b.agency_type);
        default:
          return 0;
      }
    });
    setIncidents(sorted);
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
        return 'PNP';
      case 'bfp':
        return 'BFP';
      case 'pdrrmo':
        return 'PDRRMO';
      default:
        return 'Unknown';
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

  const handleUpgradeAccount = () => {
    router.push('/screens/SignUpScreen');
  };

  const renderIncident = ({ item }: { item: Incident }) => (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={() => {
        router.push({
          pathname: '/incident-details',
          params: { id: item.id },
        });
      }}
    >
      <View style={styles.incidentHeader}>
        <View style={[styles.agencyBadge, { backgroundColor: getAgencyColor(item.agency_type) }]}>
          <Text style={styles.agencyBadgeText}>{getAgencyName(item.agency_type)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.incidentDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <Text style={styles.incidentLocation} numberOfLines={1}>
        📍 {item.location_address || 'Location unavailable'}
      </Text>

      <View style={styles.incidentFooter}>
        <Text style={styles.incidentDate}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        {item.media_urls && item.media_urls.length > 0 && (
          <Text style={styles.incidentMedia}>📷 {item.media_urls.length} photo(s)</Text>
        )}
      </View>

      <Text style={styles.incidentId}>ID: #{item.id.substring(0, 8).toUpperCase()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <AppHeader />

      {/* Anonymous User Prompt */}
      {isAnonymous && (
        <View style={styles.upgradePrompt}>
          <Text style={styles.upgradeTitle}>🔒 Save Your Reports</Text>
          <Text style={styles.upgradeText}>
            Create an account to permanently save your reports and receive updates.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeAccount}>
            <Text style={styles.upgradeButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Options */}
      {incidents.length > 0 && (
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
              onPress={() => setSortBy('date')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
                Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'status' && styles.sortButtonActive]}
              onPress={() => setSortBy('status')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'status' && styles.sortButtonTextActive]}>
                Status
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'agency' && styles.sortButtonActive]}
              onPress={() => setSortBy('agency')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'agency' && styles.sortButtonTextActive]}>
                Agency
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reports List */}
      {incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyText}>
            You haven't submitted any incident reports. Tap the agency buttons on the home screen to report an incident.
          </Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          renderItem={renderIncident}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  upgradePrompt: {
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 12,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  incidentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  agencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  agencyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  incidentDescription: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  incidentLocation: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  incidentDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
    flexShrink: 1,
  },
  incidentMedia: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  incidentId: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
});
