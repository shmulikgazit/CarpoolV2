import { getTodaysCarpool, createCarpool, updateCarpool } from './dataService';

// Time slots for carpools
export const TIME_SLOTS = {
  MORNING: ['7am', '8am', '9am'],
  AFTERNOON: ['1pm', '2pm', '3pm']
};

// Get next carpool date (tomorrow if after 6pm, today if before)
export const getNextCarpoolDate = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // If it's after 6 PM, show tomorrow's carpool
  if (hour >= 18) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  return now;
};

// Get next carpool shift (morning or afternoon)
export const getNextCarpoolShift = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // If it's before 12 PM, next shift is morning
  // If it's after 12 PM, next shift is afternoon (or next day's morning if after 6 PM)
  if (hour < 12) {
    return 'morning';
  } else if (hour < 18) {
    return 'afternoon';
  } else {
    return 'morning'; // Next day's morning
  }
};

// Initialize empty carpool structure
export const createEmptyCarpool = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  return {
    date: dateStr,
    morning: {
      '7am': { cars: [], unassignedKids: [] },
      '8am': { cars: [], unassignedKids: [] },
      '9am': { cars: [], unassignedKids: [] }
    },
    afternoon: {
      '1pm': { cars: [], unassignedKids: [] },
      '2pm': { cars: [], unassignedKids: [] },
      '3pm': { cars: [], unassignedKids: [] }
    },
    notifications: []
  };
};

// Assign kid to a car automatically
export const assignKidToCar = (carpool, kidId, kidName, timeSlot, shift, preferredCarId = null) => {
  const slotData = carpool[shift][timeSlot];
  
  // First, try to assign to preferred car if specified and has space
  if (preferredCarId) {
    const preferredCar = slotData.cars.find(car => car.id === preferredCarId);
    if (preferredCar && preferredCar.assignedKids.length < preferredCar.seats) {
      preferredCar.assignedKids.push({ id: kidId, name: kidName });
      return { success: true, carId: preferredCarId };
    }
  }
  
  // Find available car with space
  const availableCar = slotData.cars.find(car => 
    car.assignedKids.length < car.seats
  );
  
  if (availableCar) {
    availableCar.assignedKids.push({ id: kidId, name: kidName });
    return { success: true, carId: availableCar.id };
  }
  
  // No available car, add to unassigned
  slotData.unassignedKids.push({ id: kidId, name: kidName });
  return { success: false, reason: 'No available cars' };
};

// Remove kid from carpool
export const removeKidFromCarpool = (carpool, kidId, timeSlot, shift) => {
  const slotData = carpool[shift][timeSlot];
  
  // Remove from cars
  slotData.cars.forEach(car => {
    car.assignedKids = car.assignedKids.filter(kid => kid.id !== kidId);
  });
  
  // Remove from unassigned
  slotData.unassignedKids = slotData.unassignedKids.filter(kid => kid.id !== kidId);
};

// Add car to carpool
export const addCarToCarpool = (carpool, parentId, parentName, carData, timeSlot, shift, isAvailable = true) => {
  const slotData = carpool[shift][timeSlot];
  
  const car = {
    id: `${parentId}-${carData.plate}`,
    parentId,
    parentName,
    plate: carData.plate,
    seats: carData.seats,
    assignedKids: [],
    isAvailable,
    isTaxi: carData.isTaxi || false
  };
  
  // Check if car already exists
  const existingCarIndex = slotData.cars.findIndex(c => c.id === car.id);
  if (existingCarIndex >= 0) {
    slotData.cars[existingCarIndex] = car;
  } else {
    slotData.cars.push(car);
  }
  
  return car.id;
};

// Remove car from carpool
export const removeCarFromCarpool = (carpool, carId, timeSlot, shift) => {
  const slotData = carpool[shift][timeSlot];
  const carIndex = slotData.cars.findIndex(car => car.id === carId);
  
  if (carIndex >= 0) {
    const car = slotData.cars[carIndex];
    
    // Move assigned kids to unassigned
    car.assignedKids.forEach(kid => {
      slotData.unassignedKids.push(kid);
    });
    
    // Remove car
    slotData.cars.splice(carIndex, 1);
    
    // Add notification
    if (car.assignedKids.length > 0) {
      const kidNames = car.assignedKids.map(kid => kid.name).join(', ');
      carpool.notifications.push({
        id: Date.now().toString(),
        type: 'car_withdrawn',
        message: `${car.parentName} withdrew their car. Kids need new rides: ${kidNames}`,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Mark car as unavailable (red)
export const markCarUnavailable = (carpool, carId, timeSlot, shift) => {
  const slotData = carpool[shift][timeSlot];
  const car = slotData.cars.find(c => c.id === carId);
  
  if (car) {
    car.isAvailable = false;
    
    if (car.assignedKids.length > 0) {
      const kidNames = car.assignedKids.map(kid => kid.name).join(', ');
      carpool.notifications.push({
        id: Date.now().toString(),
        type: 'car_unavailable',
        message: `${car.parentName} is requesting to withdraw. Kids need new rides: ${kidNames}`,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Calculate available seats for a car
export const getAvailableSeats = (car) => {
  return car.seats - car.assignedKids.length;
};

// Get carpool summary
export const getCarpoolSummary = (carpool, shift, timeSlot) => {
  const slotData = carpool[shift][timeSlot];
  
  return {
    totalCars: slotData.cars.length,
    availableCars: slotData.cars.filter(car => car.isAvailable).length,
    totalSeats: slotData.cars.reduce((sum, car) => sum + car.seats, 0),
    occupiedSeats: slotData.cars.reduce((sum, car) => sum + car.assignedKids.length, 0),
    unassignedKids: slotData.unassignedKids.length
  };
};

// Auto-assign unassigned kids to available cars
export const autoAssignUnassignedKids = (carpool, shift, timeSlot) => {
  const slotData = carpool[shift][timeSlot];
  const unassigned = [...slotData.unassignedKids];
  
  slotData.unassignedKids = [];
  
  unassigned.forEach(kid => {
    const result = assignKidToCar(carpool, kid.id, kid.name, timeSlot, shift);
    if (!result.success) {
      slotData.unassignedKids.push(kid);
    }
  });
  
  return slotData.unassignedKids.length;
};

// Get or create today's carpool
export const getOrCreateTodaysCarpool = async (date = getNextCarpoolDate()) => {
  try {
    let carpool = await getTodaysCarpool(date);
    
    if (!carpool) {
      const newCarpool = createEmptyCarpool(date);
      const carpoolId = await createCarpool(newCarpool);
      carpool = { id: carpoolId, ...newCarpool };
    }
    
    return carpool;
  } catch (error) {
    console.error('Error getting or creating carpool:', error);
    throw error;
  }
};

// Save carpool changes
export const saveCarpoolChanges = async (carpoolId, carpool) => {
  try {
    await updateCarpool(carpoolId, carpool);
  } catch (error) {
    console.error('Error saving carpool changes:', error);
    throw error;
  }
};

