import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { User2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AppHeader() {
  const { session, isAnonymous } = useAuth();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState<string>('');

  const user = session?.user;
  const isGuest = isAnonymous || !user;

  useEffect(() => {
    if (user && !isAnonymous) {
      fetchDisplayName();
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

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 12, 48) }]}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>iReport</Text>
        <Text style={styles.subtitle}>Camarines Norte</Text>
      </View>
      
      <Pressable style={styles.rightSection} onPress={handleProfilePress}>
        <View style={styles.profileIcon}>
          <User2 size={24} color={Colors.text.primary} strokeWidth={2} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          {isGuest && <Text style={styles.guestLabel}>Guest</Text>}
        </View>
      </Pressable>
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
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    maxWidth: 140,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  guestLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
