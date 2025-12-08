import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/AuthProvider';
import { LanguageProvider } from '../contexts/LanguageProvider';
import { LocationProvider } from '../contexts/LocationProvider';
import { ReportDraftProvider } from '../contexts/ReportDraftProvider';
import {
    addNotificationListeners,
    registerForPushNotifications,
    removePushToken
} from '../lib/notifications';
import { getQueueCount, setupNetworkListener } from '../lib/offlineQueue';

// Inner component that has access to auth context
function AppContent() {
  const colorScheme = useColorScheme();
  const { session, deviceId } = useAuth();
  const notificationsEnabled = session?.user?.user_metadata?.notifications_enabled !== false;
  const PUSH_TOKEN_STORAGE_KEY = '@expo_push_token';

  // Register for push notifications
  useEffect(() => {
    let isMounted = true;
    let removeListeners: (() => void) | undefined;

    const cleanupPushToken = async () => {
      const existingToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (existingToken) {
        await removePushToken(existingToken);
        await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      }
    };

    const setupNotifications = async () => {
      if (!session?.user?.id || !notificationsEnabled) {
        if (removeListeners) {
          removeListeners();
          removeListeners = undefined;
        }
        await cleanupPushToken();
        return;
      }

      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      const pushToken = await registerForPushNotifications(session.user.id, deviceId || undefined);

      if (!isMounted) {
        return;
      }

      if (!pushToken) {
        if (removeListeners) {
          removeListeners();
          removeListeners = undefined;
        }
        await cleanupPushToken();
        return;
      }

      if (pushToken !== storedToken) {
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, pushToken);
      }

      if (!removeListeners) {
        removeListeners = addNotificationListeners(
          (notification) => {
            // Notification received while app is open
            console.log('[App] Notification received:', notification.request.content);
          },
          (response) => {
            // User tapped on notification - could navigate to incident details
            const data = response.notification.request.content.data;
            console.log('[App] Notification tapped, data:', data);
            // TODO: Navigate to incident details if incident_id is present
          }
        );
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (removeListeners) {
        removeListeners();
      }
    };
  }, [session?.user?.id, deviceId, notificationsEnabled]);

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
    <ReportDraftProvider>
      <LocationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens/LoginScreen" />
          <Stack.Screen name="screens/SignUpScreen" />
          <Stack.Screen name="auth/callback" />
        </Stack>
        <StatusBar style="auto" />
        </ThemeProvider>
      </LocationProvider>
    </ReportDraftProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
