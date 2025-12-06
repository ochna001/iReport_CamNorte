import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { useReportDraft } from '../../contexts/ReportDraftProvider';
import { getQueue, processQueue, QueuedIncident } from '../../lib/offlineQueue';
import { supabase } from '../../lib/supabase';

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
  const { session, isAnonymous, deviceId, isOffline } = useAuth();
  const { t } = useLanguage();
  const { savedDrafts, loadDraftFromList, deleteSavedDraft } = useReportDraft();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'agency'>('date');
  const [pendingReports, setPendingReports] = useState<QueuedIncident[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchIncidents();
    fetchPendingReports();
  }, []);

  useEffect(() => {
    sortIncidents();
  }, [sortBy]);

  // Fetch pending offline reports
  const fetchPendingReports = async () => {
    const queue = await getQueue();
    setPendingReports(queue);
  };

  // Manual sync function
  const handleManualSync = async () => {
    if (isOffline) {
      Alert.alert('No Connection', 'Please connect to the internet to sync your reports.');
      return;
    }

    if (pendingReports.length === 0) {
      Alert.alert('No Pending Reports', 'All your reports are already synced.');
      return;
    }

    setSyncing(true);
    try {
      const result = await processQueue(
        (current, total) => console.log(`Syncing ${current}/${total}`),
        (id) => console.log(`Successfully synced: ${id}`),
        (id, error) => console.error(`Failed to sync ${id}:`, error)
      );

      if (result.successful > 0) {
        Alert.alert(
          'Sync Complete',
          `${result.successful} report${result.successful > 1 ? 's' : ''} synced successfully.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`
        );
        fetchIncidents();
        fetchPendingReports();
      } else if (result.failed > 0) {
        Alert.alert('Sync Failed', 'Could not sync reports. Please try again later.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Error', 'An error occurred while syncing.');
    } finally {
      setSyncing(false);
    }
  };

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

      // For guest users, only fetch reports by their current session ID
      // Note: Guest reports are tied to the anonymous session, not the device
      // If guest logs out, they lose access to their reports
      if (isAnonymous) {
        const { data, error } = await query.eq('reporter_id', session.user.id);
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
      // For guest users, silently handle the error since they may not have any reports yet
      // For authenticated users, show an alert
      if (!isAnonymous) {
        Alert.alert('Error', 'Failed to load your reports');
      }
      // Set empty array for guest users to show empty state gracefully
      setIncidents([]);
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

  const handleContinueDraft = (draft: SavedDraft) => {
    loadDraftFromList(draft.id);
    router.push({
      pathname: '/incident-form',
      params: { agency: draft.agency || 'PNP' },
    });
  };

  const handleDeleteDraft = (draft: SavedDraft) => {
    Alert.alert(
      'Delete Draft?',
      'Are you sure you want to delete this draft? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSavedDraft(draft.id),
        },
      ]
    );
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
        <View style={styles.loadingWrapper}>
          <Text style={styles.loadingText}>Loading Your Reports...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <AppHeader />

      {/* Pending Reports Section */}
      {pendingReports.length > 0 && (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingTitle}>
              📤 {pendingReports.length} Pending Report{pendingReports.length > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
              onPress={handleManualSync}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.syncButtonText}>Sync Now</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.pendingSubtext}>
            {isOffline 
              ? 'Connect to internet to sync these reports'
              : 'Tap "Sync Now" to upload pending reports'}
          </Text>
          {pendingReports.slice(0, 3).map((report, index) => (
            <View key={report.id} style={styles.pendingItem}>
              <Text style={styles.pendingItemAgency}>
                {report.agency === 'PNP' ? '🚔' : report.agency === 'BFP' ? '🔥' : '🌊'} {report.agency}
              </Text>
              <Text style={styles.pendingItemDesc} numberOfLines={1}>
                {report.description}
              </Text>
            </View>
          ))}
          {pendingReports.length > 3 && (
            <Text style={styles.pendingMore}>
              +{pendingReports.length - 3} more pending...
            </Text>
          )}
        </View>
      )}

      {/* Saved Drafts Section */}
      {savedDrafts.length > 0 && (
        <View style={styles.draftsSection}>
          <Text style={styles.draftsTitle}>📝 Saved Drafts ({savedDrafts.length})</Text>
          <Text style={styles.draftsSubtext}>Continue where you left off</Text>
          {savedDrafts.map((draft) => (
            <View key={draft.id} style={styles.draftItem}>
              <View style={styles.draftInfo}>
                <View style={[styles.draftAgencyBadge, { backgroundColor: getAgencyColor(draft.agency?.toLowerCase() || 'pnp') }]}>
                  <Text style={styles.draftAgencyText}>
                    {draft.agency === 'PNP' ? '🚔' : draft.agency === 'BFP' ? '🔥' : '🌊'} {draft.agency || 'Unknown'}
                  </Text>
                </View>
                <Text style={styles.draftDesc} numberOfLines={1}>
                  {draft.description || 'No description'}
                </Text>
                <Text style={styles.draftMeta}>
                  {draft.media.length} media • {new Date(draft.savedAt).toLocaleDateString()}
                </Text>
                {draft.address && (
                  <Text style={styles.draftLocation} numberOfLines={1}>📍 {draft.address}</Text>
                )}
              </View>
              <View style={styles.draftActions}>
                <TouchableOpacity 
                  style={styles.draftContinueBtn}
                  onPress={() => handleContinueDraft(draft)}
                >
                  <Text style={styles.draftContinueText}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.draftDeleteBtn}
                  onPress={() => handleDeleteDraft(draft)}
                >
                  <Text style={styles.draftDeleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

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
          <Text style={styles.emptyTitle}>{t('reports.noReports')}</Text>
          <Text style={styles.emptyText}>
            {t('reports.noReportsDesc')}
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
  loadingWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  loadingText: {
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
  // Pending reports styles
  pendingSection: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  syncButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingSubtext: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 12,
  },
  pendingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingItemAgency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginRight: 8,
    minWidth: 50,
  },
  pendingItemDesc: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  pendingMore: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  draftsSection: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  draftsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  draftsSubtext: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 12,
  },
  draftItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftInfo: {
    flex: 1,
  },
  draftAgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  draftAgencyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  draftDesc: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  draftMeta: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  draftLocation: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  draftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  draftContinueBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  draftContinueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  draftDeleteBtn: {
    padding: 6,
  },
  draftDeleteText: {
    fontSize: 16,
  },
});
