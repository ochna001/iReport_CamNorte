import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { User2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { router } from 'expo-router';

export default function AppHeader() {
  const { session, isAnonymous } = useAuth();
  const insets = useSafeAreaInsets();

  const user = session?.user;
  const displayName = user?.email || `Guest #${user?.id?.slice(-6).toUpperCase() || '89FA5FDB'}`;
  const isGuest = isAnonymous || !user;

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
