// Firebase connection test script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

