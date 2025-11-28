import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../contexts/AuthProvider';
import { getQueueCount, setupNetworkListener } from '../lib/offlineQueue';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Setup offline queue sync when network is restored
  useEffect(() => {
    const unsubscribe = setupNetworkListener((successful, failed) => {
      if (successful > 0) {
        Alert.alert(
          'Reports Synced',
          `${successful} offline report${successful > 1 ? 's' : ''} ${successful > 1 ? 'have' : 'has'} been successfully submitted.`,
          [{ text: 'OK' }]
        );
      }
      if (failed > 0) {
        Alert.alert(
          'Sync Issue',
          `${failed} report${failed > 1 ? 's' : ''} could not be submitted. They will be retried later.`,
          [{ text: 'OK' }]
        );
      }
    });

    // Check for pending reports on app start
    const checkPendingReports = async () => {
      const count = await getQueueCount();
      if (count > 0) {
        console.log(`Found ${count} pending offline reports`);
      }
    };
    checkPendingReports();

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens/LoginScreen" />
          <Stack.Screen name="screens/SignUpScreen" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
