import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

const HomeScreen = () => {
  const { session } = useAuth();
  const router = useRouter();

  const handleReportPress = (agency: 'PNP' | 'BFP' | 'PDRRMO') => {
    // Navigate to camera screen with agency parameter
    // For now, we'll just show an alert
    alert(`Reporting to ${agency} - Camera screen coming in Phase 3!`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>iReport</Text>
        <Text style={styles.subtitle}>Camarines Norte</Text>
        {session && (
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>What do you need to report?</Text>
        
        <View style={styles.buttonContainer}>
          {/* PNP Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.pnpButton]}
            onPress={() => handleReportPress('PNP')}
          >
            <Text style={styles.buttonEmoji}>🚔</Text>
            <Text style={styles.buttonTitle}>Report Crime</Text>
            <Text style={styles.buttonSubtitle}>Philippine National Police (PNP)</Text>
          </TouchableOpacity>

          {/* BFP Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.bfpButton]}
            onPress={() => handleReportPress('BFP')}
          >
            <Text style={styles.buttonEmoji}>🔥</Text>
            <Text style={styles.buttonTitle}>Report Fire</Text>
            <Text style={styles.buttonSubtitle}>Bureau of Fire Protection (BFP)</Text>
          </TouchableOpacity>

          {/* PDRRMO Button */}
          <TouchableOpacity
            style={[styles.reportButton, styles.pdrrmoButton]}
            onPress={() => handleReportPress('PDRRMO')}
          >
            <Text style={styles.buttonEmoji}>🌊</Text>
            <Text style={styles.buttonTitle}>Report Disaster</Text>
            <Text style={styles.buttonSubtitle}>Provincial Disaster Risk Reduction Management Office (PDRRMO) </Text>
          </TouchableOpacity>
        </View>

        {session && (
          <TouchableOpacity style={styles.myReportsButton}>
            <Text style={styles.myReportsText}>View My Reports →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    position: 'absolute',
    top: 20,
    right: 24,
  },
  signOutText: {
    color: '#666',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  reportButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pnpButton: {
    backgroundColor: '#2563eb',
  },
  bfpButton: {
    backgroundColor: '#dc2626',
  },
  pdrrmoButton: {
    backgroundColor: '#f59e0b',
  },
  buttonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  myReportsButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  myReportsText: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600',
  },
});

export default HomeScreen;
