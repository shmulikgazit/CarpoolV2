import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Lazy initialization function
let app = null;
let db = null;
let auth = null;

export const initializeFirebase = () => {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
};

export const getDB = () => {
  if (!db) {
    const firebaseApp = initializeFirebase();
    db = getFirestore(firebaseApp);
  }
  return db;
};

export const getAuthInstance = () => {
  if (!auth) {
    const firebaseApp = initializeFirebase();
    auth = getAuth(firebaseApp);
  }
  return auth;
};

// Export for backward compatibility - removed to avoid confusion

// For development, you can use Firebase emulators
// Uncomment these lines if you want to use local emulators during development
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
