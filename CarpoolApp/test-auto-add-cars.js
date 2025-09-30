/**
 * Test Auto-Add Cars Feature
 * 
 * This verifies that parents' cars are automatically added based on their availability
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

async function testAutoAddFeature() {
  console.log('\n🧪 Testing Auto-Add Cars Feature\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get Parent A
    const parentsQ = query(collection(db, 'parents'), where('phone', '==', '+972500000001'));
    const parentsSnapshot = await getDocs(parentsQ);
    
    if (parentsSnapshot.empty) {
      console.log('❌ Parent A not found. Run: node reset-and-init-testdata.js');
      process.exit(1);
    }

    const parentA = { id: parentsSnapshot.docs[0].id, ...parentsSnapshot.docs[0].data() };
    console.log('✅ Parent A found:', parentA.name);
    console.log('   Cars:', parentA.cars.length);
    
    // Check availability format
    console.log('\n📋 Parent A Availability:\n');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    
    days.forEach(day => {
      const morning = parentA.availability[day]?.morning || [];
      const afternoon = parentA.availability[day]?.afternoon || [];
      
      if (morning.length > 0 || afternoon.length > 0) {
        console.log(`   ${day}:`);
        if (morning.length > 0) {
          console.log(`      Morning: ${morning.join(', ')}`);
        }
        if (afternoon.length > 0) {
          console.log(`      Afternoon: ${afternoon.join(', ')}`);
        }
      }
    });

    // Check today's availability
    const today = new Date();
    const dayOfWeek = days[today.getDay()];
    const todayAvailability = parentA.availability[dayOfWeek];
    
    console.log(`\n📅 Today is ${dayOfWeek}`);
    console.log(`   Morning slots: ${todayAvailability?.morning?.join(', ') || 'none'}`);
    console.log(`   Afternoon slots: ${todayAvailability?.afternoon?.join(', ') || 'none'}`);

    // Get today's carpool
    const dateStr = today.toISOString().split('T')[0];
    const carpoolsQ = query(collection(db, 'carpools'), where('date', '==', dateStr));
    const carpoolsSnapshot = await getDocs(carpoolsQ);
    
    if (!carpoolsSnapshot.empty) {
      const carpool = carpoolsSnapshot.docs[0].data();
      const carId = `${parentA.id}-${parentA.cars[0].plate}`;
      
      console.log('\n🚗 Carpool Status:\n');
      
      // Check morning slots
      console.log('   Morning:');
      ['7am', '8am', '9am'].forEach(slot => {
        const slotData = carpool.morning[slot];
        const hasCar = slotData.cars.some(car => car.id === carId);
        const expectedFromAvailability = todayAvailability?.morning?.includes(slot);
        
        const status = hasCar ? '✅' : '⚪';
        const expected = expectedFromAvailability ? ' (should be added)' : '';
        console.log(`      ${status} ${slot}: ${slotData.cars.length} cars${expected}`);
        
        if (hasCar) {
          console.log(`         → Parent A's car is here!`);
        }
      });
      
      // Check afternoon slots
      console.log('   Afternoon:');
      ['1pm', '2pm', '3pm'].forEach(slot => {
        const slotData = carpool.afternoon[slot];
        const hasCar = slotData.cars.some(car => car.id === carId);
        const expectedFromAvailability = todayAvailability?.afternoon?.includes(slot);
        
        const status = hasCar ? '✅' : '⚪';
        const expected = expectedFromAvailability ? ' (should be added)' : '';
        console.log(`      ${status} ${slot}: ${slotData.cars.length} cars${expected}`);
        
        if (hasCar) {
          console.log(`         → Parent A's car is here!`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Complete!\n');
    console.log('📱 Next: Open the app, login as Parent A (+972500000001)');
    console.log('   The car should automatically appear on the days/times');
    console.log('   where availability is set in Settings.\n');

    // Show Parent B's availability too
    const parentBQ = query(collection(db, 'parents'), where('phone', '==', '+972500000002'));
    const parentBSnapshot = await getDocs(parentBQ);
    
    if (!parentBSnapshot.empty) {
      const parentB = parentBSnapshot.docs[0].data();
      console.log('📋 Parent B Availability:\n');
      days.forEach(day => {
        const morning = parentB.availability[day]?.morning || [];
        const afternoon = parentB.availability[day]?.afternoon || [];
        
        if (morning.length > 0 || afternoon.length > 0) {
          console.log(`   ${day}:`);
          if (morning.length > 0) {
            console.log(`      Morning: ${morning.join(', ')}`);
          }
          if (afternoon.length > 0) {
            console.log(`      Afternoon: ${afternoon.join(', ')}`);
          }
        }
      });
      console.log();
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testAutoAddFeature();

