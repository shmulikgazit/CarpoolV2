// Simple Firebase test
console.log('🔥 Testing simplified Firebase setup...');

try {
  // Test if we can import Firebase modules
  const { initializeApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');
  const { getAuth } = require('firebase/auth');
  
  console.log('✅ Firebase modules imported successfully');
  
  const firebaseConfig = {
    apiKey: "AIzaSyABTC6Ow-sOR5zyozhaLzTCDcFD3vYi6uw",
    authDomain: "carpoolv2-c05f3.firebaseapp.com",
    projectId: "carpoolv2-c05f3",
    storageBucket: "carpoolv2-c05f3.firebasestorage.app",
    messagingSenderId: "861636228670",
    appId: "1:861636228670:web:10c705581d43dd7ca1436f"
  };
  
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

