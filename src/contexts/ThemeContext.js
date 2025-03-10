import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    try {
      const newThemeMode = !isDarkMode;
      setIsDarkMode(newThemeMode);
      await AsyncStorage.setItem('themeMode', newThemeMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [isDarkMode]);

  const theme = {
    colors: isDarkMode ? {
      primary: '#BB86FC',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#2C2C2C',
      error: '#CF6679'
    } : {
      primary: '#6200EE',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
      error: '#B00020'
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};