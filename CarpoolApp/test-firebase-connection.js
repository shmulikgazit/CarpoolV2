// Test Firebase connection
import { getDB, getAuthInstance } from './src/services/firebase.js';

console.log('🔥 Testing Firebase connection...');

try {
  // Test database connection
  const db = getDB();
  console.log('✅ Firestore initialized:', !!db);
  
  // Test auth connection  
  const auth = getAuthInstance();
  console.log('✅ Auth initialized:', !!auth);
  
  console.log('🎉 Firebase services are ready!');
  
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  console.error('Full error:', error);
}







