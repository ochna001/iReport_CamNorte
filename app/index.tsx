import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthProvider';
import { ONBOARDING_KEY } from './onboarding';

export default function Index() {
  const { session, loading, isGuestMode, isOffline } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Show loading spinner while checking auth and onboarding status
  if (loading || checkingOnboarding) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // If user is authenticated (real account), redirect to home
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  // First time user - show onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // If user explicitly entered guest mode AND completed onboarding, go to home
  // Guest mode is only valid if they actively chose it
  if (isGuestMode) {
    return <Redirect href="/(tabs)" />;
  }

  // Returning user without session and not in guest mode - show welcome screen
  // This handles the case: open app -> don't log in -> close -> reopen
  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
