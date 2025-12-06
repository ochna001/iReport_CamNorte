import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { CheckSquare, Eye, EyeOff, Fingerprint, Globe, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { supabase } from '../../lib/supabase';

const LoginScreen = () => {
  const router = useRouter();
  const { enterGuestMode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showGuestAgreement, setShowGuestAgreement] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Check for biometric hardware and if user has enabled it with saved credentials
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const savedBiometricPref = await AsyncStorage.getItem('biometric_enabled');
      const savedEmail = await SecureStore.getItemAsync('biometric_email');
      const savedPassword = await SecureStore.getItemAsync('biometric_password');
      
      setBiometricAvailable(compatible);
      // Only enable biometric if hardware exists, user enabled it, AND credentials are saved
      if (compatible && savedBiometricPref === 'true' && savedEmail && savedPassword) {
        setBiometricEnabled(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('login.error'), t('login.fillAllFields'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('login.error'), t('login.invalidEmail'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert(t('login.failed'), error.message);
    } else {
      // Save credentials securely if biometric is enabled
      const biometricPref = await AsyncStorage.getItem('biometric_enabled');
      if (biometricPref === 'true') {
        await SecureStore.setItemAsync('biometric_email', email.trim());
        await SecureStore.setItemAsync('biometric_password', password);
      }
      router.replace('/(tabs)');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to log in',
      });

      if (result.success) {
        setLoading(true);
        
        // Retrieve saved credentials from secure storage
        const savedEmail = await SecureStore.getItemAsync('biometric_email');
        const savedPassword = await SecureStore.getItemAsync('biometric_password');
        
        if (!savedEmail || !savedPassword) {
          setLoading(false);
          Alert.alert(t('login.error'), t('login.noCredentials'));
          return;
        }
        
        // Authenticate with Supabase using saved credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: savedEmail,
          password: savedPassword,
        });
        
        setLoading(false);
        
        if (error) {
          Alert.alert(t('login.failed'), t('login.invalidCredentials'));
          // Clear invalid credentials
          await SecureStore.deleteItemAsync('biometric_email');
          await SecureStore.deleteItemAsync('biometric_password');
          setBiometricEnabled(false);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert(t('login.failed'), t('login.biometricFailed'));
      }
    } catch (e) {
      Alert.alert(t('login.error'), t('login.biometricUnavailable'));
    }
  };

  const handleGuestAccessClick = () => {
    setShowGuestAgreement(true);
  };

  const handleGuestAccess = async () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert(t('guest.agreementRequired'), t('guest.agreementMessage'));
      return;
    }

    try {
      setGuestLoading(true);
      // Just enter guest mode - don't create Supabase session yet
      // Anonymous session will be created when they actually submit a report
      await enterGuestMode();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(t('login.error'), t('login.guestError'));
      console.error('Guest mode error:', error);
    } finally {
      setGuestLoading(false);
      setShowGuestAgreement(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'exp://localhost:8081', // Update for production
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert(t('login.googleFailed'), error.message);
    } else if (data.url) {
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'exp://localhost:8081');
      setLoading(false);
      if (result.type === 'success') {
        router.replace('/(tabs)');
      }
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'exp://localhost:8081', // Update for production
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert(t('login.facebookFailed'), error.message);
    } else if (data.url) {
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'exp://localhost:8081');
      setLoading(false);
      if (result.type === 'success') {
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Language Toggle Button */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <Globe size={20} color={Colors.text.secondary} />
        <Text style={styles.languageButtonText}>
          {language === 'tl' ? 'TL' : 'EN'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logov1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>iReport</Text>
          <Text style={styles.subtitle}>Camarines Norte</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t('login.email')}
              placeholderTextColor={Colors.text.secondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('login.password')}
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

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('login.signIn')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/screens/SignUpScreen')}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>{t('login.createAccount')}</Text>
            </TouchableOpacity>

            {biometricEnabled && (
              <TouchableOpacity
                style={[styles.button, styles.biometricButton]}
                onPress={handleBiometricLogin}
                disabled={loading}
              >
                <Fingerprint size={20} color={Colors.primary} />
                <Text style={styles.biometricButtonText}>{t('login.biometric')}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('login.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={styles.socialButtonText}>{t('login.continueGoogle')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.facebookButton]}
              onPress={handleFacebookLogin}
              disabled={loading}
            >
              <Text style={styles.facebookButtonText}>{t('login.continueFacebook')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestAccessClick}
              disabled={loading || guestLoading}
            >
              {guestLoading ? (
                <ActivityIndicator color={Colors.text.secondary} size="small" />
              ) : (
                <Text style={styles.guestButtonText} numberOfLines={2}>{t('login.continueGuest')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Guest Agreement Modal */}
      {showGuestAgreement && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('guest.title')}</Text>
            <Text style={styles.modalText}>
              {t('guest.message')}
            </Text>

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
                    {t('guest.agreeTerms')}{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => router.push('/screens/TermsOfServiceScreen' as any)}
                    >
                      {t('guest.termsOfService')}
                    </Text>
                    {' '}{t('guest.and')}{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => router.push('/screens/PrivacyPolicyScreen' as any)}
                    >
                      {t('guest.privacyPolicy')}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowGuestAgreement(false);
                  setAgreedToTerms(false);
                  setAgreedToPrivacy(false);
                }}
              >
                <Text style={styles.cancelButtonText}>{t('guest.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, (!agreedToTerms || !agreedToPrivacy) && styles.buttonDisabled]}
                onPress={handleGuestAccess}
                disabled={!agreedToTerms || !agreedToPrivacy || guestLoading}
              >
                {guestLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>{t('guest.continue')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
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
              {language === 'tl' && (
                <CheckSquare size={20} color={Colors.primary} />
              )}
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
              {language === 'en' && (
                <CheckSquare size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t('guest.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
    minHeight: '100%',
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
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
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    gap: 8,
  },
  biometricButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.secondary,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.text.secondary,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  facebookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  guestButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  languageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});

export default LoginScreen;

