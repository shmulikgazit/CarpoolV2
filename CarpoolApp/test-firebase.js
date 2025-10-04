// Firebase connection test script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Load Firebase config from environment variables
// Note: This file uses ES6 imports, so you'll need to convert it to CommonJS
// or use a different approach to load .env
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "YOUR_NEW_API_KEY_HERE",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "carpoolv2-c05f3.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "carpoolv2-c05f3",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "carpoolv2-c05f3.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "861636228670",
    appId: process.env.FIREBASE_APP_ID || "YOUR_NEW_APP_ID_HERE",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-LYEVEL0QDK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
    try {
        console.log('🔥 Testing Firebase connection...');
        
        // Test 1: Write test data
        console.log('📝 Testing write operation...');
        const testDoc = await addDoc(collection(db, 'test'), {
            message: 'Firebase connection test',
            timestamp: new Date(),
            status: 'success'
        });
        console.log('✅ Write test passed. Document ID:', testDoc.id);
        
        // Test 2: Read test data
        console.log('📖 Testing read operation...');
        const querySnapshot = await getDocs(collection(db, 'test'));
        console.log('✅ Read test passed. Found', querySnapshot.size, 'documents');
        
        querySnapshot.forEach((doc) => {
            console.log('📄 Document:', doc.id, '=>', doc.data());
        });
        
        console.log('🎉 All Firebase tests passed!');
        
        // Test 3: Create test parent
        console.log('👨‍👩‍👧‍👦 Testing parent creation...');
        const parentDoc = await addDoc(collection(db, 'parents'), {
            name: 'Test Parent',
            phone: '+97250000999',
            cars: [{
                plate: 'TEST-123',
                seats: 4,
                isDefault: true
            }],
            availability: {
                Monday: { morning: true, afternoon: false },
                Tuesday: { morning: true, afternoon: true }
            },
            role: 'parent',
            isActive: true,
            createdAt: new Date()
        });
        console.log('✅ Parent creation test passed. Parent ID:', parentDoc.id);
        
        // Test 4: Create test kid
        console.log('🎒 Testing kid creation...');
        const kidDoc = await addDoc(collection(db, 'kids'), {
            name: 'Test Kid',
            phone: '+97251000999',
            grade: 4,
            school: 'Test School',
            parentPhone: '+97250000999',
            timetable: {
                morning: '8am',
                afternoon: '2pm'
            },
            role: 'kid',
            isActive: true,
            createdAt: new Date()
        });
        console.log('✅ Kid creation test passed. Kid ID:', kidDoc.id);
        
        console.log('🚗 Firebase is ready for the carpool app!');
        
    } catch (error) {
        console.error('❌ Firebase test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Run the test
testFirebaseConnection();

