import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUser(userInfo);
      await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
      return userInfo;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your Google OAuth client ID
      offlineAccess: true
    });
    initializeAuth();
  }, [initializeAuth]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user
    }),
    [user, loading, signIn, signOut]
  );

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};