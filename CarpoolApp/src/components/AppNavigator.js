import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SetupScreen from '../screens/SetupScreen';
import ParentSetupScreen from '../screens/ParentSetupScreen';
import KidSetupScreen from '../screens/KidSetupScreen';
import NextCarpoolScreen from '../screens/NextCarpoolScreen';
import ParentSettingsScreen from '../screens/ParentSettingsScreen';
import KidSettingsScreen from '../screens/KidSettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main app tabs for authenticated users
const MainTabs = () => {
  const { userType } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={NextCarpoolScreen}
        options={{ title: 'Next Carpool' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={userType === 'parent' ? ParentSettingsScreen : KidSettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Authentication stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Setup" component={SetupScreen} />
    <Stack.Screen name="ParentSetup" component={ParentSetupScreen} />
    <Stack.Screen name="KidSetup" component={KidSetupScreen} />
  </Stack.Navigator>
);

// Main app navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You could show a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
