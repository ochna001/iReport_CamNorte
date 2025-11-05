import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGuestAgreement, setShowGuestAgreement] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleGuestAccessClick = () => {
    setShowGuestAgreement(true);
  };

  const handleContinueAsGuest = async () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert('Agreement Required', 'Please agree to the Terms of Service and Privacy Policy to continue as guest.');
      return;
    }

    try {
      setLoading(true);
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to continue as guest. Please try again.');
      console.error('Guest sign-in error:', error);
    } finally {
      setLoading(false);
      setShowGuestAgreement(false);
    }
  };

  const handleLogin = () => {
    router.push('/screens/LoginScreen');
  };

  const handleSignUp = () => {
    router.push('/screens/SignUpScreen');
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'For life-threatening emergencies requiring immediate response, you can call 911 directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call 911', 
          onPress: () => Linking.openURL('tel:911'),
          style: 'default'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logov1-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>iReport</Text>
          <Text style={styles.appSubtitle}>Camarines Norte</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.welcomeTitle}>Report Incidents Instantly</Text>
          <Text style={styles.welcomeDescription}>
            Help keep our community safe by reporting crimes, fires, and disasters to the right authorities.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Continue as Guest */}
          <TouchableOpacity 
            style={[styles.guestButton, loading && styles.buttonDisabled]}
            onPress={handleGuestAccessClick}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
                <Text style={styles.guestButtonSubtext}>Quick reporting without account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity 
            style={styles.signUpLink}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpLinkText}>
              Don't have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity onPress={handleEmergencyCall}>
          <Text style={styles.footer}>
            Life-threatening emergency? <Text style={styles.footerLink}>Tap to call 911</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guest Agreement Modal */}
      {showGuestAgreement && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guest Access Agreement</Text>
            <Text style={styles.modalText}>
              As a guest, your reports will be temporary and lost if you logout. Please agree to our policies to continue.
            </Text>

            <View style={styles.agreementContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms ? (
                  <CheckSquare size={24} color={Colors.primary} />
                ) : (
                  <Square size={24} color="#666" />
                )}
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>
                    I agree to the{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL('https://github.com/ochna001/iReport_CamNorte/blob/main/TERMS_OF_SERVICE.md')}
                    >
                      Terms of Service
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
              >
                {agreedToPrivacy ? (
                  <CheckSquare size={24} color={Colors.primary} />
                ) : (
                  <Square size={24} color="#666" />
                )}
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>
                    I agree to the{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL('https://github.com/ochna001/iReport_CamNorte/blob/main/PRIVACY_POLICY.md')}
                    >
                      Privacy Policy
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, (!agreedToTerms || !agreedToPrivacy) && styles.modalButtonDisabled]}
                onPress={handleContinueAsGuest}
                disabled={!agreedToTerms || !agreedToPrivacy || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
  textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  guestButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  guestButtonSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    width: '100%',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  signUpLink: {
    padding: 12,
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signUpLinkBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footer: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 'auto',
  },
  footerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  modalButtonDisabled: {
    opacity: 0.5,
  },
});
