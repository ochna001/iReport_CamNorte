import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Calendar } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, isAnonymous } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [pickerStep, setPickerStep] = useState<'year' | 'month' | 'day'>('year');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHomeStats, setShowHomeStats] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [personalDetailsExpanded, setPersonalDetailsExpanded] = useState(true);
  const [preferencesExpanded, setPreferencesExpanded] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        if (data.date_of_birth) {
          setDateOfBirth(new Date(data.date_of_birth));
        }
        // Get preferences from metadata
        const metadata = session?.user?.user_metadata;
        setShowHomeStats(metadata?.show_home_stats !== false);
      } else {
        setEmail(session?.user?.email || '');
      }
      
      // Load biometric preference
      const biometricPref = await AsyncStorage.getItem('biometric_enabled');
      setBiometricEnabled(biometricPref === 'true');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
  };

  const calculateAge = (dob: Date | null): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    // Use UTC methods for consistent age calculation
    let age = today.getFullYear() - birthDate.getUTCFullYear();
    const monthDiff = today.getMonth() - birthDate.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getUTCDate())) {
      age--;
    }
    return age;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const generateMonths = () => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setPickerStep('month');
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setPickerStep('day');
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    // Create date at noon UTC to avoid timezone issues
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`;
    const date = new Date(dateString);
    setDateOfBirth(date);
    setShowDatePicker(false);
    setPickerStep('year');
  };

  const handleOpenDatePicker = () => {
    if (dateOfBirth) {
      // Use UTC methods to get correct date values
      setSelectedYear(dateOfBirth.getUTCFullYear());
      setSelectedMonth(dateOfBirth.getUTCMonth());
      setSelectedDay(dateOfBirth.getUTCDate());
    }
    setPickerStep('year');
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
    setPickerStep('year');
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    // Use UTC methods to avoid timezone shifts
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  const handleSavePersonalDetails = async () => {
    if (!session?.user?.id) return;

    // Validate date of birth if provided
    if (dateOfBirth) {
      if (dateOfBirth > new Date()) {
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
        .update({
          display_name: displayName.trim() || null,
          phone_number: phoneNumber.trim() || null,
          age: calculatedAge,
          date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Also update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: displayName.trim() || null,
          date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        }
      });

      Alert.alert('Success', 'Personal details updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save personal details');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!session?.user?.id) return;

    try {
      setSavingPreferences(true);

      // Update user metadata with preferences
      await supabase.auth.updateUser({
        data: {
          show_home_stats: showHomeStats,
        }
      });

      // Save biometric preference
      await AsyncStorage.setItem('biometric_enabled', biometricEnabled.toString());
      
      // If biometric is being disabled, clear saved credentials from secure storage
      if (!biometricEnabled) {
        await SecureStore.deleteItemAsync('biometric_email');
        await SecureStore.deleteItemAsync('biometric_password');
      }

      Alert.alert('Success', 'Preferences updated successfully');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleLogout = () => {
    // Different message for guest vs authenticated users
    const title = isAnonymous ? '⚠️ Logout as Guest' : 'Logout';
    const message = isAnonymous 
      ? 'Your reports will be permanently lost if you logout. Guest accounts cannot be recovered. Are you sure?'
      : 'Are you sure you want to logout?';
    
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/screens/LoginScreen');
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
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >

        {/* Anonymous User Upgrade Prompt */}
        {isAnonymous && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>⚠️ Guest Account</Text>
            <Text style={styles.upgradeText}>
              You're using a temporary guest account. Your reports will be lost if you logout or close the app. Create an account to save your reports permanently and receive updates.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeAccount}>
              <Text style={styles.upgradeButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Form */}
        {!isAnonymous && (
          <View style={styles.formContainer}>
            {/* Personal Details Section */}
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setPersonalDetailsExpanded(!personalDetailsExpanded)}
            >
              <Text style={styles.sectionTitle}>Personal Details</Text>
              <Text style={styles.expandIcon}>{personalDetailsExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {personalDetailsExpanded && (
              <>
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
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={handleOpenDatePicker}
                    disabled={saving}
                  >
                    <Text style={[styles.datePickerText, !dateOfBirth && styles.datePickerPlaceholder]} numberOfLines={1}>
                      {dateOfBirth ? formatDateDisplay(dateOfBirth) : 'Select Date of Birth'}
                    </Text>
                    <Calendar size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.buttonDisabled]}
                  onPress={handleSavePersonalDetails}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Personal Details</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Date Picker Modal */}
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={handleCloseDatePicker}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <Text style={styles.modalTitle}>
                        {pickerStep === 'year' && '📅 Select Year'}
                        {pickerStep === 'month' && '📆 Select Month'}
                        {pickerStep === 'day' && '📍 Select Day'}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        {pickerStep === 'year' && 'Choose your birth year'}
                        {pickerStep === 'month' && `Year: ${selectedYear}`}
                        {pickerStep === 'day' && `${generateMonths()[selectedMonth]} ${selectedYear}`}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleCloseDatePicker} style={styles.closeButton}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressContainer}>
                    <TouchableOpacity 
                      style={[styles.progressDot, pickerStep === 'year' && styles.progressDotActive]}
                      onPress={() => setPickerStep('year')}
                    >
                      <Text style={styles.progressLabel}>Y</Text>
                    </TouchableOpacity>
                    <View style={[styles.progressLine, (pickerStep === 'month' || pickerStep === 'day') && styles.progressLineActive]} />
                    <TouchableOpacity 
                      style={[styles.progressDot, (pickerStep === 'month' || pickerStep === 'day') && styles.progressDotActive]}
                      onPress={() => setPickerStep('month')}
                    >
                      <Text style={styles.progressLabel}>M</Text>
                    </TouchableOpacity>
                    <View style={[styles.progressLine, pickerStep === 'day' && styles.progressLineActive]} />
                    <TouchableOpacity 
                      style={[styles.progressDot, pickerStep === 'day' && styles.progressDotActive]}
                      onPress={() => setPickerStep('day')}
                    >
                      <Text style={styles.progressLabel}>D</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pickerContainer}>
                    {pickerStep === 'year' && (
                      <FlatList
                        data={generateYears()}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[styles.pickerItem, selectedYear === item && styles.pickerItemSelected]}
                            onPress={() => handleYearSelect(item)}
                          >
                            <Text style={[styles.pickerItemText, selectedYear === item && styles.pickerItemTextSelected]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={true}
                        style={styles.pickerList}
                      />
                    )}

                    {pickerStep === 'month' && (
                      <FlatList
                        data={generateMonths()}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity
                            style={[styles.pickerItem, selectedMonth === index && styles.pickerItemSelected]}
                            onPress={() => handleMonthSelect(index)}
                          >
                            <Text style={[styles.pickerItemText, selectedMonth === index && styles.pickerItemTextSelected]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={true}
                        style={styles.pickerList}
                      />
                    )}

                    {pickerStep === 'day' && (
                      <FlatList
                        data={generateDays()}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[styles.pickerItem, selectedDay === item && styles.pickerItemSelected]}
                            onPress={() => handleDaySelect(item)}
                          >
                            <Text style={[styles.pickerItemText, selectedDay === item && styles.pickerItemTextSelected]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={true}
                        style={styles.pickerList}
                      />
                    )}
                  </View>

                  <View style={styles.helperTextContainer}>
                    <Text style={styles.pickerHelperText}>
                      {pickerStep === 'year' && 'Scroll to find your birth year'}
                      {pickerStep === 'month' && 'Select the month you were born'}
                      {pickerStep === 'day' && 'Select the day you were born'}
                    </Text>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.divider} />

            {/* Preferences Section */}
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setPreferencesExpanded(!preferencesExpanded)}
            >
              <Text style={styles.sectionTitle}>Preferences</Text>
              <Text style={styles.expandIcon}>{preferencesExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {preferencesExpanded && (
              <>
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceLabel}>Biometric Login</Text>
                    <Text style={styles.preferenceDescription}>Save credentials for biometric login. Login normally once after enabling.</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, biometricEnabled && styles.toggleActive]}
                    onPress={() => setBiometricEnabled(!biometricEnabled)}
                  >
                    <View style={[styles.toggleThumb, biometricEnabled && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>

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
                    <Text style={styles.preferenceLabel}>{t('profile.showStats')}</Text>
                    <Text style={styles.preferenceDescription}>{t('profile.showStatsDesc')}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, showHomeStats && styles.toggleActive]}
                    onPress={() => setShowHomeStats(!showHomeStats)}
                  >
                    <View style={[styles.toggleThumb, showHomeStats && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>

                {/* Language Preference */}
                <TouchableOpacity 
                  style={styles.preferenceRow}
                  onPress={() => setShowLanguageModal(true)}
                >
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceLabel}>{t('language.title')}</Text>
                    <Text style={styles.preferenceDescription}>{t('language.description')}</Text>
                  </View>
                  <View style={styles.languageValue}>
                    <Text style={styles.languageValueText}>
                      {language === 'tl' ? '🇵🇭 Tagalog' : '🇺🇸 English'}
                    </Text>
                    <Text style={styles.chevron}>▶</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, savingPreferences && styles.buttonDisabled]}
                  onPress={handleSavePreferences}
                  disabled={savingPreferences}
                >
                  {savingPreferences ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('profile.savePreferences')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>{t('profile.appInfo')}</Text>
          <Text style={styles.appInfoText}>{t('profile.version')} 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language.select')}</Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'tl' && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage('tl');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[
                styles.languageOptionText,
                language === 'tl' && styles.languageOptionTextSelected,
              ]}>
                🇵🇭 {t('language.tagalog')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[
                styles.languageOptionText,
                language === 'en' && styles.languageOptionTextSelected,
              ]}>
                🇺🇸 {t('language.english')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  expandIcon: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: 'bold',
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
  datePickerButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  datePickerPlaceholder: {
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  modalClose: {
    fontSize: 28,
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.secondary,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
    height: 250,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: 18,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  helperTextContainer: {
    padding: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  pickerHelperText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  languageValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageValueText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 12,
  },
  languageOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  languageOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  languageOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    marginTop: 8,
  },
  modalCancelText: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
