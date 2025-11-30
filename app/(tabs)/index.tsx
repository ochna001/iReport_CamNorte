import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { supabase } from '../../lib/supabase';

interface Stats {
  totalReports: number;
  thisMonth: number;
  avgResponseTime: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { session, isOffline } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [statsMode, setStatsMode] = useState<'community' | 'personal'>('community');

  useEffect(() => {
    // Check user preference
    const metadata = session?.user?.user_metadata;
    setShowStats(metadata?.show_home_stats !== false);
    
    // Don't fetch stats if offline
    if (isOffline) {
      setLoadingStats(false);
      return;
    }
    
    if (metadata?.show_home_stats !== false) {
      fetchStats();
    } else {
      setLoadingStats(false);
    }
  }, [session, statsMode, isOffline]);

  const calculateAvgResponseTime = (incidents: any[]): string => {
    if (!incidents || incidents.length === 0) return 'N/A';

    const responseTimes: number[] = [];
    
    incidents.forEach(incident => {
      // Only count incidents that have been responded to (Assigned, On-Scene, Resolved, Closed)
      // and have a first_response_at timestamp
      if (incident.created_at && incident.first_response_at) {
        const created = new Date(incident.created_at).getTime();
        const responded = new Date(incident.first_response_at).getTime();
        const diffMinutes = Math.floor((responded - created) / (1000 * 60));
        
        // Only count valid response times (> 0 and < 48 hours)
        if (diffMinutes > 0 && diffMinutes < 2880) {
          responseTimes.push(diffMinutes);
        }
      }
    });

    if (responseTimes.length === 0) return 'N/A';

    const avgMinutes = Math.floor(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    
    if (avgMinutes < 60) {
      return `${avgMinutes} min`;
    } else {
      const hours = Math.floor(avgMinutes / 60);
      const mins = avgMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const fetchStats = async () => {
    try {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      if (statsMode === 'community') {
        // Get total reports count
        const { count: totalCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true });

        // Get this month's reports
        const { count: monthCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString());

        // Get incidents with response times for calculation
        const { data: incidentsData } = await supabase
          .from('incidents')
          .select('created_at, first_response_at, status')
          .not('first_response_at', 'is', null)
          .limit(100);

        setStats({
          totalReports: totalCount || 0,
          thisMonth: monthCount || 0,
          avgResponseTime: calculateAvgResponseTime(incidentsData || []),
        });
      } else {
        // Personal stats - user's own reports
        const userId = session?.user?.id;
        if (!userId) {
          setStats({ totalReports: 0, thisMonth: 0, avgResponseTime: 'N/A' });
          return;
        }

        const { count: totalCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('reporter_id', userId);

        const { count: monthCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('reporter_id', userId)
          .gte('created_at', firstDayOfMonth.toISOString());

        // Get user's incidents with response times
        const { data: userIncidents } = await supabase
          .from('incidents')
          .select('created_at, first_response_at, status')
          .eq('reporter_id', userId)
          .not('first_response_at', 'is', null);

        setStats({
          totalReports: totalCount || 0,
          thisMonth: monthCount || 0,
          avgResponseTime: calculateAvgResponseTime(userIncidents || []),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleReportPress = (agency: 'PNP' | 'BFP' | 'PDRRMO') => {
    router.push({
      pathname: '/camera',
      params: { agency },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <AppHeader />

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            📡 You're offline - Reports will be saved and synced when connected
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Stats Section */}
        {showStats && (
          <View style={styles.statsSection}>
            <View style={styles.statsTitleRow}>
              <Text style={styles.sectionTitle}>
                📊 {statsMode === 'community' ? 'Community' : 'My'} Statistics
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setStatsMode(statsMode === 'community' ? 'personal' : 'community')}
              >
                <Text style={styles.toggleButtonText}>
                  {statsMode === 'community' ? '👤 My Stats' : '🌐 Community'}
                </Text>
              </TouchableOpacity>
            </View>
            {loadingStats ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : stats ? (
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statCardSmall, styles.statCardBlue]}>
                  <Text style={[styles.statNumber, styles.statNumberSmall, styles.statNumberBlue]}>{stats.totalReports.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total{"\n"}Reports</Text>
                </View>
                <View style={[styles.statCard, styles.statCardSmall, styles.statCardGreen]}>
                  <Text style={[styles.statNumber, styles.statNumberSmall, styles.statNumberGreen]}>{stats.thisMonth}</Text>
                  <Text style={styles.statLabel}>This{"\n"}Month</Text>
                </View>
                <View style={[styles.statCard, styles.statCardLarge, styles.statCardPurple]}>
                  <Text style={[styles.statNumber, styles.statNumberLarge, styles.statNumberPurple]}>{stats.avgResponseTime}</Text>
                  <Text style={styles.statLabel}>Average Response Time</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        <Text style={styles.prompt}>What do you need to report?</Text>
        <Text style={styles.hintText}>Tap a button below to start your report</Text>
        
        <View style={styles.buttonContainer}>
          {/* PNP Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.pnpButton]}
            onPress={() => handleReportPress('PNP')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Report Crime</Text>
                <Text style={styles.buttonSubtitle}>Philippine National Police (PNP)</Text>
              </View>
              <Text style={styles.tapHint}>Tap to report →</Text>
            </View>
          </TouchableOpacity>

          {/* BFP Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.bfpButton]}
            onPress={() => handleReportPress('BFP')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Report Fire</Text>
                <Text style={styles.buttonSubtitle}>Bureau of Fire Protection (BFP)</Text>
              </View>
              <Text style={styles.tapHint}>Tap to report →</Text>
            </View>
          </TouchableOpacity>

          {/* PDRRMO Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.pdrrmoButton]}
            onPress={() => handleReportPress('PDRRMO')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Report Disaster</Text>
                <Text style={styles.buttonSubtitle}>Disaster Risk Reduction Management Office</Text>
              </View>
              <Text style={styles.tapHint}>Tap to report →</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  offlineBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  offlineBannerText: {
    color: '#856404',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  reportButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pnpButton: {
    backgroundColor: Colors.agencies.pnp,
  },
  bfpButton: {
    backgroundColor: Colors.agencies.bfp,
  },
  pdrrmoButton: {
    backgroundColor: Colors.agencies.pdrrmo,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  buttonTextContainer: {
    flex: 1,
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginLeft: 12,
  },
  hintText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    marginTop: -8,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.secondary,
    minHeight: 85,
  },
  statCardSmall: {
    flex: 1,
  },
  statCardLarge: {
    flex: 1.5,
  },
  statCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  statCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  statCardPurple: {
    backgroundColor: '#faf5ff',
    borderColor: '#a855f7',
  },
  statNumber: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
    width: '100%',
    textAlign: 'center',
  },
  statNumberSmall: {
    fontSize: 22,
  },
  statNumberLarge: {
    fontSize: 22,
  },
  statNumberBlue: {
    color: '#2563eb',
  },
  statNumberGreen: {
    color: '#16a34a',
  },
  statNumberPurple: {
    color: '#9333ea',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    width: '100%',
    textAlign: 'center',
    lineHeight: 14,
  },
});
