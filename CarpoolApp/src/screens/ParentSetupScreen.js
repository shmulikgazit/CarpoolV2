import React, { useState } from 'react';
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
import { createParent } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const ParentSetupScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const { loginWithPhone } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    cars: [],
    availability: {
      Sunday: { morning: [], afternoon: [] },
      Monday: { morning: [], afternoon: [] },
      Tuesday: { morning: [], afternoon: [] },
      Wednesday: { morning: [], afternoon: [] },
      Thursday: { morning: [], afternoon: [] }
    }
  });

  const morningSlots = ['7am', '8am', '9am'];
  const afternoonSlots = ['1pm', '2pm', '3pm'];

  const [newCar, setNewCar] = useState({
    plate: '',
    seats: '4',
    isDefault: true
  });

  const [showCarForm, setShowCarForm] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  const handleAddCar = () => {
    if (!newCar.plate.trim()) {
      Alert.alert('Required Field', 'Please enter the license plate number.');
      return;
    }

    const car = {
      plate: newCar.plate.trim(),
      seats: parseInt(newCar.seats) || 4,
      isDefault: formData.cars.length === 0 || newCar.isDefault
    };

    // If this is set as default, remove default from other cars
    if (car.isDefault) {
      formData.cars.forEach(c => c.isDefault = false);
    }

    setFormData(prev => ({
      ...prev,
      cars: [...prev.cars, car]
    }));

    setNewCar({ plate: '', seats: '4', isDefault: false });
    setShowCarForm(false);
  };

  const removeCar = (index) => {
    setFormData(prev => ({
      ...prev,
      cars: prev.cars.filter((_, i) => i !== index)
    }));
  };

  const toggleAvailability = (day, shift, timeSlot) => {
    setFormData(prev => {
      const currentSlots = prev.availability[day][shift];
      const isSelected = currentSlots.includes(timeSlot);
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            [shift]: isSelected
              ? currentSlots.filter(slot => slot !== timeSlot)
              : [...currentSlots, timeSlot]
          }
        }
      };
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      const parentData = {
        name: formData.name.trim(),
        phone: phone,
        school: formData.school.trim(),
        cars: formData.cars,
        availability: formData.availability,
        role: 'parent',
        isActive: true
      };

      await createParent(parentData);
      
      // Login with the new parent data
      await loginWithPhone(phone);
      
      Alert.alert('Success!', 'Your parent profile has been created.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);

    } catch (error) {
      console.error('Error creating parent:', error);
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parent Setup 👨‍👩‍👧‍👦</Text>
        <Text style={styles.subtitle}>Tell us about yourself and your availability</Text>
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
          <Text style={styles.label}>School</Text>
          <TextInput
            style={styles.input}
            value={formData.school}
            onChangeText={(text) => setFormData(prev => ({ ...prev, school: text }))}
            placeholder="e.g., Meitarim Raanana (optional)"
          />
        </View>

        <Text style={styles.sectionTitle}>Your Cars</Text>
        <Text style={styles.sectionDescription}>
          Add the cars you can use for carpools. You can add multiple cars or none if you don't drive.
        </Text>

        {formData.cars.map((car, index) => (
          <View key={index} style={styles.carItem}>
            <View style={styles.carInfo}>
              <Text style={styles.carPlate}>{car.plate}</Text>
              <Text style={styles.carDetails}>
                {car.seats} seats {car.isDefault && '(Default)'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeCar(index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!showCarForm ? (
          <TouchableOpacity
            style={styles.addCarButton}
            onPress={() => setShowCarForm(true)}
          >
            <Text style={styles.addCarButtonText}>+ Add Car</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.carForm}>
            <TextInput
              style={styles.input}
              value={newCar.plate}
              onChangeText={(text) => setNewCar(prev => ({ ...prev, plate: text }))}
              placeholder="License plate (e.g., 123-45-678)"
            />
            <TextInput
              style={styles.input}
              value={newCar.seats}
              onChangeText={(text) => setNewCar(prev => ({ ...prev, seats: text }))}
              placeholder="Number of seats"
              keyboardType="numeric"
            />
            <View style={styles.defaultCarRow}>
              <Text>Set as default car</Text>
              <Switch
                value={newCar.isDefault}
                onValueChange={(value) => setNewCar(prev => ({ ...prev, isDefault: value }))}
              />
            </View>
            <View style={styles.carFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCarForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCar}
              >
                <Text style={styles.addButtonText}>Add Car</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Default Availability</Text>
        <Text style={styles.sectionDescription}>
          Set your typical weekly availability. You can change this for specific days later.
        </Text>

        {days.map(day => (
          <View key={day} style={styles.availabilityDay}>
            <Text style={styles.dayName}>{day}</Text>
            
            {/* Morning time slots */}
            <Text style={styles.shiftLabel}>Morning</Text>
            <View style={styles.timeSlotRow}>
              {morningSlots.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlotChip,
                    formData.availability[day].morning.includes(slot) && styles.timeSlotChipSelected
                  ]}
                  onPress={() => toggleAvailability(day, 'morning', slot)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    formData.availability[day].morning.includes(slot) && styles.timeSlotTextSelected
                  ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Afternoon time slots */}
            <Text style={styles.shiftLabel}>Afternoon</Text>
            <View style={styles.timeSlotRow}>
              {afternoonSlots.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlotChip,
                    formData.availability[day].afternoon.includes(slot) && styles.timeSlotChipSelected
                  ]}
                  onPress={() => toggleAvailability(day, 'afternoon', slot)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    formData.availability[day].afternoon.includes(slot) && styles.timeSlotTextSelected
                  ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  carItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  carInfo: {
    flex: 1,
  },
  carPlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  carDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addCarButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addCarButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  carForm: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  defaultCarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  carFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  availabilityDay: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  shiftLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 8,
    marginBottom: 8,
  },
  timeSlotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  timeSlotChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  timeSlotChipSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f5e8',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  timeSlotTextSelected: {
    color: '#27ae60',
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

export default ParentSetupScreen;
