// Simple Firebase test
console.log('🔥 Testing simplified Firebase setup...');

try {
  // Test if we can import Firebase modules
  const { initializeApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');
  const { getAuth } = require('firebase/auth');
  
  console.log('✅ Firebase modules imported successfully');
  
  // Load Firebase config from environment variables
  const firebaseConfig = require('./src/utils/firebaseConfig');
  
  // Test initialization
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  const db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  const auth = getAuth(app);
  console.log('✅ Auth initialized');
  
  console.log('🎉 All Firebase services ready!');
  
} catch (error) {
  console.error('❌ Firebase test failed:', error.message);
}

