import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabase';
import LocationCard from './components/LocationCard';

type Agency = 'PNP' | 'BFP' | 'PDRRMO';

const IncidentFormScreen = () => {
  const router = useRouter();
  const { agency, mediaUris, latitude, longitude } = useLocalSearchParams<{
    agency: Agency;
    mediaUris: string;
    latitude: string;
    longitude: string;
  }>();

  const { session, isAnonymous } = useAuth();
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  
  // Guest users need to provide contact info
  const isGuest = !session || isAnonymous;
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [residentLocation, setResidentLocation] = useState<Location.LocationObject | null>(null);
  const [incidentLocation, setIncidentLocation] = useState<Location.LocationObject | null>(null);
  const [currentDateTime] = useState(new Date());

  useEffect(() => {
    // Get resident's current location
    getCurrentLocation();
    // Set incident location from camera screen
    if (latitude && longitude) {
      setIncidentLocation({
        coords: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }
    
    // Auto-fill name and calculate age from DOB if logged in
    const fetchUserProfile = async () => {
      if (session?.user) {
        // Try metadata first
        const metadata = session.user.user_metadata;
        if (metadata?.full_name) {
          setName(metadata.full_name);
        }
        
        // Calculate age from date of birth
        if (metadata?.date_of_birth) {
          const dob = new Date(metadata.date_of_birth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
          setAge(actualAge.toString());
        }
        
        // Fallback: fetch from profiles table if metadata missing
        if (!metadata?.full_name || !metadata?.date_of_birth) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, date_of_birth')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            if (!metadata?.full_name && profile.display_name) {
              setName(profile.display_name);
            }
            if (!metadata?.date_of_birth && profile.date_of_birth) {
              const dob = new Date(profile.date_of_birth);
              const today = new Date();
              const age = today.getFullYear() - dob.getFullYear();
              const monthDiff = today.getMonth() - dob.getMonth();
              const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
              setAge(actualAge.toString());
            }
          }
        }
      }
    };
    
    fetchUserProfile();
  }, [latitude, longitude, session]);

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setResidentLocation(loc);
    } catch (error) {
      console.error('Error getting resident location:', error);
    }
  };

  const getAgencyColor = () => {
    switch (agency) {
      case 'PNP':
        return Colors.agencies.pnp;
      case 'BFP':
        return Colors.agencies.bfp;
      case 'PDRRMO':
        return Colors.agencies.pdrrmo;
      default:
        return Colors.primary;
    }
  };

  const getAgencyName = () => {
    switch (agency) {
      case 'PNP':
        return 'Crime Report';
      case 'BFP':
        return 'Fire Report';
      case 'PDRRMO':
        return 'Disaster Report';
      default:
        return 'Incident Report';
    }
  };

  const getSuggestedDescriptions = () => {
    switch (agency) {
      case 'PNP':
        return [
          'Theft/Robbery in progress',
          'Suspicious person/activity',
          'Physical assault/fight',
          'Vandalism/property damage',
          'Drug-related activity',
          'Domestic disturbance',
        ];
      case 'BFP':
        return [
          'Building/house fire',
          'Vehicle fire',
          'Electrical fire',
          'Grass/forest fire',
          'Smoke/burning smell',
          'Gas leak',
        ];
      case 'PDRRMO':
        return [
          'Flooding in area',
          'Landslide/mudslide',
          'Fallen tree blocking road',
          'Structural damage from storm',
          'Power lines down',
          'Earthquake damage',
        ];
      default:
        return [];
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    // Validate name
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters.');
      return;
    }
    if (name.length > 100) {
      Alert.alert('Name Too Long', 'Name must be less than 100 characters.');
      return;
    }
    
    // Validate age
    if (!age.trim() || isNaN(parseInt(age))) {
      Alert.alert('Required', 'Please enter a valid age.');
      return;
    }
    const ageNum = parseInt(age);
    if (ageNum < 13 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Age must be between 13 and 120.');
      return;
    }
    
    // Validate phone for guests (required)
    if (isGuest) {
      if (!phone.trim()) {
        Alert.alert('Required', 'Please enter your contact number so responders can reach you.');
        return;
      }
      // Basic Philippine phone validation (09XX or +639XX)
      const phoneClean = phone.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+63|0)?9\d{9}$/;
      if (!phoneRegex.test(phoneClean)) {
        Alert.alert('Invalid Phone', 'Please enter a valid Philippine mobile number (e.g., 09171234567).');
        return;
      }
    }
    
    // Validate description
    if (!description.trim()) {
      Alert.alert('Required', 'Please provide a description of the incident.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Description Too Short', 'Please provide at least 10 characters describing the incident.');
      return;
    }
    if (description.length > 5000) {
      Alert.alert('Description Too Long', 'Description must be less than 5000 characters.');
      return;
    }

    // Navigate to confirmation screen
    router.push({
      pathname: '/confirm-report',
      params: {
        agency,
        mediaUris,
        latitude,
        longitude,
        name,
        age,
        description,
        phone: isGuest ? phone : '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getAgencyColor() }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getAgencyName()}</Text>
          <Text style={styles.headerSubtitle}>Incident Details</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Report Information */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📋 Report Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoText}>{currentDateTime.toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoText}>
                {currentDateTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })} 
              </Text>
            </View>
            {mediaUris && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Evidence:</Text>
                <Text style={styles.infoText}>
                  {JSON.parse(mediaUris).length} photo(s)/video(s)
                </Text>
              </View>
            )}
          </View>

          {/* Resident Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>👤 Your Information</Text>
            
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.text.secondary}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor={Colors.text.secondary}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            {/* Phone number - required for guests */}
            {isGuest && (
              <>
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09171234567"
                  placeholderTextColor={Colors.text.secondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
                <Text style={styles.helperText}>
                  Required so responders can contact you about this incident
                </Text>
              </>
            )}
          </View>

          {/* Resident Location */}
          <LocationCard 
            location={residentLocation} 
            title="📍 Your Current Location" 
          />

          {/* Incident Location */}
          <LocationCard 
            location={incidentLocation} 
            title="🚨 Incident Location"
            editable={true}
            onLocationChange={setIncidentLocation}
          />

          {/* Description */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Incident Description *</Text>
            
            {/* Suggested Descriptions */}
            {showSuggestions && description === '' && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Quick Select:</Text>
                <View style={styles.suggestionsGrid}>
                  {getSuggestedDescriptions().map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionChip, { borderColor: getAgencyColor() }]}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text style={[styles.suggestionText, { color: getAgencyColor() }]}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.suggestionsHelper}>Or type your own below:</Text>
              </View>
            )}
            
            <TextInput
              style={styles.textArea}
              placeholder="Describe what happened, when it happened, and any other relevant details..."
              placeholderTextColor={Colors.text.secondary}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (text === '') setShowSuggestions(true);
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: getAgencyColor() }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsHelper: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default IncidentFormScreen;
