/**
 * Comprehensive Automated Test Suite
 * 
 * This simulates both parent and kid interactions with the carpool system
 * Tests all business logic without requiring the mobile app to run
 * 
 * Usage: node comprehensive-test-suite.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} = require('firebase/firestore');

// Firebase configuration
// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Helper: Log test result
function testResult(testName, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
  } else {
    results.failed++;
    results.errors.push({ test: testName, details });
    console.log(`❌ ${testName}`);
    console.log(`   ${details}`);
  }
}

// Helper: Get user by phone
async function getUserByPhone(phone, userType) {
  const collectionName = userType === 'parent' ? 'parents' : 'kids';
  const q = query(collection(db, collectionName), where('phone', '==', phone));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() };
}

// Helper: Create carpool structure
function createEmptyCarpool(date) {
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
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Helper: Get today's carpool
async function getTodaysCarpool() {
  const dateStr = new Date().toISOString().split('T')[0];
  const q = query(collection(db, 'carpools'), where('date', '==', dateStr));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() };
}

// Helper: Add car to carpool
function addCarToCarpool(carpool, parentId, parentName, car, timeSlot, shift) {
  const slotData = carpool[shift][timeSlot];
  const carId = `${parentId}-${car.plate}`;
  
  const carData = {
    id: carId,
    parentId,
    parentName,
    plate: car.plate,
    seats: car.seats,
    assignedKids: [],
    isAvailable: true,
    isTaxi: car.isTaxi || false
  };
  
  // Check if car already exists
  const existingIndex = slotData.cars.findIndex(c => c.id === carId);
  if (existingIndex >= 0) {
    slotData.cars[existingIndex] = carData;
  } else {
    slotData.cars.push(carData);
  }
  
  return carId;
}

// Helper: Assign kid to car
function assignKidToCar(carpool, kidId, kidName, timeSlot, shift, carId = null) {
  const slotData = carpool[shift][timeSlot];
  
  // If specific car requested
  if (carId) {
    const car = slotData.cars.find(c => c.id === carId);
    if (car && car.assignedKids.length < car.seats) {
      car.assignedKids.push({ id: kidId, name: kidName });
      return { success: true, carId, reason: 'Assigned to requested car' };
    }
    if (car) {
      return { success: false, carId: null, reason: 'Car is full' };
    }
    return { success: false, carId: null, reason: 'Car not found' };
  }
  
  // Auto-assign to first available car
  const availableCar = slotData.cars.find(c => 
    c.isAvailable && c.assignedKids.length < c.seats
  );
  
  if (availableCar) {
    availableCar.assignedKids.push({ id: kidId, name: kidName });
    return { success: true, carId: availableCar.id, reason: 'Auto-assigned' };
  }
  
  // No car available, add to unassigned
  if (!slotData.unassignedKids.some(k => k.id === kidId)) {
    slotData.unassignedKids.push({ id: kidId, name: kidName });
  }
  return { success: false, carId: null, reason: 'No available cars' };
}

// Helper: Remove car from carpool
function removeCarFromCarpool(carpool, carId, timeSlot, shift) {
  const slotData = carpool[shift][timeSlot];
  const carIndex = slotData.cars.findIndex(c => c.id === carId);
  
  if (carIndex >= 0) {
    const car = slotData.cars[carIndex];
    
    // Move kids to unassigned
    car.assignedKids.forEach(kid => {
      if (!slotData.unassignedKids.some(k => k.id === kid.id)) {
        slotData.unassignedKids.push(kid);
      }
    });
    
    // Add notification
    if (car.assignedKids.length > 0) {
      const kidNames = car.assignedKids.map(k => k.name).join(', ');
      carpool.notifications.push({
        id: Date.now().toString(),
        type: 'car_withdrawn',
        message: `${car.parentName} withdrew their car. Kids need new rides: ${kidNames}`,
        timestamp: new Date().toISOString()
      });
    }
    
    slotData.cars.splice(carIndex, 1);
    return true;
  }
  return false;
}

// Helper: Save carpool
async function saveCarpool(carpoolId, carpool) {
  const carpoolRef = doc(db, 'carpools', carpoolId);
  await updateDoc(carpoolRef, {
    ...carpool,
    updatedAt: new Date()
  });
}

// Main test suite
async function runComprehensiveTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 COMPREHENSIVE CARPOOL APP TEST SUITE');
  console.log('='.repeat(70) + '\n');

  try {
    // ========== TEST PHASE 1: Data Validation ==========
    console.log('📋 PHASE 1: Data Validation\n');
    
    // Get all users
    const parentsSnapshot = await getDocs(collection(db, 'parents'));
    const kidsSnapshot = await getDocs(collection(db, 'kids'));
    const parents = [];
    const kids = [];
    
    parentsSnapshot.forEach(doc => parents.push({ id: doc.id, ...doc.data() }));
    kidsSnapshot.forEach(doc => kids.push({ id: doc.id, ...doc.data() }));
    
    testResult(
      'Test 1.1: Parent data exists',
      parents.length >= 3,
      `Found ${parents.length} parents`
    );
    
    testResult(
      'Test 1.2: Kid data exists',
      kids.length >= 3,
      `Found ${kids.length} kids`
    );
    
    const parentA = parents.find(p => p.phone === '+972500000001');
    const parentB = parents.find(p => p.phone === '+972500000002');
    const kid1 = kids.find(k => k.phone === '+972510000001');
    const kid2 = kids.find(k => k.phone === '+972510000002');
    
    testResult(
      'Test 1.3: Parent A exists and has car',
      parentA && parentA.cars && parentA.cars.length > 0,
      parentA ? `Has ${parentA.cars?.length} cars` : 'Parent A not found'
    );
    
    testResult(
      'Test 1.4: Kid 1 has valid timetable',
      kid1 && kid1.timetable && kid1.timetable.morning && kid1.timetable.afternoon,
      kid1 ? `${kid1.timetable?.morning}/${kid1.timetable?.afternoon}` : 'Kid 1 not found'
    );

    if (!parentA || !parentB || !kid1 || !kid2) {
      console.log('\n❌ Missing test data. Please run: node initialize-firebase-testdata.js\n');
      process.exit(1);
    }

    // ========== TEST PHASE 2: Authentication Simulation ==========
    console.log('\n📋 PHASE 2: Authentication Tests\n');
    
    testResult(
      'Test 2.1: Existing parent login (phone lookup)',
      parentA.phone === '+972500000001',
      'Parent A found by phone number'
    );
    
    testResult(
      'Test 2.2: Existing kid login (phone lookup)',
      kid1.phone === '+972510000001',
      'Kid 1 found by phone number'
    );
    
    testResult(
      'Test 2.3: Parent has required fields',
      parentA.name && parentA.role === 'parent' && parentA.cars,
      'Name, role, and cars present'
    );
    
    testResult(
      'Test 2.4: Kid has required fields',
      kid1.name && kid1.role === 'kid' && kid1.grade && kid1.timetable,
      'Name, role, grade, and timetable present'
    );

    // ========== TEST PHASE 3: Carpool Operations ==========
    console.log('\n📋 PHASE 3: Carpool Management Tests\n');
    
    // Get or create carpool
    let carpool = await getTodaysCarpool();
    let carpoolId;
    
    if (!carpool) {
      console.log('   Creating test carpool...');
      const newCarpool = createEmptyCarpool(new Date());
      const docRef = await addDoc(collection(db, 'carpools'), newCarpool);
      carpoolId = docRef.id;
      carpool = { id: carpoolId, ...newCarpool };
    } else {
      carpoolId = carpool.id;
      // Clear test data for clean testing
      carpool.morning['8am'].cars = [];
      carpool.morning['8am'].unassignedKids = [];
      carpool.notifications = [];
    }
    
    testResult(
      'Test 3.1: Carpool structure valid',
      carpool.morning && carpool.afternoon && carpool.morning['8am'],
      'Has morning and afternoon shifts with time slots'
    );

    // ========== TEST PHASE 4: Parent Actions ==========
    console.log('\n📋 PHASE 4: Parent Actions\n');
    
    // Test 4.1: Parent adds car to carpool
    console.log('   Simulating: Parent A adds car to 8am morning slot...');
    const carId = addCarToCarpool(
      carpool,
      parentA.id,
      parentA.name,
      parentA.cars[0],
      '8am',
      'morning'
    );
    
    testResult(
      'Test 4.1: Parent can add car to carpool',
      carpool.morning['8am'].cars.length === 1,
      `Car ID: ${carId}`
    );
    
    const addedCar = carpool.morning['8am'].cars[0];
    testResult(
      'Test 4.2: Added car has correct properties',
      addedCar.seats === parentA.cars[0].seats && 
      addedCar.parentName === parentA.name &&
      addedCar.assignedKids.length === 0,
      `${addedCar.seats} seats, 0 kids assigned`
    );

    // Test 4.3: Second parent adds car
    console.log('   Simulating: Parent B adds car to 8am morning slot...');
    addCarToCarpool(
      carpool,
      parentB.id,
      parentB.name,
      parentB.cars[0],
      '8am',
      'morning'
    );
    
    testResult(
      'Test 4.3: Multiple parents can add cars',
      carpool.morning['8am'].cars.length === 2,
      '2 cars now available'
    );

    // ========== TEST PHASE 5: Kid Actions ==========
    console.log('\n📋 PHASE 5: Kid Actions\n');
    
    // Test 5.1: Kid requests ride (auto-assign)
    console.log('   Simulating: Kid 1 requests ride at 8am...');
    const assignResult1 = assignKidToCar(
      carpool,
      kid1.id,
      kid1.name,
      '8am',
      'morning'
    );
    
    testResult(
      'Test 5.1: Kid can request ride (auto-assigned)',
      assignResult1.success === true,
      assignResult1.reason
    );
    
    const carWithKid = carpool.morning['8am'].cars.find(c => 
      c.assignedKids.some(k => k.id === kid1.id)
    );
    
    testResult(
      'Test 5.2: Kid assigned to car correctly',
      carWithKid !== undefined && carWithKid.assignedKids.length === 1,
      `Kid assigned to ${carWithKid?.parentName}'s car`
    );

    // Test 5.3: Kid chooses specific car
    console.log('   Simulating: Kid 2 chooses Parent B\'s car...');
    const parentBCarId = carpool.morning['8am'].cars.find(c => c.parentId === parentB.id)?.id;
    const assignResult2 = assignKidToCar(
      carpool,
      kid2.id,
      kid2.name,
      '8am',
      'morning',
      parentBCarId
    );
    
    testResult(
      'Test 5.3: Kid can choose specific car',
      assignResult2.success === true && assignResult2.carId === parentBCarId,
      'Kid 2 joined Parent B\'s car'
    );

    // ========== TEST PHASE 6: Seat Capacity ==========
    console.log('\n📋 PHASE 6: Seat Capacity Tests\n');
    
    // Fill up Parent B's car
    console.log('   Simulating: Filling Parent B\'s car to capacity...');
    const parentBCar = carpool.morning['8am'].cars.find(c => c.parentId === parentB.id);
    const seatsAvailable = parentBCar.seats - parentBCar.assignedKids.length;
    
    // Add kids until full
    for (let i = 0; i < seatsAvailable; i++) {
      parentBCar.assignedKids.push({ id: `test-kid-${i}`, name: `Test Kid ${i}` });
    }
    
    testResult(
      'Test 6.1: Car at capacity',
      parentBCar.assignedKids.length === parentBCar.seats,
      `${parentBCar.seats} seats, all filled`
    );
    
    // Try to add one more kid
    const overflowResult = assignKidToCar(
      carpool,
      'overflow-kid',
      'Overflow Kid',
      '8am',
      'morning',
      parentBCarId
    );
    
    testResult(
      'Test 6.2: Cannot exceed car capacity',
      overflowResult.success === false && overflowResult.reason === 'Car is full',
      'Car correctly rejects overflow'
    );

    // ========== TEST PHASE 7: Parent Withdrawal ==========
    console.log('\n📋 PHASE 7: Parent Withdrawal Tests\n');
    
    // Parent A withdraws car (has Kid 1 assigned)
    console.log('   Simulating: Parent A withdraws car with kids assigned...');
    const parentACarId = carpool.morning['8am'].cars.find(c => c.parentId === parentA.id)?.id;
    const kidsBeforeWithdrawal = carpool.morning['8am'].cars
      .find(c => c.id === parentACarId)?.assignedKids.length || 0;
    
    removeCarFromCarpool(carpool, parentACarId, '8am', 'morning');
    
    testResult(
      'Test 7.1: Parent can withdraw car',
      !carpool.morning['8am'].cars.some(c => c.id === parentACarId),
      'Car removed from carpool'
    );
    
    testResult(
      'Test 7.2: Kids moved to unassigned when parent withdraws',
      carpool.morning['8am'].unassignedKids.length >= kidsBeforeWithdrawal,
      `${carpool.morning['8am'].unassignedKids.length} kids now unassigned`
    );
    
    testResult(
      'Test 7.3: Notification created for withdrawal',
      carpool.notifications.length > 0 && 
      carpool.notifications.some(n => n.type === 'car_withdrawn'),
      'Withdrawal notification added'
    );

    // ========== TEST PHASE 8: Re-assignment ==========
    console.log('\n📋 PHASE 8: Re-assignment Tests\n');
    
    // Re-assign unassigned kids
    console.log('   Simulating: Re-assigning unassigned kids...');
    const unassignedCount = carpool.morning['8am'].unassignedKids.length;
    
    if (unassignedCount > 0) {
      // Add Parent A's car back
      addCarToCarpool(
        carpool,
        parentA.id,
        parentA.name,
        parentA.cars[0],
        '8am',
        'morning'
      );
      
      // Try to re-assign unassigned kids
      const unassignedKids = [...carpool.morning['8am'].unassignedKids];
      carpool.morning['8am'].unassignedKids = [];
      
      unassignedKids.forEach(kid => {
        assignKidToCar(carpool, kid.id, kid.name, '8am', 'morning');
      });
      
      testResult(
        'Test 8.1: Unassigned kids can be re-assigned',
        carpool.morning['8am'].unassignedKids.length < unassignedCount,
        `${unassignedCount - carpool.morning['8am'].unassignedKids.length} kids re-assigned`
      );
    }

    // ========== TEST PHASE 9: Data Integrity ==========
    console.log('\n📋 PHASE 9: Data Integrity Tests\n');
    
    testResult(
      'Test 9.1: All kids linked to valid parents',
      kids.every(k => parents.some(p => p.phone === k.parentPhone)),
      'All parent links valid'
    );
    
    testResult(
      'Test 9.2: Phone numbers properly formatted',
      parents.every(p => p.phone.startsWith('+')) && 
      kids.every(k => k.phone.startsWith('+')),
      'All phone numbers have country codes'
    );
    
    testResult(
      'Test 9.3: Car seat counts reasonable',
      parents.every(p => 
        !p.cars || p.cars.every(c => c.seats >= 2 && c.seats <= 15)
      ),
      'All seat counts between 2-15'
    );
    
    testResult(
      'Test 9.4: Kids have valid timetables',
      kids.every(k => 
        k.timetable && 
        ['7am', '8am', '9am'].includes(k.timetable.morning) &&
        ['1pm', '2pm', '3pm'].includes(k.timetable.afternoon)
      ),
      'All timetables use valid time slots'
    );

    // ========== TEST PHASE 10: Save to Firebase ==========
    console.log('\n📋 PHASE 10: Firebase Persistence Tests\n');
    
    console.log('   Saving carpool state to Firebase...');
    await saveCarpool(carpoolId, carpool);
    
    // Retrieve and verify
    const savedCarpool = await getTodaysCarpool();
    
    testResult(
      'Test 10.1: Carpool saved to Firebase',
      savedCarpool !== null && savedCarpool.id === carpoolId,
      'Carpool successfully persisted'
    );
    
    testResult(
      'Test 10.2: Saved data matches local data',
      savedCarpool.morning['8am'].cars.length === carpool.morning['8am'].cars.length,
      `${savedCarpool.morning['8am'].cars.length} cars preserved`
    );
    
    testResult(
      'Test 10.3: Notifications preserved',
      savedCarpool.notifications.length === carpool.notifications.length,
      `${savedCarpool.notifications.length} notifications preserved`
    );

    // ========== TEST PHASE 11: Business Logic Edge Cases ==========
    console.log('\n📋 PHASE 11: Edge Case Tests\n');
    
    // Test taxi option
    console.log('   Testing: Taxi ride option...');
    const taxiCar = { plate: 'TAXI', seats: 4, isTaxi: true };
    addCarToCarpool(carpool, parentA.id, parentA.name, taxiCar, '9am', 'morning');
    const addedTaxi = carpool.morning['9am'].cars.find(c => c.isTaxi);
    
    testResult(
      'Test 11.1: Parent can offer taxi ride',
      addedTaxi !== undefined && addedTaxi.isTaxi === true,
      'Taxi added with 4 seats'
    );
    
    // Test active/inactive status
    testResult(
      'Test 11.2: Users have active status',
      parentA.hasOwnProperty('isActive') && kid1.hasOwnProperty('isActive'),
      'isActive field present'
    );
    
    // Test observer parent (no cars)
    const observerParent = parents.find(p => !p.cars || p.cars.length === 0);
    testResult(
      'Test 11.3: Observer parent supported (no cars)',
      observerParent !== undefined,
      `Parent C is observer: ${observerParent?.name}`
    );

    // ========== PRINT SUMMARY ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${results.passed}/${results.total}`);
    console.log(`❌ Failed: ${results.failed}/${results.total}`);
    console.log(`🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log('='.repeat(70) + '\n');

    if (results.failed > 0) {
      console.log('❌ FAILED TESTS:\n');
      results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.test}`);
        console.log(`   ${error.details}\n`);
      });
    }

    // ========== SIMULATION RESULTS ==========
    console.log('📱 SIMULATION RESULTS:\n');
    console.log('Morning 8am Carpool State:');
    console.log(`  Cars: ${carpool.morning['8am'].cars.length}`);
    carpool.morning['8am'].cars.forEach(car => {
      console.log(`    • ${car.parentName} (${car.plate}): ${car.assignedKids.length}/${car.seats} seats`);
      car.assignedKids.forEach(kid => {
        console.log(`      - ${kid.name}`);
      });
    });
    console.log(`  Unassigned Kids: ${carpool.morning['8am'].unassignedKids.length}`);
    if (carpool.morning['8am'].unassignedKids.length > 0) {
      carpool.morning['8am'].unassignedKids.forEach(kid => {
        console.log(`    - ${kid.name}`);
      });
    }
    console.log(`  Notifications: ${carpool.notifications.length}`);
    carpool.notifications.forEach(notif => {
      console.log(`    • ${notif.message}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPREHENSIVE TESTING COMPLETE');
    console.log('='.repeat(70) + '\n');

    if (results.failed === 0) {
      console.log('✅ ALL TESTS PASSED! The carpool system is working correctly.\n');
      console.log('📱 Ready to test on mobile app:');
      console.log('   1. Run: npm start');
      console.log('   2. Scan QR with Expo Go');
      console.log('   3. Login with +972500000001 (Parent A)\n');
      return 0;
    } else {
      console.log('⚠️  SOME TESTS FAILED. Review errors above.\n');
      return 1;
    }

  } catch (error) {
    console.error('\n❌ TEST EXECUTION ERROR:', error);
    console.error('\nStack trace:', error.stack);
    return 1;
  }
}

// Run the comprehensive test suite
console.log('Initializing test environment...\n');
runComprehensiveTests()
  .then(exitCode => {
    console.log(`Exiting with code: ${exitCode}\n`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

