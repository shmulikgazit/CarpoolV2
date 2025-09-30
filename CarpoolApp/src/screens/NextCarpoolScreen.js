import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { 
  getOrCreateTodaysCarpool, 
  saveCarpoolChanges, 
  getNextCarpoolShift, 
  getNextCarpoolDate,
  addCarToCarpool,
  removeCarFromCarpool,
  assignKidToCar,
  removeKidFromCarpool,
  markCarUnavailable,
  getCarpoolSummary
} from '../services/carpoolService';
import { subscribeToTodaysCarpool } from '../services/dataService';

const NextCarpoolScreen = ({ navigation }) => {
  const { user, userType, refreshUser } = useAuth();
  const [carpool, setCarpool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('8am');
  const [selectedShift, setSelectedShift] = useState('morning');

  useEffect(() => {
    // Set the next shift and time slot on load
    setSelectedShift(getNextCarpoolShift());
    loadCarpool();
  }, []);

  // Reload carpool when screen comes into focus (e.g., returning from Settings)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCarpool();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToTodaysCarpool((updatedCarpool) => {
      if (updatedCarpool) {
        setCarpool(updatedCarpool);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const loadCarpool = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading carpool...');
      
      // Refresh user data from Firebase to get latest availability
      if (userType === 'parent' && refreshUser) {
        console.log('🔄 Refreshing user data from Firebase...');
        await refreshUser();
      }
      
      const carpoolData = await getOrCreateTodaysCarpool();
      
      // Auto-add parent's car based on availability
      if (userType === 'parent' && user && user.cars && user.cars.length > 0) {
        console.log('🔍 Checking if should auto-add cars...');
        if (user.availability) {
          await autoAddParentCars(carpoolData);
        } else {
          console.log('⚠️  User has no availability data');
        }
      } else {
        console.log('ℹ️  Not a parent or no cars:', {
          userType,
          hasCars: user?.cars?.length > 0
        });
      }
      
      setCarpool(carpoolData);
      console.log('✅ Carpool loaded');
    } catch (error) {
      console.error('❌ Error loading carpool:', error);
      Alert.alert('Error', 'Failed to load carpool data');
    } finally {
      setLoading(false);
    }
  };

  const autoAddParentCars = async (carpoolData) => {
    try {
      console.log('🚗 Auto-add cars: Starting...');
      console.log('   User:', user.name);
      console.log('   Cars:', user.cars?.length);
      console.log('   Availability:', user.availability ? 'present' : 'missing');
      
      const defaultCar = user.cars.find(car => car.isDefault) || user.cars[0];
      const carId = `${user.id}-${defaultCar.plate}`;
      const nextDate = getNextCarpoolDate();
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDate.getDay()];
      
      console.log('   Day of week:', dayOfWeek);
      console.log('   Date:', nextDate.toDateString());
      
      // Check parent's availability for today
      const todayAvailability = user.availability[dayOfWeek];
      console.log('   Today availability:', todayAvailability);
      
      if (!todayAvailability) {
        console.log('   ❌ No availability for', dayOfWeek);
        return;
      }
      
      let carpoolUpdated = false;
      
      // Check morning slots
      if (todayAvailability.morning && Array.isArray(todayAvailability.morning)) {
        console.log('   Morning slots to add:', todayAvailability.morning);
        for (const timeSlot of todayAvailability.morning) {
          const slotData = carpoolData.morning[timeSlot];
          if (slotData && !slotData.cars.some(car => car.id === carId)) {
            console.log('   ✅ Adding car to', timeSlot, 'morning');
            addCarToCarpool(carpoolData, user.id, user.name, defaultCar, timeSlot, 'morning');
            carpoolUpdated = true;
          } else {
            console.log('   ⚪ Car already in', timeSlot, 'morning');
          }
        }
      }
      
      // Check afternoon slots
      if (todayAvailability.afternoon && Array.isArray(todayAvailability.afternoon)) {
        console.log('   Afternoon slots to add:', todayAvailability.afternoon);
        for (const timeSlot of todayAvailability.afternoon) {
          const slotData = carpoolData.afternoon[timeSlot];
          if (slotData && !slotData.cars.some(car => car.id === carId)) {
            console.log('   ✅ Adding car to', timeSlot, 'afternoon');
            addCarToCarpool(carpoolData, user.id, user.name, defaultCar, timeSlot, 'afternoon');
            carpoolUpdated = true;
          } else {
            console.log('   ⚪ Car already in', timeSlot, 'afternoon');
          }
        }
      }
      
      // Save if changes were made
      if (carpoolUpdated) {
        console.log('   💾 Saving carpool changes...');
        await saveCarpoolChanges(carpoolData.id, carpoolData);
        console.log('   ✅ Carpool saved!');
      } else {
        console.log('   ℹ️  No changes needed');
      }
    } catch (error) {
      console.error('❌ Error auto-adding parent cars:', error);
      // Don't show error to user, just log it
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCarpool();
    setRefreshing(false);
  };

  const handleToggleAvailability = async () => {
    if (userType !== 'parent' || !user.cars || user.cars.length === 0) {
      Alert.alert('No Cars', 'You need to add cars in your settings first.');
      return;
    }

    try {
      const updatedCarpool = { ...carpool };
      const defaultCar = user.cars.find(car => car.isDefault) || user.cars[0];
      const carId = `${user.id}-${defaultCar.plate}`;
      
      // Check if car is already in this time slot
      const slotData = updatedCarpool[selectedShift][selectedTimeSlot];
      const existingCar = slotData.cars.find(car => car.id === carId);

      if (existingCar) {
        // Remove car
        removeCarFromCarpool(updatedCarpool, carId, selectedTimeSlot, selectedShift);
      } else {
        // Add car
        addCarToCarpool(
          updatedCarpool, 
          user.id, 
          user.name, 
          defaultCar, 
          selectedTimeSlot, 
          selectedShift
        );
      }

      await saveCarpoolChanges(carpool.id, updatedCarpool);
      setCarpool(updatedCarpool);
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleJoinCar = async (carId, timeSlot = selectedTimeSlot, shift = selectedShift) => {
    if (userType !== 'kid') return;

    try {
      const updatedCarpool = { ...carpool };
      
      // Remove kid from current assignment first
      removeKidFromCarpool(updatedCarpool, user.id, timeSlot, shift);
      
      // Assign to new car
      const result = assignKidToCar(
        updatedCarpool, 
        user.id, 
        user.name, 
        timeSlot, 
        shift, 
        carId
      );

      if (result.success) {
        await saveCarpoolChanges(carpool.id, updatedCarpool);
        setCarpool(updatedCarpool);
        Alert.alert('Success', `Joined ${timeSlot} carpool!`);
      } else {
        Alert.alert('Cannot Join', result.reason || 'Car is full');
      }
    } catch (error) {
      console.error('Error joining car:', error);
      Alert.alert('Error', 'Failed to join car');
    }
  };

  const renderCompactCar = (car, timeSlot, shift) => {
    const availableSeats = car.seats - car.assignedKids.length;
    const isUserCar = userType === 'parent' && car.parentId === user.id;
    
    return (
      <View key={car.id} style={[
        styles.compactCarCard,
        !car.isAvailable && styles.compactCarUnavailable,
        isUserCar && styles.compactUserCar
      ]}>
        <View style={styles.compactCarHeader}>
          <Text style={styles.compactCarIcon}>{car.isTaxi ? '🚕' : '🚗'}</Text>
          <View style={styles.compactCarInfo}>
            <Text style={styles.compactParentName}>{car.parentName}</Text>
            <Text style={styles.compactSeats}>{car.assignedKids.length}/{car.seats}</Text>
          </View>
        </View>
        <View style={styles.compactKidsList}>
          {car.assignedKids.length > 0 ? (
            <Text style={styles.compactKidName}>
              {car.assignedKids.map(kid => kid.name).join(' • ')}
            </Text>
          ) : (
            <Text style={styles.compactEmptyText}>Available</Text>
          )}
        </View>
        {userType === 'kid' && car.isAvailable && availableSeats > 0 && (
          <TouchableOpacity
            style={styles.compactJoinButton}
            onPress={() => handleJoinCar(car.id, timeSlot, shift)}
          >
            <Text style={styles.compactJoinText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTimeSlot = (timeSlot, shift, shiftData) => {
    const slotData = shiftData[timeSlot];
    
    return (
      <View key={timeSlot} style={styles.timeSlotSection}>
        <Text style={styles.timeSlotHeader}>{timeSlot}</Text>
        {slotData.cars.length === 0 ? (
          <Text style={styles.noCarsText}>No rides</Text>
        ) : (
          slotData.cars.map(car => renderCompactCar(car, timeSlot, shift))
        )}
        {slotData.unassignedKids.length > 0 && (
          <View style={styles.unassignedCompact}>
            <Text style={styles.unassignedCompactText}>
              ⚠️ Need rides: {slotData.unassignedKids.map(k => k.name).join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderUnassignedKids = () => {
    if (!carpool) return null;
    
    const slotData = carpool[selectedShift][selectedTimeSlot];
    if (slotData.unassignedKids.length === 0) return null;

    return (
      <View style={styles.unassignedSection}>
        <Text style={styles.unassignedTitle}>🚨 Kids Need Rides</Text>
        <View style={styles.unassignedKids}>
          {slotData.unassignedKids.map(kid => (
            <View key={kid.id} style={styles.unassignedKid}>
              <Text style={styles.unassignedKidName}>{kid.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderNotifications = () => {
    if (!carpool || !carpool.notifications || carpool.notifications.length === 0) {
      return null;
    }

    return (
      <View style={styles.notificationsSection}>
        <Text style={styles.notificationsTitle}>📢 Recent Updates</Text>
        {carpool.notifications.slice(-3).map(notification => (
          <View key={notification.id} style={styles.notification}>
            <Text style={styles.notificationText}>{notification.message}</Text>
            <Text style={styles.notificationTime}>
              {new Date(notification.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading carpool...</Text>
      </View>
    );
  }

  if (!carpool) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load carpool data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCarpool}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextDate = getNextCarpoolDate();
  const isToday = nextDate.toDateString() === new Date().toDateString();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {isToday ? "Today's" : "Tomorrow's"} Carpool
        </Text>
        <Text style={styles.date}>
          {nextDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Shift Selector */}
      <View style={styles.shiftSelector}>
        <TouchableOpacity
          style={[styles.shiftTab, selectedShift === 'morning' && styles.shiftTabActive]}
          onPress={() => setSelectedShift('morning')}
        >
          <Text style={[styles.shiftTabText, selectedShift === 'morning' && styles.shiftTabActiveText]}>
            🌅 Morning
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shiftTab, selectedShift === 'afternoon' && styles.shiftTabActive]}
          onPress={() => setSelectedShift('afternoon')}
        >
          <Text style={[styles.shiftTabText, selectedShift === 'afternoon' && styles.shiftTabActiveText]}>
            🌇 Afternoon
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Schedule View */}
      <View style={styles.scheduleContainer}>
        {selectedShift === 'morning' ? (
          <>
            {renderTimeSlot('7am', 'morning', carpool.morning)}
            {renderTimeSlot('8am', 'morning', carpool.morning)}
            {renderTimeSlot('9am', 'morning', carpool.morning)}
          </>
        ) : (
          <>
            {renderTimeSlot('1pm', 'afternoon', carpool.afternoon)}
            {renderTimeSlot('2pm', 'afternoon', carpool.afternoon)}
            {renderTimeSlot('3pm', 'afternoon', carpool.afternoon)}
          </>
        )}
      </View>

      {/* Notifications */}
      {renderNotifications()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  shiftSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shiftTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  shiftTabActive: {
    backgroundColor: '#3498db',
  },
  shiftTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  shiftTabActiveText: {
    color: '#ffffff',
  },
  scheduleContainer: {
    padding: 16,
  },
  timeSlotSection: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeSlotHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  noCarsText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  compactCarCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  compactCarUnavailable: {
    backgroundColor: '#fff5f5',
    borderColor: '#f56565',
  },
  compactUserCar: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db',
    borderWidth: 2,
  },
  compactCarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactCarIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactCarInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactParentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  compactSeats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  compactKidsList: {
    marginLeft: 28,
  },
  compactKidName: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  compactEmptyText: {
    fontSize: 13,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  compactJoinButton: {
    backgroundColor: '#3498db',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    marginLeft: 28,
  },
  compactJoinText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  unassignedCompact: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  unassignedCompactText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
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
  },
  date: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  timeSelector: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
  },
  timeSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  shiftButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  shiftButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  shiftButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  shiftButtonTextActive: {
    color: '#ffffff',
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  timeButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  timeButtonTextActive: {
    color: '#ffffff',
  },
  summary: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '600',
  },
  summaryWarning: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 4,
    fontWeight: '600',
  },
  availabilityButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  carsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  noCars: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noCarsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  noCarsHint: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  carCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  carCardUnavailable: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdedec',
  },
  userCarCard: {
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  carInfo: {
    flex: 1,
  },
  carParent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  carPlate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  seatInfo: {
    alignItems: 'center',
  },
  seatCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  seatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  kidsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  kidChip: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  currentUserChip: {
    backgroundColor: '#3498db',
  },
  kidName: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  emptySeat: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  emptySeatText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  joinButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#e74c3c',
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  unavailableNotice: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  unavailableText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  unassignedSection: {
    backgroundColor: '#fff5f5',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  unassignedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: 12,
  },
  unassignedKids: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unassignedKid: {
    backgroundColor: '#fed7d7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e53e3e',
  },
  unassignedKidName: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '600',
  },
  notificationsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  notification: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default NextCarpoolScreen;
