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
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageProvider';
import { supabase } from '../../lib/supabase';

// Complete any pending auth session from the browser
WebBrowser.maybeCompleteAuthSession();

// Google Icon Component
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

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
      // On fresh install, biometric_enabled is null, so default to true
      const biometricPref = await AsyncStorage.getItem('biometric_enabled');
      if (biometricPref === 'true' || biometricPref === null) {
        await SecureStore.setItemAsync('biometric_email', email.trim());
        await SecureStore.setItemAsync('biometric_password', password);
        // Set the default if not set yet
        if (biometricPref === null) {
          await AsyncStorage.setItem('biometric_enabled', 'true');
        }
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
    
    // For Expo Go: Use the Supabase project URL as redirect, then handle in-app
    // For production builds: Use native scheme ireportv1://auth/callback
    const isExpoGo = !__DEV__ ? false : true; // Simplified check
    
    // In Expo Go, we'll use a workaround: redirect to Supabase and let it handle
    const redirectUrl = isExpoGo 
      ? 'ireportv1://auth/callback'  // Native scheme (works in dev builds)
      : 'ireportv1://auth/callback';
    
    console.log('[Login] 1. Using Redirect URL:', redirectUrl);
    console.log('[Login] Note: Google OAuth works best in development/production builds, not Expo Go');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('[Login] Supabase init error:', error);
      setLoading(false);
      Alert.alert(t('login.googleFailed'), error.message);
      return;
    }
    
    if (data.url) {
      console.log('[Login] 2. Opening WebBrowser with URL:', data.url);
      try {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        console.log('[Login] 3. WebBrowser Result:', JSON.stringify(result));
        
        setLoading(false);
        
        if (result.type === 'success' && result.url) {
          console.log('[Login] 4. Success redirect URL:', result.url);
          const url = result.url;
          
          // Parse tokens from URL hash fragment
          const hashIndex = url.indexOf('#');
          if (hashIndex > -1) {
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              console.log('[Login] 5. Found tokens in hash, setting session...');
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                console.error('[Login] Session error:', sessionError);
                Alert.alert('Error', sessionError.message);
              } else {
                console.log('[Login] 6. Session set, redirecting to tabs');
                router.replace('/(tabs)');
              }
              return;
            }
          }
          
          // Check for code in query params
          if (url.includes('code=')) {
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get('code');
            if (code) {
              console.log('[Login] 5. Found code, exchanging...');
              const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
              if (codeError) {
                console.error('[Login] Code exchange error:', codeError);
                Alert.alert('Error', codeError.message);
              } else {
                console.log('[Login] 6. Code exchanged, redirecting to tabs');
                router.replace('/(tabs)');
              }
              return;
            }
          }
          
          console.log('[Login] 5. No tokens/code found in URL');
        } else {
          console.log('[Login] WebBrowser did not return success type:', result.type);
        }
      } catch (e) {
        console.error('[Login] WebBrowser exception:', e);
        setLoading(false);
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
              <Text style={styles.secondaryButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('login.createAccount')}</Text>
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
              <View style={styles.googleButtonContent}>
                <GoogleIcon />
                <Text style={styles.socialButtonText}>{t('login.continueGoogle')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestAccessClick}
              disabled={loading || guestLoading}
            >
              {guestLoading ? (
                <ActivityIndicator color={Colors.text.secondary} size="small" />
              ) : (
                <Text style={styles.guestButtonText} numberOfLines={1} adjustsFontSizeToFit>{t('login.continueGuest')}</Text>
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
          <View style={styles.languageModalContent}>
            <Text style={styles.languageModalTitle}>{t('language.select')}</Text>
            
            <View style={styles.languageOptionsContainer}>
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
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇵🇭</Text>
                  <View style={styles.languageTextContainer}>
                    <Text style={[
                      styles.languageOptionText,
                      language === 'tl' && styles.languageOptionTextSelected,
                    ]}>
                      {t('language.tagalog')}
                    </Text>
                    <Text style={styles.languageSubtext}>Filipino / Tagalog</Text>
                  </View>
                </View>
                {language === 'tl' && (
                  <CheckSquare size={22} color={Colors.primary} />
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
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇺🇸</Text>
                  <View style={styles.languageTextContainer}>
                    <Text style={[
                      styles.languageOptionText,
                      language === 'en' && styles.languageOptionTextSelected,
                    ]}>
                      {t('language.english')}
                    </Text>
                    <Text style={styles.languageSubtext}>English (US)</Text>
                  </View>
                </View>
                {language === 'en' && (
                  <CheckSquare size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.languageCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.languageCloseButtonText}>{t('common.cancel')}</Text>
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
    borderColor: '#dadce0',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialButtonText: {
    color: Colors.text.primary,
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
  languageModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  languageModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOptionsContainer: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    backgroundColor: Colors.background,
  },
  languageOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 14,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  languageOptionTextSelected: {
    color: Colors.primary,
  },
  languageSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  languageCloseButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
  },
  languageCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default LoginScreen;

