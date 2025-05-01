import { Theme } from "@react-navigation/native";

type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export interface CustomThemeColors {
  // Cores principais
  primary: string;
  secondary: string;
  background: string;
  card: string;
  surface: string;
  
  // Cores de texto
  text: string;
  textSecondary: string;
  textDisabled: string;
  
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
  notification: string;
  backdrop: string;
  disabled: string;
  placeholder: string;
}

export interface CustomTheme {
  dark: boolean;
  colors: CustomThemeColors;
  fonts: {
    regular: {
      fontFamily: string;
      fontWeight: FontWeight;
    };
    medium: {
      fontFamily: string;
      fontWeight: FontWeight;
    };
    bold: {
      fontFamily: string;
      fontWeight: FontWeight;
    };
    heavy: {
      fontFamily: string;
      fontWeight: FontWeight;
    };
  };
}

export const defaultTheme: CustomTheme = {
  dark: false,
  colors: {
    // Cores principais
    primary: "#6200ee",
    secondary: "#03DAC6",
    background: "#FFFFFF",
    card: "#FFFFFF",
    surface: "#FFFFFF",
    
    // Cores de texto
    text: "#000000",
    textSecondary: "#666666",
    textDisabled: "#9E9E9E",
    
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
    border: "#E0E0E0",
    notification: "#6200ee",
    backdrop: "rgba(0,0,0,0.5)",
    disabled: "#E0E0E0",
    placeholder: "#9E9E9E",
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "900",
    },
  },
}; 