import { router } from 'expo-router';
import { Bell, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabase';

export default function AppHeader() {
  const { session, isAnonymous } = useAuth();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);

  const user = session?.user;
  const isGuest = isAnonymous || !user;

  useEffect(() => {
    if (user && !isAnonymous) {
      fetchDisplayName();
      fetchUnreadCount();
      
      // Subscribe to realtime notifications
      const channel = supabase
        .channel('notifications-badge')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[AppHeader] Notification change:', payload);
            fetchUnreadCount();
          }
        )
        .subscribe((status) => {
          console.log('[AppHeader] Subscription status:', status);
        });

      return () => {
        channel.unsubscribe();
      };
    } else if (user) {
      setDisplayName(`Guest #${user.id?.slice(-6).toUpperCase() || '89FA5FDB'}`);
    } else {
      setDisplayName('Guest');
    }
  }, [user, isAnonymous]);

  const fetchDisplayName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else {
        // Fallback to email if no display name
        setDisplayName(user?.email || 'User');
      }
    } catch (error) {
      console.error('Error fetching display name:', error);
      setDisplayName(user?.email || 'User');
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      console.log('[AppHeader] Unread count:', count, 'Error:', error);
      
      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const formatDisplayName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) {
      return name;
    }
    const first = parts[0];
    const rest = parts.slice(1).join(' ');
    return `${first}\n${rest}`;
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 12, 48) }]}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>iReport</Text>
        <Text style={styles.subtitle}>Camarines Norte</Text>
      </View>
      
      <View style={styles.rightSection}>
        {!isGuest && (
          <Pressable 
            style={styles.iconButton} 
            onPress={handleNotificationPress}
            hitSlop={8}
          >
            <Bell size={24} color={Colors.text.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}

        <Pressable style={styles.profileButton} onPress={handleProfilePress}>
          <View style={styles.profileIcon}>
            <User2 size={24} color={Colors.text.primary} strokeWidth={2} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={2}>
              {formatDisplayName(displayName)}
            </Text>
            {isGuest && <Text style={styles.guestLabel}>Guest</Text>}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  leftSection: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    maxWidth: 100,
    flexShrink: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    flexShrink: 1,
  },
  guestLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
