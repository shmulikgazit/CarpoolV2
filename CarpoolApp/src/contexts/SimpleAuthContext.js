import React, { createContext, useContext, useState } from 'react';

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
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock test data - correct Israeli phone format
  const testUsers = {
    '+972500000001': {
      id: 'P1',
      name: 'Parent A',
      phone: '+972500000001',
      cars: [{ plate: '123-45-678', seats: 5, isDefault: true }],
      role: 'parent',
      isActive: true
    },
    '+972510000001': {
      id: 'K1',
      name: 'Kid 1',
      phone: '+972510000001',
      grade: 3,
      parentPhone: '+972500000001',
      timetable: { morning: '8am', afternoon: '2pm' },
      role: 'kid',
      isActive: true
    },
    '+972520000001': {
      id: 'P2',
      name: 'Parent B',
      phone: '+972520000001',
      cars: [{ plate: '234-56-789', seats: 4, isDefault: true }],
      role: 'parent',
      isActive: true
    },
    '+972530000001': {
      id: 'K2',
      name: 'Kid 2',
      phone: '+972530000001',
      grade: 5,
      parentPhone: '+972520000001',
      timetable: { morning: '9am', afternoon: '3pm' },
      role: 'kid',
      isActive: true
    }
  };

  const loginWithPhone = async (phone) => {
    console.log('=== AUTH CONTEXT LOGIN ===');
    console.log('Received phone:', phone);
    console.log('Available test users:', Object.keys(testUsers));
    
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData = testUsers[phone];
    console.log('Found user data:', userData);
    
    if (userData) {
      console.log('Login SUCCESS - setting user:', userData.name, userData.role);
      setUser(userData);
      setUserType(userData.role);
      setLoading(false);
      return { success: true, userType: userData.role, userData };
    }
    
    console.log('Login FAILED - no user found for phone:', phone);
    setLoading(false);
    return { success: false, userType: null, userData: null };
  };

  const updateUser = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    setUser(null);
    setUserType(null);
  };

  const value = {
    user,
    userType,
    loading,
    loginWithPhone,
    updateUser,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
