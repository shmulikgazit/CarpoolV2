// Centralized Firebase configuration for Node.js scripts
// This file loads environment variables from .env file

require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Validate that environment variables are set
const requiredVars = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_APP_ID'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ ERROR: Missing required environment variables in .env file:');
  console.error('   ' + missing.join(', '));
  console.error('\n📝 Please create a .env file based on env.example.txt');
  console.error('   See SECURITY_FIX_INSTRUCTIONS.md for details');
  process.exit(1);
}

module.exports = firebaseConfig;

