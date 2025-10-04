/**
 * Debug Availability Check
 * Shows what day/time the app thinks it is and what availability should be checked
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

async function debug() {
  console.log('\n🔍 DEBUGGING AVAILABILITY CHECK\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get current time info
    const now = new Date();
    const nextDate = getNextCarpoolDate();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nowDayOfWeek = days[now.getDay()];
    const nextDayOfWeek = days[nextDate.getDay()];
    
    console.log('⏰ TIME INFORMATION:');
    console.log(`   Current time: ${now.toLocaleString()}`);
    console.log(`   Current hour: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    console.log(`   Current day: ${nowDayOfWeek}`);
    console.log();
    console.log('📅 CARPOOL DATE:');
    console.log(`   Next carpool date: ${nextDate.toDateString()}`);
    console.log(`   Day of week for carpool: ${nextDayOfWeek}`);
    console.log(`   (After 6pm, shows tomorrow; before 6pm, shows today)`);
    console.log();

    // Get Parent A
    const parentsQ = query(collection(db, 'parents'), where('phone', '==', '+972500000001'));
    const parentsSnapshot = await getDocs(parentsQ);
    
    if (parentsSnapshot.empty) {
      console.log('❌ Parent A not found');
      process.exit(1);
    }

    const parentA = { id: parentsSnapshot.docs[0].id, ...parentsSnapshot.docs[0].data() };
    
    console.log('👤 PARENT A DATA:');
    console.log(`   Name: ${parentA.name}`);
    console.log(`   Cars: ${parentA.cars?.length || 0}`);
    console.log(`   Has availability: ${!!parentA.availability}`);
    console.log();

    if (parentA.availability) {
      console.log('📋 AVAILABILITY FOR NEXT CARPOOL DAY (' + nextDayOfWeek + '):');
      const dayAvailability = parentA.availability[nextDayOfWeek];
      
      if (dayAvailability) {
        console.log(`   Morning slots: ${dayAvailability.morning?.length ? dayAvailability.morning.join(', ') : 'none'}`);
        console.log(`   Afternoon slots: ${dayAvailability.afternoon?.length ? dayAvailability.afternoon.join(', ') : 'none'}`);
        
        if (dayAvailability.morning?.length > 0 || dayAvailability.afternoon?.length > 0) {
          console.log();
          console.log('✅ EXPECTED BEHAVIOR:');
          console.log('   Your car SHOULD automatically appear in these time slots:');
          if (dayAvailability.morning?.length > 0) {
            dayAvailability.morning.forEach(slot => {
              console.log(`      • Morning ${slot}`);
            });
          }
          if (dayAvailability.afternoon?.length > 0) {
            dayAvailability.afternoon.forEach(slot => {
              console.log(`      • Afternoon ${slot}`);
            });
          }
        } else {
          console.log();
          console.log('ℹ️  No availability set for ' + nextDayOfWeek);
          console.log('   Your car will NOT automatically appear');
        }
      } else {
        console.log('   No availability data for this day');
      }

      console.log();
      console.log('📅 FULL WEEK AVAILABILITY:');
      days.slice(0, 5).forEach(day => {
        const avail = parentA.availability[day];
        if (avail && (avail.morning?.length > 0 || avail.afternoon?.length > 0)) {
          console.log(`   ${day}:`);
          if (avail.morning?.length > 0) {
            console.log(`      Morning: ${avail.morning.join(', ')}`);
          }
          if (avail.afternoon?.length > 0) {
            console.log(`      Afternoon: ${avail.afternoon.join(', ')}`);
          }
        }
      });
    }

    console.log();
    console.log('='.repeat(60));
    console.log('💡 TROUBLESHOOTING TIPS:');
    console.log('='.repeat(60));
    console.log();
    console.log('1. Make sure you saved your availability in Settings');
    console.log('2. Pull down to refresh the Home screen after changing settings');
    console.log('3. Check that you\'re looking at the right day:');
    console.log(`   - The app shows "${nextDayOfWeek}'s" carpool`);
    console.log(`   - Your availability for ${nextDayOfWeek} should match`);
    console.log();
    console.log('4. If availability is set but car doesn\'t show:');
    console.log('   - Close and restart the app');
    console.log('   - Check the Expo console for error messages');
    console.log('   - Look for "🚗 Auto-add cars" logs in terminal');
    console.log();

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

debug();

