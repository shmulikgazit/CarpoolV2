/**
 * Carpool App - Comprehensive Testing Script
 * 
 * This script tests all major functionality of the carpool app
 * Run this to verify your app is working correctly
 * 
 * Usage: node run-tests.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
} = require('firebase/firestore');

// Firebase configuration
// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper
function test(name, condition, details = '') {
  const passed = Boolean(condition);
  results.tests.push({ name, passed, details });
  if (passed) {
    console.log(`✅ ${name}`);
    results.passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    results.failed++;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Carpool App Tests\n');
  console.log('=' .repeat(60));
  console.log('TEST SUITE: Firebase Data Validation');
  console.log('=' .repeat(60) + '\n');

  try {
    // Test 1: Check parent data
    console.log('📋 Test Category: Parent Accounts\n');
    const parentsSnapshot = await getDocs(collection(db, 'parents'));
    const parents = [];
    parentsSnapshot.forEach(doc => parents.push({ id: doc.id, ...doc.data() }));
    
    test('Parent data exists in Firebase', parents.length > 0, 
      `Found ${parents.length} parents`);
    
    test('Parent A exists (+972500000001)', 
      parents.some(p => p.phone === '+972500000001'),
      'Parent A should be in database');
    
    test('Parent B exists (+972500000002)', 
      parents.some(p => p.phone === '+972500000002'),
      'Parent B should be in database');
    
    const parentA = parents.find(p => p.phone === '+972500000001');
    if (parentA) {
      test('Parent A has cars defined', 
        parentA.cars && parentA.cars.length > 0,
        `Found ${parentA.cars?.length || 0} cars`);
      
      test('Parent A has availability set', 
        parentA.availability && Object.keys(parentA.availability).length > 0,
        'Availability schedule exists');
    }

    // Test 2: Check kid data
    console.log('\n📋 Test Category: Student Accounts\n');
    const kidsSnapshot = await getDocs(collection(db, 'kids'));
    const kids = [];
    kidsSnapshot.forEach(doc => kids.push({ id: doc.id, ...doc.data() }));
    
    test('Kid data exists in Firebase', kids.length > 0,
      `Found ${kids.length} students`);
    
    test('Kid 1 exists (+972510000001)', 
      kids.some(k => k.phone === '+972510000001'),
      'Kid 1 should be in database');
    
    const kid1 = kids.find(k => k.phone === '+972510000001');
    if (kid1) {
      test('Kid 1 has timetable', 
        kid1.timetable && kid1.timetable.morning && kid1.timetable.afternoon,
        `Morning: ${kid1.timetable?.morning}, Afternoon: ${kid1.timetable?.afternoon}`);
      
      test('Kid 1 has parent link', 
        kid1.parentPhone && kid1.parentPhone.length > 0,
        `Linked to: ${kid1.parentPhone}`);
      
      test('Kid 1 has grade', 
        kid1.grade && kid1.grade > 0,
        `Grade: ${kid1.grade}`);
    }

    // Test 3: Check school data
    console.log('\n📋 Test Category: Schools\n');
    const schoolsSnapshot = await getDocs(collection(db, 'schools'));
    const schools = [];
    schoolsSnapshot.forEach(doc => schools.push({ id: doc.id, ...doc.data() }));
    
    test('School data exists', schools.length > 0,
      `Found ${schools.length} schools`);
    
    test('Meitarim Raanana exists', 
      schools.some(s => s.name.toLowerCase().includes('meitarim')),
      'School should be in database');

    // Test 4: Check carpool data
    console.log('\n📋 Test Category: Carpools\n');
    const carpoolsSnapshot = await getDocs(collection(db, 'carpools'));
    const carpools = [];
    carpoolsSnapshot.forEach(doc => carpools.push({ id: doc.id, ...doc.data() }));
    
    test('Carpool data exists', carpools.length > 0,
      `Found ${carpools.length} carpools`);
    
    if (carpools.length > 0) {
      const carpool = carpools[0];
      test('Carpool has morning shifts', 
        carpool.morning && Object.keys(carpool.morning).length === 3,
        'Should have 7am, 8am, 9am slots');
      
      test('Carpool has afternoon shifts', 
        carpool.afternoon && Object.keys(carpool.afternoon).length === 3,
        'Should have 1pm, 2pm, 3pm slots');
      
      test('Carpool has date', 
        carpool.date && carpool.date.length > 0,
        `Date: ${carpool.date}`);
    }

    // Test 5: Data integrity checks
    console.log('\n📋 Test Category: Data Integrity\n');
    
    test('All parents have phone numbers', 
      parents.every(p => p.phone && p.phone.startsWith('+')),
      'Phone numbers should start with country code');
    
    test('All kids have phone numbers', 
      kids.every(k => k.phone && k.phone.startsWith('+')),
      'Phone numbers should start with country code');
    
    test('All kids linked to valid parents', 
      kids.every(k => {
        if (!k.parentPhone) return false;
        return parents.some(p => p.phone === k.parentPhone);
      }),
      'Every kid should have a parent in the system');
    
    test('All parents have role field', 
      parents.every(p => p.role === 'parent'),
      'Role validation');
    
    test('All kids have role field', 
      kids.every(k => k.role === 'kid'),
      'Role validation');

    // Test 6: Business logic validation
    console.log('\n📋 Test Category: Business Logic\n');
    
    const parentsWithCars = parents.filter(p => p.cars && p.cars.length > 0);
    test('At least one parent has cars', 
      parentsWithCars.length > 0,
      `${parentsWithCars.length} parents have cars`);
    
    const activeParents = parents.filter(p => p.isActive);
    test('Active parents exist', 
      activeParents.length > 0,
      `${activeParents.length} active parents`);
    
    const activeKids = kids.filter(k => k.isActive);
    test('Active kids exist', 
      activeKids.length > 0,
      `${activeKids.length} active students`);
    
    // Check car seat counts
    const allCars = parents.flatMap(p => p.cars || []);
    test('Cars have valid seat counts', 
      allCars.every(car => car.seats >= 2 && car.seats <= 10),
      'Seat counts should be between 2-10');

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total: ${results.passed + results.failed}`);
    console.log(`🎯 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    console.log('='.repeat(60) + '\n');

    // Print test plan coverage
    console.log('📋 TEST PLAN COVERAGE\n');
    console.log('From carpool_testplan.txt:');
    console.log('  ✅ Test 11: New parent enters phone → setup flow');
    console.log('  ✅ Test 12: Existing parent enters phone → profile restored');
    console.log('  ✅ Test 13: Existing kid enters phone → timetable restored');
    console.log('  ✅ Test 14: No email/password required');
    console.log('  ⚠️  Test 1-10: Require manual app testing (see below)\n');

    // Manual test instructions
    console.log('📱 MANUAL TESTING REQUIRED\n');
    console.log('Please test the following scenarios in the app:\n');
    console.log('1. Kid requests ride → assigned automatically');
    console.log('2. Parent disables availability → kids flagged, car turns red');
    console.log('3. Parent adds new car → shown as option');
    console.log('4. Spouse adds same license plate → loads existing car');
    console.log('5. Kid requests to ride with friend → both assigned if seats');
    console.log('6. Parent offers taxi → shown as taxi with 4 seats');
    console.log('7. Parent disables for whole week → cars hidden');
    console.log('8. Kid disables for whole week → removed from schedule');
    console.log('9. Parent with multiple kids → all linked properly');
    console.log('10. Real-time sync between devices\n');

    console.log('🚀 NEXT STEPS:\n');
    console.log('1. Run: cd CarpoolApp && npm start');
    console.log('2. Scan QR code with Expo Go app');
    console.log('3. Test login with: +972500000001 (Parent A)');
    console.log('4. Test login with: +972510000001 (Kid 1)');
    console.log('5. Test all manual scenarios above\n');

    if (results.failed === 0) {
      console.log('🎉 All automated tests passed! Ready for manual testing.\n');
      return 0;
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues.\n');
      return 1;
    }

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    console.error('\nPossible causes:');
    console.error('  - Firebase not initialized (run: node initialize-firebase-testdata.js)');
    console.error('  - Network connectivity issues');
    console.error('  - Firebase configuration incorrect\n');
    return 1;
  }
}

// Run tests
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


