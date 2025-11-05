import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

  const handleContinueAsGuest = async () => {
    try {
      setLoading(true);
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to continue as guest. Please try again.');
      console.error('Guest sign-in error:', error);
    } finally {
      setLoading(false);
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
            onPress={handleContinueAsGuest}
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
});
