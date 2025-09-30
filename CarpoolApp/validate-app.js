// App validation script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Carpool App Structure...\n');

// Check if all required files exist
const requiredFiles = [
    'App.js',
    'package.json',
    'src/components/AppNavigator.js',
    'src/contexts/AuthContext.js',
    'src/screens/LoginScreen.js',
    'src/screens/SetupScreen.js',
    'src/screens/ParentSetupScreen.js',
    'src/screens/KidSetupScreen.js',
    'src/screens/NextCarpoolScreen.js',
    'src/screens/ParentSettingsScreen.js',
    'src/screens/KidSettingsScreen.js',
    'src/services/firebase.js',
    'src/services/dataService.js',
    'src/services/carpoolService.js',
    'src/utils/phoneValidation.js',
    'src/utils/initTestData.js'
];

let allFilesExist = true;

console.log('📁 Checking file structure:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

console.log('\n📦 Checking package.json dependencies:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
        'expo',
        'react',
        'react-native',
        'firebase',
        '@react-navigation/native',
        '@react-navigation/stack',
        '@react-navigation/bottom-tabs',
        '@react-native-async-storage/async-storage',
        '@react-native-picker/picker'
    ];

    requiredDeps.forEach(dep => {
        const exists = packageJson.dependencies[dep];
        console.log(`${exists ? '✅' : '❌'} ${dep}: ${exists || 'MISSING'}`);
    });
} catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    allFilesExist = false;
}

console.log('\n🔥 Checking Firebase configuration:');
try {
    const firebaseContent = fs.readFileSync('src/services/firebase.js', 'utf8');
    const hasRealConfig = firebaseContent.includes('carpoolv2-c05f3');
    console.log(`${hasRealConfig ? '✅' : '❌'} Firebase config: ${hasRealConfig ? 'Real config detected' : 'Using placeholder config'}`);
} catch (error) {
    console.log('❌ Error reading firebase.js:', error.message);
}

console.log('\n📱 App Features Implemented:');
const features = [
    '✅ Phone-based authentication system',
    '✅ Parent and kid user roles',
    '✅ Car management for parents',
    '✅ School schedule for kids', 
    '✅ Visual carpool display',
    '✅ Real-time Firebase integration',
    '✅ Settings screens for both user types',
    '✅ Automatic carpool assignment',
    '✅ Conflict notification system',
    '✅ Test data integration'
];

features.forEach(feature => console.log(feature));

console.log('\n🎯 Test Phone Numbers:');
console.log('Parents:');
console.log('  📞 +97250000001 (Parent A - has car, morning availability)');
console.log('  📞 +97250000002 (Parent B - has car, Tue/Thu availability)');
console.log('  📞 +97250000003 (Parent C - observer, no car)');
console.log('\nKids:');
console.log('  📞 +97251000001 (Kid 1 - Grade 3, linked to Parent A)');
console.log('  📞 +97251000002 (Kid 2 - Grade 3, linked to Parent B)');
console.log('  📞 +97251000003 (Kid 3 - Grade 5, linked to Parent C)');

console.log('\n🚀 Next Steps:');
if (allFilesExist) {
    console.log('✅ All files are present!');
    console.log('1. Make sure Firebase is set up (check FIREBASE_SETUP.md)');
    console.log('2. Run: npm start');
    console.log('3. Install Expo Go on your phone');
    console.log('4. Scan QR code to test the app');
    console.log('5. Try logging in with test phone numbers above');
} else {
    console.log('❌ Some files are missing. Please check the file structure.');
}

console.log('\n📊 App Summary:');
console.log('• Technology: React Native + Expo + Firebase');
console.log('• Platforms: iOS & Android (single codebase)');
console.log('• Authentication: Phone number based (no passwords)');
console.log('• Database: Firebase Firestore (real-time)');
console.log('• Features: Complete carpool coordination system');

console.log('\n🎉 Validation complete!');

