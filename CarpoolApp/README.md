# 🚗 Carpool App

A React Native mobile app for coordinating school carpools between parents and kids, built with Expo and Firebase.

## 📱 Features

### For Parents
- ✅ **Car Management**: Add multiple cars with seat capacity
- 🗓️ **Availability Settings**: Set weekly driving schedule
- 🚕 **Taxi Option**: Offer taxi rides when needed
- 👀 **Live Carpool View**: See real-time carpool assignments
- 🔄 **Flexible Scheduling**: Enable/disable availability easily
- 📱 **Phone-based Login**: No passwords required

### For Kids/Students
- 📚 **School Schedule**: Set daily timetable (morning/afternoon)
- 🚗 **Join Carpools**: Request rides and choose preferred cars
- 👥 **Ride with Friends**: Select cars with friends
- 📱 **Simple Interface**: Kid-friendly design
- 🏫 **Grade & School**: Link to parent accounts

### Smart Features
- 🤖 **Auto Assignment**: Automatic carpool assignment algorithm
- ⚡ **Real-time Updates**: Live synchronization across devices
- 🚨 **Conflict Handling**: Notifications when parents withdraw
- 📊 **Visual Dashboard**: Graphical carpool display with car icons
- 🔄 **Dynamic Reassignment**: Automatic kid reassignment when cars become unavailable

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase Firestore
- **Authentication**: Phone number-based (no passwords)
- **Navigation**: React Navigation
- **State Management**: React Context
- **Real-time**: Firebase real-time listeners

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Firebase project (see setup guide below)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd CarpoolApp
   npm install
   ```

2. **Set up Firebase:**
   - Follow the detailed guide in `FIREBASE_SETUP.md`
   - Update `src/services/firebase.js` with your Firebase config

3. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on device:**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal/browser

## 📋 Test Data

The app includes pre-configured test data:

### Test Parents
- **Parent A**: `+97250000001` - Has car, available mornings
- **Parent B**: `+97250000002` - Has car, available Tue/Thu all day  
- **Parent C**: `+97250000003` - Observer (no car)

### Test Kids
- **Kid 1**: `+97251000001` - Grade 3, linked to Parent A
- **Kid 2**: `+97251000002` - Grade 3, linked to Parent B
- **Kid 3**: `+97251000003` - Grade 5, linked to Parent C

## 📱 How to Use

### First Time Setup
1. Enter your phone number (with country code)
2. Choose "Parent" or "Student"
3. Fill in your details and preferences
4. Start coordinating carpools!

### Daily Usage
1. **Parents**: Check the "Next Carpool" screen to see assignments
2. **Toggle availability** using the green button
3. **Kids**: Join available cars by tapping "Join Car"
4. **Everyone**: Get real-time updates and notifications

## 🏗️ Project Structure

```
CarpoolApp/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React Context providers
│   ├── screens/           # App screens
│   ├── services/          # Firebase and business logic
│   └── utils/             # Helper functions
├── FIREBASE_SETUP.md      # Firebase configuration guide
└── README.md             # This file
```

## 🔧 Configuration

### Firebase Setup
See `FIREBASE_SETUP.md` for detailed Firebase configuration steps.

### App Configuration
Key files to configure:
- `src/services/firebase.js` - Firebase configuration
- `src/utils/phoneValidation.js` - Country codes and validation
- `src/services/carpoolService.js` - Time slots and business logic

## 🧪 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator (macOS only)
npm run web        # Run in web browser
```

### Adding Features
1. Create new screens in `src/screens/`
2. Add navigation routes in `src/components/AppNavigator.js`
3. Implement business logic in `src/services/`
4. Update data models as needed

## 📦 Deployment

### Building for Production
```bash
# Build for Android
npx expo build:android

# Build for iOS (requires macOS)
npx expo build:ios
```

### Publishing Updates
```bash
# Publish over-the-air updates
npx expo publish
```

## 🤝 Contributing

This is a private carpool coordination app. Key areas for enhancement:
- SMS verification for authentication
- Push notifications
- Advanced scheduling features
- Parent-kid messaging
- Route optimization

## 📄 License

Private project for carpool coordination.

## 🆘 Support

For setup help:
1. Check `FIREBASE_SETUP.md` for Firebase issues
2. Verify all dependencies are installed with `npm install`
3. Ensure your phone number format includes country code (e.g., +972501234567)

## 🔮 Future Features

- 📱 SMS verification
- 🔔 Push notifications  
- 💬 In-app messaging
- 🗺️ Route planning
- 📊 Usage analytics
- 🌍 Multi-school support
- 📅 Advanced scheduling

