import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';

// Define theme types
export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  onPrimary: string;
  onSuccess: string;
  onError: string;
  onWarning: string;
  onInfo: string;
};

export type DesignSystemProps = {
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; }; // Added xxl
  typography: {
    fontSize: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; }; // Added xl and xxl
    fontFamily: { regular: string; medium: string; bold: string };
  };
  radii: { sm: number; md: number; lg: number; xl: number; }; // Added xl
  components: {
    input: { height: number };
  };
  shadows: {
    medium: object; // Changed from any to object
  };
};

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
  spacing: DesignSystemProps['spacing'];
  typography: DesignSystemProps['typography'];
  radii: DesignSystemProps['radii'];
  components: DesignSystemProps['components'];
  shadows: DesignSystemProps['shadows'];
};

const defaultDesignSystem: DesignSystemProps = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }, // Added xxl
  typography: {
    fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 }, // Added xl and xxl values
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
  },
  radii: { sm: 4, md: 8, lg: 12, xl: 16 }, // Added xl
  components: {
    input: { height: 48 }
  },
  shadows: {
    medium: Platform.OS === 'android'
        ? { elevation: 6 }
        : { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },
  }
};

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    secondary: '#03DAC6',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    notification: '#f50057',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FB8C00',
    info: '#2196F3',
    onPrimary: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
    onWarning: '#000000',
    onInfo: '#FFFFFF',
  },
  ...defaultDesignSystem,
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    secondary: '#03DAC6',
    background: '#121212',
    card: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    border: '#2c2c2c',
    notification: '#f50057',
    error: '#CF6679',
    success: '#4CAF50',
    warning: '#FB8C00',
    info: '#2196F3',
    onPrimary: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
    onWarning: '#000000',
    onInfo: '#FFFFFF',
  },
  ...defaultDesignSystem,
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
