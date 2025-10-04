/**
 * Show Current Carpool View
 * 
 * Shows exactly what the app should display right now
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
} = require('firebase/firestore');

// Load Firebase config from environment variables
const firebaseConfig = require('./src/utils/firebaseConfig');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getNextCarpoolDate() {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 18) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  return now;
}

async function showCurrentCarpool() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 CURRENT CARPOOL VIEW - WHAT YOU SHOULD SEE IN THE APP');
  console.log('='.repeat(70) + '\n');

  try {
    const now = new Date();
    const nextDate = getNextCarpoolDate();
    const dateStr = nextDate.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[nextDate.getDay()];
    
    console.log(`🗓️  Header: "${dayName}'s Carpool"`);
    console.log(`   Date: ${nextDate.toDateString()}`);
    console.log(`   Current time: ${now.toLocaleTimeString()}\n`);

    // Get carpool
    const carpoolsQ = query(collection(db, 'carpools'), where('date', '==', dateStr));
    const carpoolsSnapshot = await getDocs(carpoolsQ);
    
    if (carpoolsSnapshot.empty) {
      console.log('❌ No carpool found for this date!');
      console.log(`   Looking for: ${dateStr}`);
      console.log('\n   Run: node reset-and-init-testdata.js');
      process.exit(1);
    }

    const carpool = carpoolsSnapshot.docs[0].data();
    
    console.log('=' .repeat(70));
    console.log('🌅 MORNING SHIFT');
    console.log('='.repeat(70) + '\n');

    const morningSlots = ['7am', '8am', '9am'];
    for (const slot of morningSlots) {
      const slotData = carpool.morning[slot];
      console.log(`⏰ ${slot.toUpperCase()}`);
      console.log('─'.repeat(40));
      
      if (slotData.cars.length === 0) {
        console.log('   No cars available\n');
      } else {
        slotData.cars.forEach((car, idx) => {
          const availableSeats = car.seats - car.assignedKids.length;
          console.log(`   🚗 Car ${idx + 1}: ${car.parentName} (${car.plate})`);
          console.log(`      Seats: ${car.assignedKids.length}/${car.seats} occupied (${availableSeats} available)`);
          
          if (car.assignedKids.length > 0) {
            console.log(`      Kids:`);
            car.assignedKids.forEach(kid => {
              console.log(`         • ${kid.name}`);
            });
          } else {
            console.log(`      Kids: (empty - awaiting assignments)`);
          }
          console.log();
        });
      }
      
      if (slotData.unassignedKids.length > 0) {
        console.log(`   🚨 UNASSIGNED KIDS:`);
        slotData.unassignedKids.forEach(kid => {
          console.log(`      • ${kid.name}`);
        });
        console.log();
      }
    }

    console.log('='.repeat(70));
    console.log('🌇 AFTERNOON SHIFT');
    console.log('='.repeat(70) + '\n');

    const afternoonSlots = ['1pm', '2pm', '3pm'];
    for (const slot of afternoonSlots) {
      const slotData = carpool.afternoon[slot];
      console.log(`⏰ ${slot.toUpperCase()}`);
      console.log('─'.repeat(40));
      
      if (slotData.cars.length === 0) {
        console.log('   No cars available\n');
      } else {
        slotData.cars.forEach((car, idx) => {
          const availableSeats = car.seats - car.assignedKids.length;
          console.log(`   🚗 Car ${idx + 1}: ${car.parentName} (${car.plate})`);
          console.log(`      Seats: ${car.assignedKids.length}/${car.seats} occupied (${availableSeats} available)`);
          
          if (car.assignedKids.length > 0) {
            console.log(`      Kids:`);
            car.assignedKids.forEach(kid => {
              console.log(`         • ${kid.name}`);
            });
          } else {
            console.log(`      Kids: (empty - awaiting assignments)`);
          }
          console.log();
        });
      }
      
      if (slotData.unassignedKids.length > 0) {
        console.log(`   🚨 UNASSIGNED KIDS:`);
        slotData.unassignedKids.forEach(kid => {
          console.log(`      • ${kid.name}`);
        });
        console.log();
      }
    }

    if (carpool.notifications && carpool.notifications.length > 0) {
      console.log('='.repeat(70));
      console.log('📢 NOTIFICATIONS');
      console.log('='.repeat(70) + '\n');
      carpool.notifications.slice(-5).forEach(notif => {
        console.log(`   • ${notif.message}`);
      });
      console.log();
    }

    console.log('='.repeat(70));
    console.log('💡 WHAT EACH USER TYPE SEES');
    console.log('='.repeat(70) + '\n');
    
    console.log('👨‍👩‍👧‍👦 PARENT VIEW:');
    console.log('   • Sees ALL cars and kids (full community schedule)');
    console.log('   • Can toggle between Morning/Afternoon shifts');
    console.log('   • Can tap time slots (7am/8am/9am, 1pm/2pm/3pm)');
    console.log('   • If they have a car: Button to "Offer My Car" or "Remove My Car"');
    console.log('   • If no car: Just views, no offer button\n');
    
    console.log('🎒 KID VIEW:');
    console.log('   • Sees ALL cars and kids (same as parents)');
    console.log('   • Can tap "Join Car" on any car with available seats');
    console.log('   • Can see which friends are in which cars');
    console.log('   • Cannot add/remove cars (only parents can)\n');

    console.log('🔄 TO REFRESH IN APP:');
    console.log('   1. Pull down on the Home screen (pull-to-refresh)');
    console.log('   2. Or tap Settings tab, then tap Home tab again');
    console.log('   3. Or close and restart the app\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

showCurrentCarpool();

