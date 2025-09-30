/**
 * Reset and Initialize Firebase Test Data
 * 
 * This script clears existing data and creates fresh test data
 * 
 * Usage: node reset-and-init-testdata.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc,
  doc,
  addDoc
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABTC6Ow-sOR5zyozhaLzTCDcFD3vYi6uw",
  authDomain: "carpoolv2-c05f3.firebaseapp.com",
  projectId: "carpoolv2-c05f3",
  storageBucket: "carpoolv2-c05f3.firebasestorage.app",
  messagingSenderId: "861636228670",
  appId: "1:861636228670:web:10c705581d43dd7ca1436f",
  measurementId: "G-LYEVEL0QDK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data
const testData = {
  parents: [
    {
      name: "Parent A",
      phone: "+972500000001",
      cars: [{ plate: "123-45-678", seats: 5, isDefault: true }],
      availability: {
        Sunday: { morning: [], afternoon: [] },
        Monday: { morning: ['8am'], afternoon: [] },
        Tuesday: { morning: ['8am'], afternoon: [] },
        Wednesday: { morning: ['8am'], afternoon: [] },
        Thursday: { morning: ['8am'], afternoon: [] }
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
        Sunday: { morning: [], afternoon: [] },
        Monday: { morning: [], afternoon: [] },
        Tuesday: { morning: ['8am', '9am'], afternoon: ['2pm'] },
        Wednesday: { morning: [], afternoon: [] },
        Thursday: { morning: ['8am'], afternoon: ['1pm', '2pm'] }
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
        Sunday: { morning: [], afternoon: [] },
        Monday: { morning: [], afternoon: [] },
        Tuesday: { morning: [], afternoon: [] },
        Wednesday: { morning: [], afternoon: [] },
        Thursday: { morning: [], afternoon: [] }
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

async function clearCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, docSnapshot.id));
    count++;
  }
  return count;
}

async function resetAndInitialize() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 RESET AND INITIALIZE FIREBASE TEST DATA');
  console.log('='.repeat(60) + '\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...\n');
    
    const parentsDeleted = await clearCollection('parents');
    console.log(`   Deleted ${parentsDeleted} parents`);
    
    const kidsDeleted = await clearCollection('kids');
    console.log(`   Deleted ${kidsDeleted} kids`);
    
    const schoolsDeleted = await clearCollection('schools');
    console.log(`   Deleted ${schoolsDeleted} schools`);
    
    const carpoolsDeleted = await clearCollection('carpools');
    console.log(`   Deleted ${carpoolsDeleted} carpools`);

    console.log('\n✅ Old data cleared\n');

    // Create schools
    console.log('📚 Creating schools...\n');
    for (const school of testData.schools) {
      await addDoc(collection(db, 'schools'), {
        ...school,
        createdAt: new Date()
      });
      console.log(`   ✅ ${school.name}`);
    }

    // Create parents
    console.log('\n👨‍👩‍👧‍👦 Creating parent accounts...\n');
    for (const parent of testData.parents) {
      await addDoc(collection(db, 'parents'), {
        ...parent,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ ${parent.name} (${parent.phone})`);
    }

    // Create kids
    console.log('\n🎒 Creating student accounts...\n');
    for (const kid of testData.kids) {
      await addDoc(collection(db, 'kids'), {
        ...kid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ ${kid.name} (${kid.phone})`);
    }

    // Create initial carpool
    console.log('\n🚗 Creating initial carpool...\n');
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
    console.log(`   ✅ Carpool for ${dateStr}`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ DATABASE RESET AND INITIALIZED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

    console.log('📱 Test Accounts Created:\n');
    console.log('PARENT ACCOUNTS:');
    console.log('  +972500000001 - Parent A (5-seat car)');
    console.log('  +972500000002 - Parent B (4-seat car)');
    console.log('  +972500000003 - Parent C (observer, no car)\n');
    console.log('STUDENT ACCOUNTS:');
    console.log('  +972510000001 - Kid 1 (Grade 3, 8am/2pm)');
    console.log('  +972510000002 - Kid 2 (Grade 3, 8am/1pm)');
    console.log('  +972510000003 - Kid 3 (Grade 5, 9am/3pm)\n');

    console.log('🎯 Next Steps:\n');
    console.log('1. Run comprehensive tests: node comprehensive-test-suite.js');
    console.log('2. Or start the app: npm start\n');

    return 0;

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack trace:', error.stack);
    return 1;
  }
}

resetAndInitialize()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

