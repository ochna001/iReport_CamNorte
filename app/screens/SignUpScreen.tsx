import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Calendar, CheckSquare, Eye, EyeOff, Square } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

const SignUpScreen = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [pickerStep, setPickerStep] = useState<'year' | 'month' | 'day'>('year');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBiometricAvailable(compatible);
    })();
  }, []);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 11 digits (Philippine format: 09XX-XXX-XXXX)
    const limited = cleaned.substring(0, 11);
    
    // Format as 09XX-XXX-XXXX
    if (limited.length <= 4) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 4)}-${limited.slice(4)}`;
    } else {
      return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
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
    const date = new Date(selectedYear, selectedMonth, day);
    setDateOfBirth(date);
    setShowDatePicker(false);
    setPickerStep('year'); // Reset for next time
  };

  const handleOpenDatePicker = () => {
    setPickerStep('year');
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
    setPickerStep('year');
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleSignUp = async () => {
    // Validation
    if (!displayName || !dateOfBirth || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check terms agreement
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert('Agreement Required', 'Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Validate age (must be at least 13 years old)
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) ? age - 1 : age;
    
    if (actualAge < 13) {
      Alert.alert('Error', 'You must be at least 13 years old to register');
      return;
    }
    
    if (actualAge > 120) {
      Alert.alert('Error', 'Please enter a valid date of birth');
      return;
    }

    // Validate display name
    if (displayName.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate Philippine phone number (09XX-XXX-XXXX format)
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 11 || !cleanedPhone.startsWith('09')) {
      Alert.alert('Error', 'Please enter a valid Philippine mobile number (09XX-XXX-XXXX)');
      return;
    }

    // Validate password
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      setLoading(false);
      Alert.alert('Sign Up Failed', authError.message);
      return;
    }

    setLoading(false);


    setDisplayName('');
    setDateOfBirth(null);
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');

    // Navigate to OTP verification screen
    // Profile will be created after email verification
    Alert.alert(
      'Verification Required',
      'A 6-digit code has been sent to your email. Please verify your account to continue.',
      [
        {
          text: 'OK',
          onPress: () => router.push({
            pathname: '/screens/VerifyOtpScreen',
            params: { 
              email: email.trim(),
              displayName: displayName.trim(),
              dateOfBirth: dateOfBirth.toISOString().split('T')[0],
              phoneNumber: phoneNumber.replace(/\D/g, ''),
            },
          }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logov1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up as a Resident</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={Colors.text.secondary}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={handleOpenDatePicker}
            disabled={loading}
          >
            <Text style={[styles.datePickerText, !dateOfBirth && styles.datePickerPlaceholder]} numberOfLines={1}>
              {dateOfBirth ? formatDateDisplay(dateOfBirth) : 'Date of Birth'}
            </Text>
            <Calendar size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          {/* Custom Cascading Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseDatePicker}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Header */}
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

                {/* Progress Indicator with Navigation */}
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

                {/* Picker Container */}
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

                {/* Helper Text */}
                <View style={styles.helperTextContainer}>
                  <Text style={styles.helperText}>
                    {pickerStep === 'year' && 'Scroll to find your birth year'}
                    {pickerStep === 'month' && 'Select the month you were born'}
                    {pickerStep === 'day' && 'Select the day you were born'}
                  </Text>
                </View>
              </View>
            </View>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (09XX-XXX-XXXX)"
            placeholderTextColor={Colors.text.secondary}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            maxLength={13}
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.text.secondary} />
              ) : (
                <Eye size={20} color={Colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.text.secondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.text.secondary} />
              ) : (
                <Eye size={20} color={Colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy Agreement */}
          <View style={styles.agreementContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                const newValue = !agreedToTerms;
                setAgreedToTerms(newValue);
                setAgreedToPrivacy(newValue);
              }}
            >
              {agreedToTerms ? (
                <CheckSquare size={24} color={Colors.primary} />
              ) : (
                <Square size={24} color={Colors.text.secondary} />
              )}
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  I agree to the{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => router.push('/screens/TermsOfServiceScreen' as any)}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => router.push('/screens/PrivacyPolicyScreen' as any)}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, (!agreedToTerms || !agreedToPrivacy) && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading || !agreedToTerms || !agreedToPrivacy}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText} numberOfLines={2}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/screens/LoginScreen')} disabled={loading}>
              <Text style={styles.loginLink} numberOfLines={1}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  logo: {
    width: 100,
    height: 100,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    color: Colors.text.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  loginPromptText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loginLink: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
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
  helperText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  agreementContainer: {
    marginVertical: 16,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SignUpScreen;
