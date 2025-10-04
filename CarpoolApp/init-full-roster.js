/**
 * Initialize Full Carpool Roster
 * 
 * Creates complete test data with all 17 kids pre-assigned to cars
 * Everyone sees a full schedule regardless of participation
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc,
  doc,
  addDoc,
  query,
  where
} = require('firebase/firestore');
const fs = require('fs');

// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testData = JSON.parse(fs.readFileSync('comprehensive-testdata.json', 'utf8'));

async function clearCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, docSnapshot.id));
  }
  return snapshot.size;
}

function createPrefilledCarpool(date) {
  const dateStr = date.toISOString().split('T')[0];
  
  // Create full roster as per user's Sunday example
  return {
    date: dateStr,
    morning: {
      '7am': {
        cars: [
          {
            id: "parent-asaf-dad-7am",
            parentId: "asaf-dad",
            parentName: "Asaf's Dad",
            plate: "101-11-111",
            seats: 4,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "asaf", name: "Asaf" },
              { id: "noam", name: "Noam" }
            ]
          }
        ],
        unassignedKids: []
      },
      '8am': {
        cars: [
          {
            id: "parent-tai-dad-8am",
            parentId: "tai-dad",
            parentName: "Tai's Dad",
            plate: "103-33-333",
            seats: 3,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "tai", name: "Tai" },
              { id: "maor", name: "Maor" },
              { id: "roee", name: "Roee" }
            ]
          },
          {
            id: "parent-twins-dad-8am",
            parentId: "twins-dad",
            parentName: "Dotan & Matan's Dad",
            plate: "106-66-666",
            seats: 5,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "dotan", name: "Dotan" },
              { id: "matan", name: "Matan" },
              { id: "hagai", name: "Hagai" },
              { id: "yakir", name: "Yakir" }
            ]
          },
          {
            id: "parent-maskit-dad-8am",
            parentId: "maskit-dad",
            parentName: "Maskit's Dad",
            plate: "109-99-999",
            seats: 5,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "maskit", name: "Maskit" },
              { id: "gittit", name: "Gittit" },
              { id: "nevo", name: "Nevo" },
              { id: "moria", name: "Moria" }
            ]
          }
        ],
        unassignedKids: []
      },
      '9am': {
        cars: [
          {
            id: "parent-ido-dad-9am",
            parentId: "ido-dad",
            parentName: "Ido's Dad",
            plate: "113-33-330",
            seats: 5,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "ido", name: "Ido" },
              { id: "nadav", name: "Nadav" },
              { id: "gaia", name: "Gaia" },
              { id: "shaiel", name: "Shaiel" }
            ]
          }
        ],
        unassignedKids: []
      }
    },
    afternoon: {
      '1pm': {
        cars: [
          {
            id: "parent-noam-mom-1pm",
            parentId: "noam-mom",
            parentName: "Noam's Mom",
            plate: "102-22-222",
            seats: 4,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "noam", name: "Noam" },
              { id: "yakir", name: "Yakir" }
            ]
          }
        ],
        unassignedKids: []
      },
      '2pm': {
        cars: [
          {
            id: "parent-asaf-mom-2pm",
            parentId: "asaf-mom",
            parentName: "Asaf's Mom",
            plate: "101-11-111",
            seats: 4,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "asaf", name: "Asaf" },
              { id: "tai", name: "Tai" },
              { id: "maor", name: "Maor" }
            ]
          },
          {
            id: "parent-roee-mom-2pm",
            parentId: "roee-mom",
            parentName: "Roee's Mom",
            plate: "105-55-555",
            seats: 7,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "roee", name: "Roee" },
              { id: "dotan", name: "Dotan" },
              { id: "matan", name: "Matan" },
              { id: "hagai", name: "Hagai" }
            ]
          },
          {
            id: "parent-maskit-mom-2pm",
            parentId: "maskit-mom",
            parentName: "Maskit's Mom",
            plate: "109-99-999",
            seats: 5,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "maskit", name: "Maskit" },
              { id: "gittit", name: "Gittit" },
              { id: "nevo", name: "Nevo" },
              { id: "moria", name: "Moria" },
              { id: "gaia", name: "Gaia" }
            ]
          }
        ],
        unassignedKids: []
      },
      '3pm': {
        cars: [
          {
            id: "parent-ido-dad-3pm",
            parentId: "ido-dad",
            parentName: "Ido's Dad",
            plate: "113-33-330",
            seats: 5,
            isAvailable: true,
            isTaxi: false,
            assignedKids: [
              { id: "ido", name: "Ido" },
              { id: "nadav", name: "Nadav" },
              { id: "shaiel", name: "Shaiel" }
            ]
          }
        ],
        unassignedKids: []
      }
    },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function initialize() {
  console.log('\n' + '='.repeat(70));
  console.log('🏫 INITIALIZING FULL ROSTER - ALL KIDS ASSIGNED');
  console.log('='.repeat(70) + '\n');

  try {
    // Clear old data
    console.log('🗑️  Clearing old data...\n');
    await clearCollection('parents');
    await clearCollection('kids');
    await clearCollection('schools');
    await clearCollection('carpools');
    console.log('✅ Cleared\n');

    // Create school
    await addDoc(collection(db, 'schools'), {
      name: testData.school.name,
      grades: testData.school.grades,
      createdAt: new Date()
    });

    // Create parents
    console.log(`👨‍👩‍👧‍👦 Creating ${testData.parents.length} parents...\n`);
    for (const parent of testData.parents) {
      await addDoc(collection(db, 'parents'), {
        ...parent,
        school: testData.school.name,
        role: 'parent',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create kids
    console.log(`🎒 Creating ${testData.kids.length} students...\n`);
    for (const kid of testData.kids) {
      await addDoc(collection(db, 'kids'), {
        ...kid,
        school: testData.school.name,
        role: 'kid',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create pre-filled carpool for today/tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const carpool = createPrefilledCarpool(today);
    await addDoc(collection(db, 'carpools'), carpool);
    
    console.log('🚗 Created TODAY\'S full roster:\n');
    console.log('MORNING:');
    console.log('  7am: Asaf + Noam (2 kids)');
    console.log('  8am: 12 kids in 3 cars');
    console.log('    • Tai, Maor, Roee (3-seater)');
    console.log('    • Dotan, Matan, Hagai, Yakir (5-seater)');
    console.log('    • Maskit, Gittit, Nevo, Moria (5-seater)');
    console.log('  9am: Ido, Nadav, Gaia, Shaiel (4 kids)\n');
    console.log('AFTERNOON:');
    console.log('  1pm: Noam, Yakir (2 kids)');
    console.log('  2pm: 11 kids in 3 cars');
    console.log('  3pm: Ido, Nadav, Shaiel (3 kids)\n');

    console.log('='.repeat(70));
    console.log('✨ FULL ROSTER INITIALIZED!');
    console.log('='.repeat(70) + '\n');

    console.log('📱 What You\'ll See:\n');
    console.log('MORNING VIEW:');
    console.log('  Shows ALL THREE time slots at once:');
    console.log('  ├─ 7am section with cars and kids');
    console.log('  ├─ 8am section with cars and kids');
    console.log('  └─ 9am section with cars and kids\n');
    console.log('AFTERNOON VIEW:');
    console.log('  Shows ALL THREE time slots at once:');
    console.log('  ├─ 1pm section with cars and kids');
    console.log('  ├─ 2pm section with cars and kids');
    console.log('  └─ 3pm section with cars and kids\n');
    
    console.log('👥 EVERYONE sees the same view:');
    console.log('  • Parent A (not driving) → Sees full roster');
    console.log('  • Driving parents → See full roster + their car highlighted');
    console.log('  • Kids → See full roster + can join cars');
    console.log('  • Toggle Morning/Afternoon to switch views\n');

    console.log('🧪 Test Accounts:');
    console.log('  Parent: +972500000001 (Parent A - observer)');
    console.log('  Parent: +972501234507 (Maor\'s Mom - driving 8am)');
    console.log('  Kid: +972521000001 (Asaf - in 7am car)');
    console.log('  Kid: +972521000006 (Dotan - in 8am car with twin)\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

initialize();

