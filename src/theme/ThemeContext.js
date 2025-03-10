import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as RNEThemeProvider } from '@rneui/themed';

const ThemeContext = createContext(null);

export const lightTheme = {
  colors: {
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    disabled: '#cccccc',
    placeholder: '#757575',
    backdrop: 'rgba(0,0,0,0.5)',
    notification: '#f50057',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const darkTheme = {
  colors: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#cf6679',
    disabled: '#666666',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0,0,0,0.5)',
    notification: '#ff79b0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <RNEThemeProvider theme={theme}>{children}</RNEThemeProvider>
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