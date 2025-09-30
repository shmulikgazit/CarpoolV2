// Minimal Firebase setup for Expo SDK 54
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABTC6Ow-sOR5zyozhaLzTCDcFD3vYi6uw",
  authDomain: "carpoolv2-c05f3.firebaseapp.com",
  projectId: "carpoolv2-c05f3",
  storageBucket: "carpoolv2-c05f3.firebasestorage.app",
  messagingSenderId: "861636228670",
  appId: "1:861636228670:web:10c705581d43dd7ca1436f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore only (no auth for now)
export const db = getFirestore(app);

export default app;

