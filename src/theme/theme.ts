/**
 * Centralized theme configuration for JusAgenda
 * This file defines the application's design system including colors, typography, spacing, etc.
 */

import { DefaultTheme } from "@react-navigation/native";

// Type definitions for the theme
export interface ThemeColors {
  // Cores principais
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Cores de background
  background: string;
  surface: string;
  card: string;
  
  // Cores de texto
  text: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textHint: string;
  
  // Tons de cinza
  grey1: string; // Texto secundário
  grey2: string; // Bordas escuras, divisores
  grey3: string; // Ícones e elementos desabilitados
  grey4: string; // Sombras e fundos secundários
  grey5: string; // Backgrounds de elementos desabilitados, esqueletos
  
  // Cores de status
  error: string;
  warning: string;
  success: string;
  info: string;
  
  // Utilitários
  border: string;
  divider: string;
  notification: string;
  backdrop: string;
  disabled: string;
  placeholder: string;
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
    // Cores principais
    primary: "#6200ee",
    primaryDark: "#3700b3",
    primaryLight: "#bb86fc",
    secondary: "#03dac6",
    secondaryDark: "#018786",
    secondaryLight: "#66fff9",
    
    // Cores de background
    background: "#f5f5f5",
    surface: "#ffffff",
    card: "#ffffff",
    
    // Cores de texto
    text: "#000000",
    textPrimary: "#000000",
    textSecondary: "#757575",
    textDisabled: "#9e9e9e",
    textHint: "#bdbdbd",
    
    // Tons de cinza
    grey1: "#333333",
    grey2: "#666666",
    grey3: "#9E9E9E",
    grey4: "#BDBDBD",
    grey5: "#E0E0E0",
    
    // Cores de status
    error: "#B00020",
    warning: "#FB8C00",
    success: "#43A047",
    info: "#2196F3",
    
    // Utilitários
    border: "#e0e0e0",
    divider: "#e0e0e0",
    notification: "#6200ee",
    backdrop: "rgba(0,0,0,0.5)",
    disabled: "#E0E0E0",
    placeholder: "#9E9E9E",
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
      regular: "System",
      medium: "System",
      bold: "System",
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
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
    // Cores principais
    primary: "#bb86fc",
    primaryDark: "#3700b3",
    primaryLight: "#6200ee",
    secondary: "#03dac6",
    
    // Cores de background
    background: "#121212",
    surface: "#1e1e1e",
    card: "#1e1e1e",
    
    // Cores de texto
    text: "#ffffff",
    textPrimary: "#ffffff",
    textSecondary: "#b0b0b0",
    textDisabled: "#6e6e6e",
    textHint: "#4e4e4e",
    
    // Tons de cinza
    grey1: "#f5f5f5",
    grey2: "#e0e0e0",
    grey3: "#b0b0b0",
    grey4: "#6e6e6e",
    grey5: "#4e4e4e",
    
    // Utilitários
    border: "#2c2c2c",
    divider: "#2c2c2c",
    notification: "#bb86fc",
    backdrop: "rgba(0,0,0,0.7)",
    disabled: "#4e4e4e",
    placeholder: "#6e6e6e",
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
    text: lightTheme.colors.textPrimary,
    border: lightTheme.colors.border,
  },
};

// Export default theme
export default lightTheme;
