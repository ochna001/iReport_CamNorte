import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';
import AppHeader from '../../components/AppHeader';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, isAnonymous } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHomeStats, setShowHomeStats] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setPhoneNumber(data.phone_number || '');
        setEmail(data.email || session?.user?.email || '');
        setDateOfBirth(data.date_of_birth || '');
        // Get preferences from metadata
        const metadata = session?.user?.user_metadata;
        setShowHomeStats(metadata?.show_home_stats !== false);
      } else {
        setEmail(session?.user?.email || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        Alert.alert('Invalid Date', 'Please enter a valid date of birth');
        return;
      }
      
      // Check if age is at least 13
      const age = calculateAge(dateOfBirth);
      if (age !== null && age < 13) {
        Alert.alert('Age Restriction', 'You must be at least 13 years old to use this app');
        return;
      }
    }

    try {
      setSaving(true);

      // Calculate age from DOB
      const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          display_name: displayName.trim() || null,
          phone_number: phoneNumber.trim() || null,
          email: email.trim() || session.user.email,
          age: calculatedAge,
          date_of_birth: dateOfBirth || null,
          role: 'Resident',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Also update user metadata with preferences
      await supabase.auth.updateUser({
        data: {
          full_name: displayName.trim() || null,
          date_of_birth: dateOfBirth || null,
          show_home_stats: showHomeStats,
        }
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleUpgradeAccount = () => {
    router.push('/screens/SignUpScreen');
  };

  const getGuestId = () => {
    if (!session?.user?.id) return '000';
    return session.user.id.substring(0, 8).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <AppHeader />
      
      <ScrollView>

        {/* Anonymous User Upgrade Prompt */}
        {isAnonymous && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>🔒 Create an Account</Text>
            <Text style={styles.upgradeText}>
              You're currently using the app as a guest. Create an account to save your reports permanently and receive updates.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeAccount}>
              <Text style={styles.upgradeButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Form */}
        {!isAnonymous && (
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!saving}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Email address"
                value={email}
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="09XX XXX XXXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                editable={!saving}
              />
              <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 1990-01-15)</Text>
            </View>

            <View style={styles.divider} />

            {/* Preferences Section */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Notifications</Text>
                <Text style={styles.preferenceDescription}>Receive updates about your reports</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Show Statistics</Text>
                <Text style={styles.preferenceDescription}>Display public stats on home screen</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, showHomeStats && styles.toggleActive]}
                onPress={() => setShowHomeStats(!showHomeStats)}
              >
                <View style={[styles.toggleThumb, showHomeStats && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>iReport Camarines Norte</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  guestBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  guestBadgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  upgradeCard: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: Colors.text.secondary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.secondary,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
});
