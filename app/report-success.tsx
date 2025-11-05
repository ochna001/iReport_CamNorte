import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

const ReportSuccessScreen = () => {
  const router = useRouter();
  const { incidentId, agency, offline } = useLocalSearchParams<{
    incidentId: string;
    agency: Agency;
    offline?: string;
  }>();

  const isOffline = offline === 'true';

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
        return 'Philippine National Police';
      case 'BFP':
        return 'Bureau of Fire Protection';
      case 'PDRRMO':
        return 'Disaster Risk Reduction Office';
      default:
        return 'Emergency Services';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: getAgencyColor() }]}>
          <Text style={styles.iconText}>✓</Text>
        </View>
      </View>

      {/* Success Message */}
      <Text style={styles.title}>{isOffline ? 'Report Queued!' : 'Report Submitted!'}</Text>
      <Text style={styles.subtitle}>
        {isOffline 
          ? `Your report has been saved and will be automatically submitted to ${getAgencyName()} when you're back online.`
          : `Your report has been successfully submitted to ${getAgencyName()}.`
        }
      </Text>

      {/* Tracking Info */}
      {!isOffline && (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumber}>#{incidentId?.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.trackingHint}>
            Save this number to track your report status
          </Text>
        </View>
      )}

      {/* Offline Notice */}
      {isOffline && (
        <View style={styles.offlineCard}>
          <Text style={styles.offlineIcon}>📡</Text>
          <Text style={styles.offlineTitle}>Saved Offline</Text>
          <Text style={styles.offlineText}>
            Your report is safely stored on your device and will be submitted automatically when internet connection is restored.
          </Text>
        </View>
      )}

      {/* What's Next */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <View style={styles.infoStep}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>
            Your report is being reviewed by the desk officer
          </Text>
        </View>
        <View style={styles.infoStep}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>
            A field officer will be assigned to respond
          </Text>
        </View>
        <View style={styles.infoStep}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>
            You'll receive updates on your report status
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { backgroundColor: getAgencyColor() }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.primaryButtonText}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            router.replace('/(tabs)/reports');
          }}
        >
          <Text style={styles.secondaryButtonText}>View My Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Note */}
      <View style={styles.emergencyNote}>
        <Text style={styles.emergencyText}>
          🚨 In case of immediate emergency, please call the hotline directly
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 55,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  trackingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  trackingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  trackingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  trackingHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
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
  primaryButton: {
    // backgroundColor set dynamically
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  emergencyNote: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  emergencyText: {
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 18,
  },
  offlineCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  offlineIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#78350f',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReportSuccessScreen;
