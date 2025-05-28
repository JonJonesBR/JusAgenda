import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { darkColors, lightColors, Colors } from '@rneui/themed'; // Importando cores base do RNEUI

// Definição da paleta de cores personalizada
// Estas cores são exemplos, ajuste conforme a identidade visual do seu app
const customLightColors = {
  primary: '#6200ee',
  secondary: '#03dac6',
  background: '#ffffff',
  surface: '#ffffff', // Usado para Cards, por exemplo
  card: '#f8f9fa', // Cor de card um pouco diferente do background
  text: '#000000',
  placeholder: '#a0a0a0',
  disabled: '#c0c0c0',
  border: '#e0e0e0',
  notification: '#ff80ab',
  error: '#b00020',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
  // Cores específicas do seu app
  appPrimaryLight: '#7F39FB',
  appPrimaryDark: '#4A00A8',
  appAccent: '#FFD600',
  shadow: 'rgba(0, 0, 0, 0.1)', // Cor base para sombras
};

const customDarkColors = {
  primary: '#bb86fc',
  secondary: '#03dac6',
  background: '#121212',
  surface: '#1e1e1e', // Um pouco mais claro que o background para superfícies
  card: '#2c2c2c', // Cor de card para tema escuro
  text: '#ffffff',
  placeholder: '#757575',
  disabled: '#505050',
  border: '#3a3a3a',
  notification: '#ff80ab', // Pode ser o mesmo ou ajustado
  error: '#cf6679',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#64B5F6',
  // Cores específicas do seu app
  appPrimaryLight: '#D0BCFF', // Versão light para tema escuro
  appPrimaryDark: '#BB86FC',
  appAccent: '#FFEB3B', // Ajuste de acento para tema escuro
  shadow: 'rgba(255, 255, 255, 0.1)', // Cor base para sombras no escuro
};

// Interface para estilos de sombra
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Para Android
}

// Tipagem para o Design System
export interface DesignSystemProps {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      bold: string;
      italic?: string; // Opcional
      boldItalic?: string; // Opcional
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      display1: number;
      display2: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      loose: number;
    };
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number; // Para elementos completamente redondos
  };
  shadows: {
    xs: ShadowStyle;
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
    none: ShadowStyle; // Para remover sombra explicitamente
  };
  // Adicionar outras propriedades do design system conforme necessário (ex: zIndex)
}

// Interface para o tema completo
export interface Theme extends DesignSystemProps {
  colors: typeof customLightColors & Partial<Colors>; // Combina suas cores customizadas com as do RNEUI
  isDark: boolean;
  mode: 'light' | 'dark';
}

// Constantes do Design System (valores de exemplo)
const BASE_SPACING = 8;
const BASE_FONT_SIZE = 16;
const BASE_RADIUS = 4;
const BASE_SHADOW_COLOR_LIGHT = 'rgba(0, 0, 0, 0.1)'; // Ajustado para ser mais genérico
const BASE_SHADOW_COLOR_DARK = 'rgba(0, 0, 0, 0.6)'; // Sombra mais escura para tema escuro, ou use branco

const defaultDesignSystem: DesignSystemProps = {
  spacing: {
    xs: BASE_SPACING * 0.5, // 4
    sm: BASE_SPACING, // 8
    md: BASE_SPACING * 2, // 16
    lg: BASE_SPACING * 3, // 24
    xl: BASE_SPACING * 4, // 32
    xxl: BASE_SPACING * 6, // 48
  },
  typography: {
    fontFamily: {
      regular: 'System', // Use a fonte padrão do sistema ou sua fonte customizada
      bold: 'System', // Para bold, pode ser 'NomeFonte-Bold'
    },
    fontSize: {
      xs: BASE_FONT_SIZE * 0.75, // 12
      sm: BASE_FONT_SIZE * 0.875, // 14
      md: BASE_FONT_SIZE, // 16
      lg: BASE_FONT_SIZE * 1.125, // 18
      xl: BASE_FONT_SIZE * 1.25, // 20
      xxl: BASE_FONT_SIZE * 1.5, // 24
      display1: BASE_FONT_SIZE * 2, // 32
      display2: BASE_FONT_SIZE * 2.5, // 40
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },
  radii: {
    xs: BASE_RADIUS * 0.5, // 2
    sm: BASE_RADIUS, // 4
    md: BASE_RADIUS * 2, // 8
    lg: BASE_RADIUS * 3, // 12
    xl: BASE_RADIUS * 4, // 16
    round: 9999, // Um valor grande para arredondamento completo
  },
  shadows: {
    // Sombras ajustadas para serem mais distintas
    xs: { shadowColor: BASE_SHADOW_COLOR_LIGHT, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00, elevation: 1 },
    sm: { shadowColor: BASE_SHADOW_COLOR_LIGHT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2 },
    md: { shadowColor: BASE_SHADOW_COLOR_LIGHT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 4 },
    lg: { shadowColor: BASE_SHADOW_COLOR_LIGHT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 8 },
    none: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  },
};

// Função para criar sombras dinâmicas baseadas na cor do tema
const createDynamicShadows = (shadowBaseColor: string): DesignSystemProps['shadows'] => ({
  xs: { shadowColor: shadowBaseColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00, elevation: 1 },
  sm: { shadowColor: shadowBaseColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 3 }, // Ajuste de elevação para sm
  md: { shadowColor: shadowBaseColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 5 }, // Ajuste de elevação para md
  lg: { shadowColor: shadowBaseColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 8 },
  none: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
});


// Tema claro
export const lightTheme: Theme = {
  ...defaultDesignSystem,
  shadows: createDynamicShadows(customLightColors.shadow), // Sombras dinâmicas
  colors: {
    ...lightColors, // Cores base do RNEUI para tema claro
    ...customLightColors, // Suas cores customizadas sobrescrevem ou adicionam
  },
  isDark: false,
  mode: 'light',
};

// Tema escuro
export const darkTheme: Theme = {
  ...defaultDesignSystem,
  shadows: createDynamicShadows(customDarkColors.shadow), // Sombras dinâmicas para tema escuro
  colors: {
    ...darkColors, // Cores base do RNEUI para tema escuro
    ...customDarkColors, // Suas cores customizadas sobrescrevem ou adicionam
  },
  isDark: true,
  mode: 'dark',
};

// Contexto do Tema
interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// Fornecendo um valor padrão mais completo para o contexto
const defaultThemeContextValue: ThemeContextProps = {
  theme: lightTheme, // Inicia com o tema claro como padrão
  isDark: false,
  toggleTheme: () => {
    console.warn('toggleTheme foi chamado antes do ThemeProvider estar pronto.');
  },
};

export const ThemeContext = createContext<ThemeContextProps>(defaultThemeContextValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState<boolean>(colorScheme === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setIsDark(newColorScheme === 'dark');
      console.log('Tema do sistema alterado para:', newColorScheme);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const toggleTheme = (): void => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  const currentTheme = isDark ? darkTheme : lightTheme;

  // Adicionando logs para depuração do tema
  // console.log('ThemeProvider - Current theme mode:', currentTheme.mode);
  // console.log('ThemeProvider - Current theme colors:', currentTheme.colors);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook customizado para usar o tema
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Isso não deveria acontecer se o ThemeProvider estiver corretamente configurado na raiz do app
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
