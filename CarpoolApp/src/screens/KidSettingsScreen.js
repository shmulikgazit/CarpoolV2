import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { updateKid } from '../services/dataService';

const KidSettingsScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    school: '',
    parentPhone: '',
    timetable: {
      morning: '8am',
      afternoon: '2pm'
    },
    isActive: true
  });

  const timeOptions = {
    morning: ['7am', '8am', '9am'],
    afternoon: ['1pm', '2pm', '3pm']
  };

  const gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        grade: user.grade?.toString() || '',
        school: user.school || '',
        parentPhone: user.parentPhone || '',
        timetable: user.timetable || {
          morning: '8am',
          afternoon: '2pm'
        },
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

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
      const updates = {
        name: formData.name.trim(),
        grade: parseInt(formData.grade),
        school: formData.school.trim(),
        parentPhone: formData.parentPhone.trim(),
        timetable: formData.timetable,
        isActive: formData.isActive
      };

      await updateKid(user.id, updates);
      await updateUser(updates);
      
      Alert.alert('Success', 'Your settings have been updated.');
    } catch (error) {
      console.error('Error updating kid:', error);
      Alert.alert('Error', 'Failed to update your settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Settings</Text>
        <Text style={styles.subtitle}>Manage your profile and schedule</Text>
      </View>

      <View style={styles.form}>
        {/* Active Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {formData.isActive ? '✅ Active' : '❌ Inactive'}
            </Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
            />
          </View>
          <Text style={styles.statusHint}>
            {formData.isActive 
              ? 'You are participating in carpools'
              : 'You are not participating in carpools (e.g., absent from school)'
            }
          </Text>
        </View>

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
            placeholder="e.g., Meitarim Raanana"
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
          Set your typical school hours. This helps parents know when you need rides.
        </Text>

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>🌅 Morning (to school)</Text>
            <Text style={styles.scheduleDescription}>
              What time do you usually need to be at school?
            </Text>
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
            <Text style={styles.scheduleLabel}>🌇 Afternoon (from school)</Text>
            <Text style={styles.scheduleDescription}>
              What time do you usually finish school?
            </Text>
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

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            • Your schedule helps parents plan carpools{'\n'}
            • You can request rides for different times when needed{'\n'}
            • You can choose which car to join if there are multiple options{'\n'}
            • Your parent will get notifications about your carpool status
          </Text>
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
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.phoneNumber}>Phone: {user?.phone}</Text>
        {user?.parentPhone && (
          <Text style={styles.parentPhone}>Parent: {user.parentPhone}</Text>
        )}
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  statusSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusHint: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
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
  scheduleSection: {
    gap: 16,
  },
  scheduleItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
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
  footer: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 8,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  parentPhone: {
    fontSize: 14,
    color: '#95a5a6',
  },
});

export default KidSettingsScreen;
