/**
 * Initialize Comprehensive Test Data
 * 
 * Creates 17 kids, 33 parents, and full week of carpools
 * 
 * Usage: node init-comprehensive-data.js
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
const fs = require('fs');

// Firebase configuration
// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load test data
const testData = JSON.parse(fs.readFileSync('comprehensive-testdata.json', 'utf8'));

async function clearCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, docSnapshot.id));
    count++;
  }
  return count;
}

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

function getNextSunday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 0 : 7 - day; // Days until next Sunday
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + diff);
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
}

async function initialize() {
  console.log('\n' + '='.repeat(70));
  console.log('🏫 INITIALIZING COMPREHENSIVE CARPOOL TEST DATA');
  console.log('='.repeat(70) + '\n');

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

    // Create school
    console.log('📚 Creating school...\n');
    await addDoc(collection(db, 'schools'), {
      name: testData.school.name,
      grades: testData.school.grades,
      createdAt: new Date()
    });
    console.log(`   ✅ ${testData.school.name}`);

    // Create parents
    console.log(`\n👨‍👩‍👧‍👦 Creating ${testData.parents.length} parent accounts...\n`);
    const parentMap = {};
    for (const parent of testData.parents) {
      const docRef = await addDoc(collection(db, 'parents'), {
        name: parent.name,
        phone: parent.phone,
        cars: parent.cars,
        availability: parent.availability,
        school: testData.school.name,
        role: 'parent',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      parentMap[parent.phone] = docRef.id;
      console.log(`   ✅ ${parent.name.padEnd(25)} ${parent.phone}`);
    }

    // Create kids
    console.log(`\n🎒 Creating ${testData.kids.length} student accounts...\n`);
    for (const kid of testData.kids) {
      await addDoc(collection(db, 'kids'), {
        name: kid.name,
        phone: kid.phone,
        grade: kid.grade,
        school: testData.school.name,
        parentPhone: kid.parentPhone,
        timetable: kid.timetable,
        role: 'kid',
        isActive: true,
        preferredCarmates: kid.preferredCarmates || [],
        siblingPhone: kid.siblingPhone || null,
        notes: kid.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const notes = kid.notes ? ` (${kid.notes})` : '';
      console.log(`   ✅ ${kid.name.padEnd(10)} Grade ${kid.grade} - ${kid.timetable.morning}/${kid.timetable.afternoon}${notes}`);
    }

    // Create carpools for a full week
    console.log('\n🚗 Creating carpool schedules for the week...\n');
    const nextSunday = getNextSunday();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(nextSunday);
      date.setDate(nextSunday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[i];
      
      const carpool = createEmptyCarpool(date);
      await addDoc(collection(db, 'carpools'), carpool);
      console.log(`   ✅ ${dayName.padEnd(10)} ${dateStr}`);
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ COMPREHENSIVE DATA INITIALIZED SUCCESSFULLY!');
    console.log('='.repeat(70) + '\n');

    console.log('📊 Summary:');
    console.log(`   Parents: ${testData.parents.length} (16 pairs + 1 single)`);
    console.log(`   Kids: ${testData.kids.length}`);
    console.log(`   Schools: 1`);
    console.log(`   Carpools: 5 days (Sun-Thu)`);
    console.log();

    console.log('👥 Special Relationships:');
    console.log('   • Asaf & Noam - Dating (prefer same car)');
    console.log('   • Dotan & Matan - Twins (parent prefers both together)');
    console.log('   • Maor - Single parent (mom only)');
    console.log();

    console.log('📅 Carpool Distribution:');
    console.log('   7am: 2 kids (Asaf, Noam)');
    console.log('   8am: 12 kids (Tai, Maor, Roee, Dotan, Matan, Hagai, Yakir, Maskit, Gittit, Nevo, Moria, +1)');
    console.log('   9am: 4 kids (Ido, Nadav, Gaia, Shaiel)');
    console.log();

    console.log('🎯 Test Scenarios to Try:');
    console.log();
    console.log('1. Asaf + Noam Same Car:');
    console.log('   Login as Asaf → Join a 7am car');
    console.log('   Login as Noam → Should prefer the same 7am car');
    console.log();
    console.log('2. Twin Pickup:');
    console.log('   Login as Dotan & Matan\'s parent');
    console.log('   Both twins need 8am ride');
    console.log('   Parent should see both kids and want them in same car');
    console.log();
    console.log('3. Capacity Test:');
    console.log('   Sunday 8am - 12 kids need rides');
    console.log('   Available cars: varying seats (3, 4, 5, 7)');
    console.log('   System should optimize seat usage');
    console.log();
    console.log('4. Single Parent:');
    console.log('   Maor\'s mom is the only parent');
    console.log('   Check that her car appears correctly');
    console.log();
    console.log('5. Mixed Time Slots:');
    console.log('   Different kids finish at 1pm, 2pm, 3pm');
    console.log('   Parents have varied availability');
    console.log();

    console.log('📱 Quick Test Accounts:');
    console.log();
    console.log('PARENTS:');
    console.log('  +972501234501 - Asaf\'s Dad (7am driver)');
    console.log('  +972501234507 - Maor\'s Mom (single parent, 8am)');
    console.log('  +972501234510 - Twins\' Dad (8am, has 2 kids)');
    console.log();
    console.log('KIDS:');
    console.log('  +972521000001 - Asaf (7am, dating Noam)');
    console.log('  +972521000002 - Noam (7am, dating Asaf)');
    console.log('  +972521000006 - Dotan (8am, twin)');
    console.log('  +972521000007 - Matan (8am, twin)');
    console.log('  +972521000004 - Maor (8am, single parent)');
    console.log();

    console.log('🚀 Next Steps:');
    console.log('1. Run: npm start');
    console.log('2. Test with any of the accounts above');
    console.log('3. Watch cars auto-appear based on availability');
    console.log('4. Test kid assignment and car selection');
    console.log('5. Try parent withdrawal scenarios');
    console.log();

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

initialize();

