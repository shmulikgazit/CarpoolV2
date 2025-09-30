import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_CODES, validatePhoneNumber, formatPhoneNumber } from '../utils/phoneValidation';

const LoginScreen = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('+972');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { loginWithPhone } = useAuth();

  // Simple country selection function
  const cycleCountryCode = () => {
    const currentIndex = COUNTRY_CODES.findIndex(c => c.code === countryCode);
    const nextIndex = (currentIndex + 1) % COUNTRY_CODES.length;
    setCountryCode(COUNTRY_CODES[nextIndex].code);
  };

  const handleLogin = async () => {
    const fullPhone = countryCode + phoneNumber.replace(/^0+/, ''); // Remove leading zeros
    const validation = validatePhoneNumber(fullPhone);
    
    console.log('Login attempt:', {
      countryCode,
      phoneNumber,
      fullPhone,
      validation
    });
    
    if (!validation.isValid) {
      Alert.alert('Invalid Phone Number', validation.error);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Calling loginWithPhone with:', validation.formatted);
      const result = await loginWithPhone(validation.formatted);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, user type:', result.userType);
        // Navigation will be handled by the main App component
        // Don't do anything here, let the AppNavigator handle it
        return; // Exit early to prevent double execution
      } else {
        console.log('User not found, navigating to setup');
        // User not found, navigate to setup
        navigation.navigate('Setup', { phone: validation.formatted });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🚗 Carpool App</Text>
          <Text style={styles.subtitle}>Connect with your carpool community</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          
          <View style={styles.phoneContainer}>
            <TouchableOpacity 
              style={[styles.countryCodeContainer, styles.tappableButton]}
              onPress={cycleCountryCode}
              activeOpacity={0.7}
            >
              <Text style={styles.countryCodeText}>
                {COUNTRY_CODES.find(c => c.code === countryCode)?.flag} {countryCode}
              </Text>
              <Text style={styles.dropdownArrow}>TAP ME</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="50-123-4567"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <Text style={styles.hint}>
            Tap the country code to change it. Enter phone number to continue.
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !phoneNumber.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            No passwords required! We'll find your profile using your phone number.
          </Text>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCodeContainer: {
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: 'bold',
  },
  tappableButton: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db',
    borderWidth: 2,
  },
  phoneInput: {
    flex: 2,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  hint: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  countryItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  selectedCountryItem: {
    backgroundColor: '#e8f4fd',
  },
  countryItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default LoginScreen;
