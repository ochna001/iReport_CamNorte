import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthProvider';

export default function Index() {
  const { session, loading } = useAuth();
  const router = useRouter();

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

  // If not authenticated, redirect to welcome screen
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
