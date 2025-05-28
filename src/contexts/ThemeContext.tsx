import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useColorScheme, Platform } from 'react-native';

export type ShadowStyle = {
  elevation?: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
};

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
  overlay: string;
  shadow: string; // Primary shadow color (e.g., for iOS shadowColor)
  transparent: string;
  disabledInputBackground: string;
  disabledInputText: string;
  inputBackground: string;
  defaultShadowColor: string; // Added for base shadow definitions
};

export type DesignSystemProps = {
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; };
  typography: {
    fontSize: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; };
    fontFamily: { regular: string; medium: string; bold: string; };
    fontWeight: { light: '300'; normal: '400'; medium: '500'; bold: '700'; };
  };
  radii: { sm: number; md: number; lg: number; xl: number; };
  components: {
    input: { height: number; };
  };
  shadows: {
    small: ShadowStyle;
    medium: ShadowStyle;
    large: ShadowStyle;
    none?: ShadowStyle;
  };
};

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
} & DesignSystemProps;

// Define a base shadow color to be used in defaultDesignSystem
const BASE_SHADOW_COLOR = '#000000'; // This is a common base, opacity will make it lighter

const defaultDesignSystem: DesignSystemProps = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  typography: {
    fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
    fontFamily: { regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold' },
    fontWeight: { light: '300', normal: '400', medium: '500', bold: '700' },
  },
  radii: { sm: 4, md: 8, lg: 12, xl: 16 },
  components: {
    input: { height: 48 }
  },
  shadows: { // MODIFIED: Uses BASE_SHADOW_COLOR
    small: Platform.OS === 'android'
        ? { elevation: 2 }
        : { shadowColor: BASE_SHADOW_COLOR, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00 },
    medium: Platform.OS === 'android'
        ? { elevation: 5 }
        : { shadowColor: BASE_SHADOW_COLOR, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
    large: Platform.OS === 'android'
        ? { elevation: 8 }
        : { shadowColor: BASE_SHADOW_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    none: Platform.OS === 'android' ? { elevation: 0 } : { shadowOpacity: 0 },
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
    info: '#1976D2',
    onPrimary: '#FFFFFF',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
    onWarning: '#000000',
    onInfo: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadow: BASE_SHADOW_COLOR, // Use the base shadow color
    transparent: 'transparent',
    disabledInputBackground: '#eeeeee',
    disabledInputText: '#bdbdbd',
    inputBackground: '#ffffff',
    defaultShadowColor: BASE_SHADOW_COLOR,
  },
  ...defaultDesignSystem,
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#64b5f6',
    secondary: '#03DAC6',
    background: '#121212',
    card: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    border: '#2c2c2c',
    notification: '#f50057',
    error: '#CF6679',
    success: '#81c784',
    warning: '#ffb74d',
    info: '#64b5f6',
    onPrimary: '#000000',
    onSuccess: '#000000',
    onError: '#000000',
    onWarning: '#000000',
    onInfo: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: BASE_SHADOW_COLOR, // Use the base shadow color (can be different for dark theme if needed)
    transparent: 'transparent',
    disabledInputBackground: '#2a2a2a',
    disabledInputText: '#555555',
    inputBackground: '#2c2c2c',
    defaultShadowColor: BASE_SHADOW_COLOR, // Or a lighter shadow for dark themes if preferred
  },
  ...defaultDesignSystem,
};

// ... (rest of the ThemeContext, ThemeProvider, useTheme, themes export remains the same)

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => { console.warn('ThemeProvider não encontrado'); },
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const activeTheme = isDark ? darkTheme : lightTheme;

  const toggleTheme = useCallback(() => {
    setIsDark(prevIsDark => !prevIsDark);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export default ThemeContext;
