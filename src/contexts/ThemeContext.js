import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

// Definição das cores do tema escuro
const DarkThemeColors = {
  primary: '#BB86FC',
  primaryDark: '#9D4EDD',
  primaryLight: '#DDB5FF',
  secondary: '#03DAC6',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  text: '#FFFFFF',
  textSecondary: '#DADADA',
  textMuted: '#9E9E9E',
  border: '#333333',
  divider: '#3D3D3D',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FFAB40',
  info: '#2196F3',
  notification: '#BB86FC',
  card: '#1E1E1E',
  cardHeader: '#2C2C2C',
  cardContent: '#252525',
  icon: '#BBBBBB',
  iconActive: '#FFFFFF',
  placeholder: '#757575',
  disabled: '#5C5C5C',
  inputBackground: '#2C2C2C',
  buttonDisabled: '#444444',
  shadow: '#000000',
  skeleton: '#2A2A2A',
  skeletonHighlight: '#3A3A3A',
};

// Definição das cores do tema claro
const LightThemeColors = {
  primary: '#6200EE',
  primaryDark: '#4B01D0',
  primaryLight: '#7F39FB',
  secondary: '#03DAC6',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#EEEEEE',
  text: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',
  border: '#E0E0E0',
  divider: '#DDDDDD',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
  notification: '#6200EE',
  card: '#FFFFFF',
  cardHeader: '#F8F8F8',
  cardContent: '#FFFFFF',
  icon: '#757575',
  iconActive: '#6200EE',
  placeholder: '#9E9E9E',
  disabled: '#E0E0E0',
  inputBackground: '#F8F8F8',
  buttonDisabled: '#CCCCCC',
  shadow: '#AAAAAA',
  skeleton: '#E0E0E0',
  skeletonHighlight: '#F5F5F5',
};

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

  const toggleTheme = useCallback(async (value = null) => {
    try {
      const newThemeMode = value !== null ? value : !isDarkMode;
      setIsDarkMode(newThemeMode);
      await AsyncStorage.setItem('themeMode', newThemeMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [isDarkMode]);

  const theme = {
    dark: isDarkMode,
    colors: isDarkMode ? DarkThemeColors : LightThemeColors
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