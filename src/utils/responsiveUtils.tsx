import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions, ScaledSize, StyleSheet } from 'react-native';

// Definição de breakpoints padrão (em dp)
export const BREAKPOINTS = {
  xs: 0,    // Smartphones pequenos
  sm: 375,  // Smartphones médios
  md: 580,  // Smartphones grandes/tablets pequenos
  lg: 768,  // Tablets
  xl: 992,  // Tablets grandes/dispositivos híbridos
  xxl: 1200 // Dispositivos grandes/desktop
};

// Tipos de orientação da tela
export type Orientation = 'portrait' | 'landscape';

// Tipos de tamanho de tela baseados nos breakpoints
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Interface para informações de dimensões
export interface DimensionInfo {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  orientation: Orientation;
  screenSize: ScreenSize;
  isSmallDevice: boolean;
  isTablet: boolean;
  isLargeDevice: boolean;
  insets: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

// Interface do contexto de dimensões
interface DimensionContextType {
  dimensions: DimensionInfo;
  isPortrait: boolean;
  isLandscape: boolean;
}

// Criação do contexto
const DimensionContext = createContext<DimensionContextType | undefined>(undefined);

/**
 * Determina o tamanho da tela com base nos breakpoints
 */
export function getScreenSize(width: number): ScreenSize {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS.xxl) return 'xl';
  return 'xxl';
}

/**
 * Determina se o dispositivo é um tablet com base na diagonal da tela
 */
export function isTablet(): boolean {
  const { width, height } = Dimensions.get('window');
  const screenDiagonal = Math.sqrt(width * width + height * height);
  
  // Considera tablets dispositivos com diagonal > 7 polegadas (aproximadamente 650dp)
  return screenDiagonal > 650;
}

/**
 * Provider para fornecer informações sobre as dimensões do dispositivo
 */
export const DimensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Obtém as dimensões iniciais
  const [dimensionInfo, setDimensionInfo] = useState<DimensionInfo>(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    const orientation: Orientation = height > width ? 'portrait' : 'landscape';
    const screenSize = getScreenSize(width);
    
    // Insets padrão - em um app real, você usaria react-native-safe-area-context
    const insets = { top: 0, left: 0, right: 0, bottom: 0 };
    
    return {
      width,
      height,
      scale,
      fontScale,
      orientation,
      screenSize,
      isSmallDevice: width < 375,
      isTablet: isTablet(),
      isLargeDevice: width >= 992,
      insets
    };
  });
  
  useEffect(() => {
    // Handler para mudanças de dimensão
    function handleDimensionChange({ window }: { window: ScaledSize }) {
      const { width, height, scale, fontScale } = window;
      const orientation: Orientation = height > width ? 'portrait' : 'landscape';
      const screenSize = getScreenSize(width);
      
      setDimensionInfo({
        width,
        height,
        scale,
        fontScale,
        orientation,
        screenSize,
        isSmallDevice: width < 375,
        isTablet: isTablet(),
        isLargeDevice: width >= 992,
        insets: dimensionInfo.insets // Mantém os insets anteriores
      });
    }
    
    // Adiciona listener para mudanças de dimensão
    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    
    // Limpa o listener na desmontagem
    return () => {
      subscription.remove();
    };
  }, [dimensionInfo.insets]);
  
  // Valor do contexto
  const contextValue: DimensionContextType = {
    dimensions: dimensionInfo,
    isPortrait: dimensionInfo.orientation === 'portrait',
    isLandscape: dimensionInfo.orientation === 'landscape'
  };
  
  return (
    <DimensionContext.Provider value={contextValue}>
      {children}
    </DimensionContext.Provider>
  );
};

/**
 * Hook para acessar as informações de dimensão
 */
export function useResponsiveDimensions(): DimensionContextType {
  const context = useContext(DimensionContext);
  
  if (!context) {
    throw new Error('useResponsiveDimensions deve ser usado dentro de um DimensionProvider');
  }
  
  return context;
}

/**
 * Cria estilos responsivos com base no tamanho da tela
 */
export function createResponsiveStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (dimensions: DimensionInfo) => T
): () => T {
  return () => {
    const { dimensions } = useResponsiveDimensions();
    return StyleSheet.create(styleCreator(dimensions));
  };
}

/**
 * Componente que renderiza diferentes conteúdos com base no tamanho da tela
 */
export function Responsive({
  children,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  fallback
}: {
  children?: React.ReactNode;
  xs?: React.ReactNode;
  sm?: React.ReactNode;
  md?: React.ReactNode;
  lg?: React.ReactNode;
  xl?: React.ReactNode;
  xxl?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { dimensions } = useResponsiveDimensions();
  const { screenSize } = dimensions;
  
  // Renderiza o componente apropriado para o tamanho atual da tela
  switch (screenSize) {
    case 'xs':
      return <>{xs || children || fallback}</>;
    case 'sm':
      return <>{sm || xs || children || fallback}</>;
    case 'md':
      return <>{md || sm || xs || children || fallback}</>;
    case 'lg':
      return <>{lg || md || sm || xs || children || fallback}</>;
    case 'xl':
      return <>{xl || lg || md || sm || xs || children || fallback}</>;
    case 'xxl':
      return <>{xxl || xl || lg || md || sm || xs || children || fallback}</>;
    default:
      return <>{children || fallback}</>;
  }
}

/**
 * Calcula a escala de tamanho adequada para diferentes tamanhos de tela
 */
export function responsiveSize(
  size: number,
  factor = 0.5
): number {
  const { dimensions } = useResponsiveDimensions();
  const { width, fontScale } = dimensions;
  
  // Base é iPhone 11 (414 de largura)
  const baseWidth = 414;
  
  // Calcula um fator de escala baseado na largura atual e na base
  const scale = 1 + ((width / baseWidth) - 1) * factor;
  
  // Ajusta o tamanho com base na escala e no fator de escala de fonte do sistema
  return size * scale * fontScale;
}

/**
 * Utilitário para obter margens seguras
 * Em um app real, você usaria react-native-safe-area-context
 */
export function useSafeArea() {
  const { dimensions } = useResponsiveDimensions();
  return dimensions.insets;
}

/**
 * Hook de utilidade para adaptar layouts com base na orientação
 */
export function useOrientation() {
  const { isPortrait, isLandscape } = useResponsiveDimensions();
  return { isPortrait, isLandscape };
}
