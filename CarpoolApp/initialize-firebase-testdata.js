/**
 * Firebase Test Data Initialization Script
 * 
 * This script initializes your Firebase Firestore with test data
 * Run this ONCE to populate your database with sample users and carpools
 * 
 * Usage: node initialize-firebase-testdata.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc,
  getDocs,
  query,
  where 
} = require('firebase/firestore');

// Firebase configuration (from firebase.js)
// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data from carpool_testdata.json
const testData = {
  parents: [
    {
      name: "Parent A",
      phone: "+972500000001",
      cars: [{ plate: "123-45-678", seats: 5, isDefault: true }],
      availability: {
        Sunday: { morning: false, afternoon: false },
        Monday: { morning: true, afternoon: false },
        Tuesday: { morning: true, afternoon: false },
        Wednesday: { morning: true, afternoon: false },
        Thursday: { morning: true, afternoon: false }
      },
      school: "Meitarim Raanana",
      role: "parent",
      isActive: true
    },
    {
      name: "Parent B",
      phone: "+972500000002",
      cars: [{ plate: "234-56-789", seats: 4, isDefault: true }],
      availability: {
        Sunday: { morning: false, afternoon: false },
        Monday: { morning: false, afternoon: false },
        Tuesday: { morning: true, afternoon: true },
        Wednesday: { morning: false, afternoon: false },
        Thursday: { morning: true, afternoon: true }
      },
      school: "Meitarim Raanana",
      role: "parent",
      isActive: true
    },
    {
      name: "Parent C (Observer)",
      phone: "+972500000003",
      cars: [],
      availability: {
        Sunday: { morning: false, afternoon: false },
        Monday: { morning: false, afternoon: false },
        Tuesday: { morning: false, afternoon: false },
        Wednesday: { morning: false, afternoon: false },
        Thursday: { morning: false, afternoon: false }
      },
      school: "Meitarim Raanana",
      role: "parent",
      isActive: true
    }
  ],
  kids: [
    {
      name: "Kid 1",
      phone: "+972510000001",
      grade: 3,
      school: "Meitarim Raanana",
      parentPhone: "+972500000001",
      timetable: { morning: "8am", afternoon: "2pm" },
      role: "kid",
      isActive: true
    },
    {
      name: "Kid 2",
      phone: "+972510000002",
      grade: 3,
      school: "Meitarim Raanana",
      parentPhone: "+972500000002",
      timetable: { morning: "8am", afternoon: "1pm" },
      role: "kid",
      isActive: true
    },
    {
      name: "Kid 3",
      phone: "+972510000003",
      grade: 5,
      school: "Meitarim Raanana",
      parentPhone: "+972500000003",
      timetable: { morning: "9am", afternoon: "3pm" },
      role: "kid",
      isActive: true
    }
  ],
  schools: [
    {
      name: "Meitarim Raanana",
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  ]
};

// Helper function to check if data already exists
async function checkIfDataExists() {
  const parentsSnapshot = await getDocs(collection(db, 'parents'));
  return !parentsSnapshot.empty;
}

// Initialize test data
async function initializeTestData() {
  console.log('🚀 Starting Firebase test data initialization...\n');

  try {
    // Check if data already exists
    const dataExists = await checkIfDataExists();
    if (dataExists) {
      console.log('⚠️  Warning: Data already exists in Firebase!');
      console.log('   To avoid duplicates, please clear the database first.');
      console.log('   Go to Firebase Console → Firestore → Delete collections\n');
      process.exit(0);
    }

    // Create schools
    console.log('📚 Creating schools...');
    for (const school of testData.schools) {
      await addDoc(collection(db, 'schools'), {
        name: school.name,
        grades: school.grades,
        createdAt: new Date()
      });
      console.log(`   ✅ Created: ${school.name}`);
    }

    // Create parents
    console.log('\n👨‍👩‍👧‍👦 Creating parent accounts...');
    const parentIds = {};
    for (const parent of testData.parents) {
      const docRef = await addDoc(collection(db, 'parents'), {
        ...parent,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      parentIds[parent.phone] = docRef.id;
      console.log(`   ✅ ${parent.name} (${parent.phone})`);
    }

    // Create kids
    console.log('\n🎒 Creating student accounts...');
    for (const kid of testData.kids) {
      await addDoc(collection(db, 'kids'), {
        ...kid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ ${kid.name} (${kid.phone})`);
    }

    // Create initial carpool for today
    console.log('\n🚗 Creating initial carpool...');
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const carpoolData = {
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

    await addDoc(collection(db, 'carpools'), carpoolData);
    console.log(`   ✅ Created carpool for ${dateStr}`);

    console.log('\n✨ Test data initialization completed successfully!\n');
    console.log('📱 You can now test the app with these accounts:\n');
    console.log('PARENT ACCOUNTS:');
    console.log('  +972500000001 - Parent A (has car)');
    console.log('  +972500000002 - Parent B (has car)');
    console.log('  +972500000003 - Parent C (observer, no car)\n');
    console.log('STUDENT ACCOUNTS:');
    console.log('  +972510000001 - Kid 1 (Parent A\'s child)');
    console.log('  +972510000002 - Kid 2 (Parent B\'s child)');
    console.log('  +972510000003 - Kid 3 (Parent C\'s child)\n');
    console.log('🎉 Ready to test! Start the app with: npm start\n');

  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


