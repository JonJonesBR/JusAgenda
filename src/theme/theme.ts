/**
 * Centralized theme configuration for JusAgenda
 * This file defines the application's design system including colors, typography, spacing, etc.
 */

import { DefaultTheme } from '@react-navigation/native';

// Type definitions for the theme
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  border: string;
  divider: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export interface ThemeShadows {
  small: object;
  medium: object;
  large: object;
}

export interface ThemeRadii {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface AppTheme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  radii: ThemeRadii;
}

// Default light theme
export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    primaryDark: '#3700b3',
    primaryLight: '#bb86fc',
    secondary: '#03dac6',
    secondaryDark: '#018786',
    secondaryLight: '#66fff9',
    error: '#ff0266',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#9e9e9e',
      hint: '#bdbdbd',
    },
    border: '#e0e0e0',
    divider: '#e0e0e0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  radii: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    round: 999,
  },
};

// Dark theme variant
export const darkTheme: AppTheme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    primary: '#bb86fc',
    primaryDark: '#3700b3',
    primaryLight: '#6200ee',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6e6e6e',
      hint: '#4e4e4e',
    },
    border: '#2c2c2c',
    divider: '#2c2c2c',
  },
};

// Navigation theme that extends React Navigation's DefaultTheme
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text.primary,
    border: lightTheme.colors.border,
  },
};

// Export default theme
export default lightTheme;