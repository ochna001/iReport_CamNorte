import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { supabase } from '../../lib/supabase';

const VerifyOtpScreen = () => {
  const router = useRouter();
  const { email, displayName, dateOfBirth, phoneNumber, password } = useLocalSearchParams<{ 
    email: string;
    displayName: string;
    dateOfBirth: string;
    phoneNumber: string;
    password: string;
  }>();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [clipboardChecked, setClipboardChecked] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Check clipboard for OTP code on mount
  useEffect(() => {
    const checkClipboard = async () => {
      if (clipboardChecked) return;
      
      try {
        const text = await Clipboard.getStringAsync();
        // Check if clipboard contains a 6-digit code
        const otpMatch = text.match(/\b\d{6}\b/);
        
        if (otpMatch) {
          const code = otpMatch[0];
          // Auto-fill the OTP
          const newOtp = code.split('');
          setOtp(newOtp);
          setClipboardChecked(true);
          
          // Show helpful message
          Alert.alert(
            'Code Detected',
            `Found code ${code} in clipboard. Auto-filled for you!`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        // Clipboard access failed, ignore
        console.log('Clipboard check failed:', error);
      }
    };

    // Check clipboard after a short delay
    const timer = setTimeout(checkClipboard, 500);
    return () => clearTimeout(timer);
  }, [clipboardChecked]);

  // Manual clipboard paste button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const otpMatch = text.match(/\b\d{6}\b/);
      
      if (otpMatch) {
        const code = otpMatch[0];
        const newOtp = code.split('');
        setOtp(newOtp);
        Alert.alert('Success', 'Code pasted from clipboard!');
      } else {
        Alert.alert('No Code Found', 'Clipboard does not contain a 6-digit code.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard.');
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    // Only allow single digits (0-9)
    if (/^[0-9]$/.test(text) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input when digit is entered
      if (text !== '' && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    if (!email) {
        Alert.alert('Error', 'Email not found. Please go back and try signing up again.');
        setLoading(false);
        return;
    }

    // Step 1: Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });

    if (error) {
      setLoading(false);
      Alert.alert('Verification Failed', error.message);
      return;
    }

    // Step 2: Update user metadata and create profile
    if (data.user) {
      // Calculate age from date of birth
      let age = null;
      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const calculatedAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        age = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? calculatedAge - 1 : calculatedAge;
      }

      // Update user metadata with name and DOB
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: displayName || 'User',
          date_of_birth: dateOfBirth || null,
        }
      });

      if (updateError) {
        console.error('Metadata update error:', updateError);
      }

      // Wait for the trigger to complete creating the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile details using RPC function (bypasses RLS)
      const { data: rpcResult, error: profileUpdateError } = await supabase
        .rpc('update_user_profile_after_signup', {
          user_id: data.user.id,
          p_display_name: displayName || 'User',
          p_phone_number: phoneNumber || '',
          p_age: age,
          p_date_of_birth: dateOfBirth || null,
        });

      if (profileUpdateError || (rpcResult && !rpcResult.success)) {
        console.error('Profile update error:', profileUpdateError || rpcResult?.message);
        // Non-blocking: allow the flow to continue but inform the user
        Alert.alert(
          'Profile Update Warning',
          'Your account was created but we could not save your profile details automatically. You can update them later from your profile screen.'
        );
      } else {
        console.log('Profile updated successfully via RPC');
      }

      // Link guest reports to new account
      const guestSessionId = await AsyncStorage.getItem('@guest_session_id');
      if (guestSessionId) {
        console.log('Linking guest reports from:', guestSessionId, 'to new user:', data.user.id);
        // Update all incidents created by guest to link to new user
        const { error: linkError } = await supabase
          .from('incidents')
          .update({ reporter_id: data.user.id })
          .eq('reporter_id', guestSessionId);
        
        if (linkError) {
          console.error('Error linking guest reports:', linkError);
        } else {
          console.log('Successfully linked guest reports to new account');
          // Clear guest session after linking
          await AsyncStorage.removeItem('@guest_session_id');
        }
      }
    }

    // Enable biometric by default if device supports it
    try {
      const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
      if (biometricAvailable && email && password) {
        // Enable biometric login by default
        await AsyncStorage.setItem('biometric_enabled', 'true');
        // Save credentials securely for biometric login
        await SecureStore.setItemAsync('biometric_email', email);
        await SecureStore.setItemAsync('biometric_password', password);
        console.log('Biometric login enabled by default for new user');
      }
    } catch (biometricError) {
      console.error('Error setting up biometric:', biometricError);
      // Non-critical, continue anyway
    }

    setLoading(false);

    // Auto-login: User is already authenticated after verifyOtp
    // Just navigate to home screen
    Alert.alert('Success!', 'Your account has been verified!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    if (!email) {
        Alert.alert('Error', 'Email not found. Cannot resend OTP.');
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } else {
      Alert.alert('Success', 'A new verification code has been sent to your email.');
      setResendCooldown(30);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              value={digit}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handlePasteFromClipboard} style={styles.pasteButton}>
            <Text style={styles.pasteButtonText}>📋 Paste Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={styles.resendText}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Go Back </Text>
        </TouchableOpacity>

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
  },
  pasteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  pasteButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendText: {
    color: Colors.primary,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
  }
});

export default VerifyOtpScreen;
