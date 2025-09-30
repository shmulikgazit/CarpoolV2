# Firebase Setup Guide for Carpool App

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "CarpoolApp" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Add Web App to Firebase Project

1. In your Firebase project, click the web icon (`</>`)
2. Register app with nickname: "CarpoolApp"
3. **Don't** check "Firebase Hosting" for now
4. Click "Register app"
5. Copy the Firebase configuration object

## 3. Configure Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Update Firebase Configuration

Replace the configuration in `src/services/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Firestore Security Rules (For Development)

In Firestore Rules tab, use these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning**: These rules allow anyone to read/write. For production, implement proper security rules.

## 6. Test Data Setup

The app includes test data initialization. After setting up Firebase:

1. Update the Firebase config in `src/services/firebase.js`
2. Run the app
3. The test data will be created automatically when you first use the app

## 7. Production Security Rules (For Later)

For production, replace with proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Parents can read/write their own data and carpools
    match /parents/{parentId} {
      allow read, write: if resource.data.phone == request.auth.token.phone_number;
    }
    
    // Kids can read/write their own data and carpools
    match /kids/{kidId} {
      allow read, write: if resource.data.phone == request.auth.token.phone_number;
    }
    
    // Everyone can read schools and carpools
    match /schools/{schoolId} {
      allow read: if true;
    }
    
    match /carpools/{carpoolId} {
      allow read, write: if true; // Adjust based on your needs
    }
  }
}
```

## 8. Optional: Enable Authentication

For SMS verification (future enhancement):

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Phone" provider
5. Configure your app verification settings

## Troubleshooting

- **Network Error**: Check if your Firebase config is correct
- **Permission Denied**: Verify Firestore rules allow read/write
- **Module Not Found**: Make sure all Firebase packages are installed with `npm install`

## Next Steps

After Firebase is set up:
1. Run `npm start` or `npx expo start`
2. Test the app on your device using Expo Go
3. Try logging in with the test phone numbers from the test data

