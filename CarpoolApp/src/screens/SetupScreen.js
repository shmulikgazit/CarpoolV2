import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const SetupScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [selectedRole, setSelectedRole] = useState(null);
  const { updateUser } = useAuth();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Selection Required', 'Please select whether you are a parent or a kid.');
      return;
    }

    if (selectedRole === 'parent') {
      navigation.navigate('ParentSetup', { phone });
    } else {
      navigation.navigate('KidSetup', { phone });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome! 👋</Text>
        <Text style={styles.subtitle}>
          We couldn't find an existing profile for {phone}
        </Text>
        <Text style={styles.description}>
          Let's set up your account. Are you a parent or a student?
        </Text>
      </View>

      <View style={styles.roleSelection}>
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'parent' && styles.roleCardSelected
          ]}
          onPress={() => handleRoleSelection('parent')}
        >
          <Text style={styles.roleIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.roleTitle}>I'm a Parent</Text>
          <Text style={styles.roleDescription}>
            • Manage car availability
            • Set up driving schedule
            • Track kids' carpools
            • Coordinate with other parents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'kid' && styles.roleCardSelected
          ]}
          onPress={() => handleRoleSelection('kid')}
        >
          <Text style={styles.roleIcon}>🎒</Text>
          <Text style={styles.roleTitle}>I'm a Student</Text>
          <Text style={styles.roleDescription}>
            • Set my school schedule
            • Request rides
            • Choose preferred carpools
            • Stay connected with friends
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedRole && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text style={styles.continueButtonText}>Continue Setup</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't worry, you can always change these settings later in your profile.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 24,
  },
  roleSelection: {
    padding: 24,
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  roleIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#3498db',
    marginHorizontal: 24,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SetupScreen;
