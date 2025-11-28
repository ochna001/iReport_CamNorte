import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthProvider';

export default function Index() {
  const { session, loading, isGuestMode, isOffline } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // If user is authenticated, redirect to home
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  // If user is in guest mode (or offline and was previously in guest mode), go to home
  if (isGuestMode || isOffline) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated and online, redirect to welcome screen
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
