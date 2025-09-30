import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getParentByPhone, getKidByPhone } from '../services/dataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'parent' or 'kid'
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const userTypeData = await AsyncStorage.getItem('userType');
      
      if (userData && userTypeData) {
        setUser(JSON.parse(userData));
        setUserType(userTypeData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToStorage = async (userData, type) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', type);
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const loginWithPhone = async (phone) => {
    try {
      setLoading(true);
      
      // First check if it's a parent
      let userData = await getParentByPhone(phone);
      if (userData) {
        setUser(userData);
        setUserType('parent');
        await saveUserToStorage(userData, 'parent');
        return { success: true, userType: 'parent', userData };
      }
      
      // Then check if it's a kid
      userData = await getKidByPhone(phone);
      if (userData) {
        setUser(userData);
        setUserType('kid');
        await saveUserToStorage(userData, 'kid');
        return { success: true, userType: 'kid', userData };
      }
      
      // User not found
      return { success: false, userType: null, userData: null };
      
    } catch (error) {
      console.error('Error during phone login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await saveUserToStorage(updatedUser, userType);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!user || !user.phone) return;
      
      // Reload user from Firebase
      const userData = userType === 'parent' 
        ? await getParentByPhone(user.phone)
        : await getKidByPhone(user.phone);
      
      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData, userType);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    userType,
    loading,
    loginWithPhone,
    updateUser,
    refreshUser,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

