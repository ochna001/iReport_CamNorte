import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications appear when app is in foreground
// This ensures notifications show in system tray even when app is open
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Always show notifications in system tray like other apps
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Set up Android notification channel with sound and vibration
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('status-updates', {
    name: 'Status Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250], // Vibrate pattern
    sound: 'default', // Use default notification sound
    enableVibrate: true,
    enableLights: true,
    lightColor: '#2196F3',
  });
}

/**
 * Register for push notifications and store token in Supabase
 */
export async function registerForPushNotifications(userId?: string, deviceId?: string): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('[Notifications] Must use physical device for push notifications');
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '221989d9-3ee1-47f0-acd0-5896a298d8fb', // From app.json
    });
    const pushToken = tokenData.data;
    console.log('[Notifications] Push token:', pushToken);

    // Store token in Supabase
    await storePushToken(pushToken, userId, deviceId);

    return pushToken;
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
    return null;
  }
}

/**
 * Store push token in Supabase
 */
async function storePushToken(token: string, userId?: string, deviceId?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        token,
        user_id: userId || null,
        device_id: deviceId || null,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'token',
      });

    if (error) {
      console.error('[Notifications] Error storing push token:', error);
    } else {
      console.log('[Notifications] Push token stored successfully');
    }
  } catch (error) {
    console.error('[Notifications] Error storing push token:', error);
  }
}

/**
 * Remove push token (e.g., on logout)
 */
export async function removePushToken(token: string): Promise<void> {
  try {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('token', token);
  } catch (error) {
    console.error('[Notifications] Error removing push token:', error);
  }
}

/**
 * Add notification listeners
 */
export function addNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  // When notification is received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Received:', notification);
    onNotificationReceived?.(notification);
  });

  // When user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications] User tapped:', response);
    onNotificationResponse?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Update app badge count
 */
export async function updateBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('[Notifications] Error setting badge count:', error);
  }
}

/**
 * Clear app badge
 */
export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('[Notifications] Error clearing badge:', error);
  }
}

/**
 * Get status change message (concise but detailed)
 */
export function getStatusMessage(
  status: string, 
  agencyType?: string, 
  location?: string,
  incidentId?: string | number
): { title: string; body: string } {
  const agency = agencyType?.toUpperCase() || 'Agency';
  const agencyLower = agencyType?.toLowerCase() || 'incident';
  const loc = location ? location.substring(0, 50) : 'your location';

  // Status values: pending, assigned, in_progress, resolved, closed
  switch (status.toLowerCase()) {
    case 'assigned':
      return {
        title: '🚔 Responders Assigned',
        body: `${agency} team assigned to your ${agencyLower} report at ${loc}.`,
      };
    case 'in_progress':
      return {
        title: '🚨 Responders On Scene',
        body: `${agency} responders have arrived at ${loc}.`,
      };
    case 'resolved':
      return {
        title: '✅ Incident Resolved',
        body: `Your ${agencyLower} report has been resolved. Thank you for helping keep our community safe!`,
      };
    case 'closed':
      return {
        title: '📋 Case Closed',
        body: `Your ${agencyLower} report${incidentId ? ` (#${incidentId})` : ''} has been officially closed.`,
      };
    default:
      return {
        title: '📢 Status Update',
        body: `Your ${agencyLower} report status changed to: ${status}`,
      };
  }
}
