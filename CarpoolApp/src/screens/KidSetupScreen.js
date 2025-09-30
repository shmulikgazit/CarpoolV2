import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createKid } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const KidSetupScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const { loginWithPhone } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    school: '',
    parentPhone: '',
    timetable: {
      morning: '8am',
      afternoon: '2pm'
    }
  });

  const timeOptions = {
    morning: ['7am', '8am', '9am'],
    afternoon: ['1pm', '2pm', '3pm']
  };

  const gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    if (!formData.grade) {
      Alert.alert('Required Field', 'Please select your grade.');
      return;
    }

    if (!formData.parentPhone.trim()) {
      Alert.alert('Required Field', 'Please enter your parent\'s phone number.');
      return;
    }

    setLoading(true);

    try {
      const kidData = {
        name: formData.name.trim(),
        phone: phone,
        grade: parseInt(formData.grade),
        school: formData.school.trim(),
        parentPhone: formData.parentPhone.trim(),
        timetable: formData.timetable,
        role: 'kid',
        isActive: true
      };

      await createKid(kidData);
      
      // Login with the new kid data
      await loginWithPhone(phone);
      
      Alert.alert('Success!', 'Your student profile has been created.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);

    } catch (error) {
      console.error('Error creating kid:', error);
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Setup 🎒</Text>
        <Text style={styles.subtitle}>Tell us about your school schedule</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Grade *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.grade}
              onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select your grade" value="" />
              {gradeOptions.map(grade => (
                <Picker.Item
                  key={grade}
                  label={`Grade ${grade}`}
                  value={grade.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>School</Text>
          <TextInput
            style={styles.input}
            value={formData.school}
            onChangeText={(text) => setFormData(prev => ({ ...prev, school: text }))}
            placeholder="e.g., Meitarim Raanana (optional)"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Parent's Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.parentPhone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, parentPhone: text }))}
            placeholder="e.g., +972501234567"
            keyboardType="phone-pad"
          />
          <Text style={styles.fieldHint}>
            This links your profile to your parent's account
          </Text>
        </View>

        <Text style={styles.sectionTitle}>School Schedule</Text>
        <Text style={styles.sectionDescription}>
          Set your typical school hours. This helps us assign you to the right carpools.
        </Text>

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>Morning (to school)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.timetable.morning}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  timetable: { ...prev.timetable, morning: value }
                }))}
                style={styles.picker}
              >
                {timeOptions.morning.map(time => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>Afternoon (from school)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.timetable.afternoon}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  timetable: { ...prev.timetable, afternoon: value }
                }))}
                style={styles.picker}
              >
                {timeOptions.afternoon.map(time => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Create Profile</Text>
        )}
      </TouchableOpacity>
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
    fontSize: 24,
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
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  fieldHint: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 24,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KidSetupScreen;
