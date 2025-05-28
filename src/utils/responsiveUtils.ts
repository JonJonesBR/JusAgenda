// src/utils/responsiveUtils.ts

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Obtém as dimensões da janela uma vez para evitar chamadas repetidas
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Largura base do design (ex: iPhone 8, SE 2nd gen)
// Ajuste este valor se o seu design de referência for diferente.
const DESIGN_BASE_WIDTH = 375;
const DESIGN_BASE_HEIGHT = 667; // Altura base do design, pode ser usada para escala vertical

// Calcula a escala baseada na largura da tela
const scaleWidth = screenWidth / DESIGN_BASE_WIDTH;
const scaleHeight = screenHeight / DESIGN_BASE_HEIGHT; // Escala baseada na altura

// Limites para a escala para evitar tamanhos muito grandes ou muito pequenos
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.2;

/**
 * Calcula um tamanho de fonte responsivo.
 * A escala é limitada para evitar fontes excessivamente grandes ou pequenas.
 * @param size - O tamanho da fonte no design base.
 * @param allowFontScaling - Se deve permitir a escala de fonte do sistema (padrão: true).
 * @returns O tamanho da fonte ajustado para a tela atual.
 */
export function getResponsiveFontSize(size: number, allowFontScaling: boolean = true): number {
  const newSize = size * scaleWidth;
  const scaledSize = Math.max(MIN_SCALE * size, Math.min(newSize, MAX_SCALE * size));

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  } else {
    // No Android, PixelRatio.getFontScale() já é aplicado pelo sistema se allowFontScalingText={true}
    // Se allowFontScaling for false aqui, estamos controlando manualmente.
    // Se allowFontScaling for true, o sistema pode escalar novamente, então é preciso cuidado.
    // Para um controle mais previsível, pode-se optar por não usar PixelRatio.getFontScale() aqui
    // e confiar apenas na escala calculada, deixando o sistema aplicar sua escala se `allowFontScalingText` for true no componente Text.
    // Por simplicidade e para evitar dupla escala, retornamos o valor escalado diretamente.
    // Se `allowFontScaling` for true (parâmetro da função), a escala do sistema ainda pode ser aplicada no componente Text.
    return Math.round(scaledSize);
  }
}

/**
 * Calcula um tamanho de espaçamento/layout responsivo.
 * @param size - O tamanho do espaçamento no design base.
 * @param dimension - 'width' ou 'height' para basear a escala (padrão: 'width').
 * @returns O tamanho do espaçamento ajustado para a tela atual.
 */
export function getResponsiveSpacing(size: number, dimension: 'width' | 'height' = 'width'): number {
  const scale = dimension === 'height' ? scaleHeight : scaleWidth;
  const newSize = size * scale;
  // Para espaçamentos, geralmente não limitamos tanto quanto fontes, mas pode ser útil
  // const scaledSize = Math.max(MIN_SCALE_SPACING * size, Math.min(newSize, MAX_SCALE_SPACING * size));
  // Por enquanto, vamos usar a escala direta para espaçamentos.
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Largura da tela do dispositivo.
 */
export const currentScreenWidth: number = screenWidth;

/**
 * Altura da tela do dispositivo.
 */
export const currentScreenHeight: number = screenHeight;

/**
 * Verifica se o dispositivo é considerado grande (ex: tablet).
 * O limiar pode precisar de ajuste.
 */
export const isLargeDevice: boolean = screenWidth >= 768; // Exemplo de limiar para tablets

/**
 * Verifica se o dispositivo é considerado de tamanho médio.
 * O limiar pode precisar de ajuste.
 */
export const isMediumDevice: boolean = screenWidth >= 414 && screenWidth < 768; // Ex: iPhone Plus/Max

/**
 * Verifica se o dispositivo é considerado pequeno.
 */
export const isSmallDevice: boolean = screenWidth < 414; // Ex: iPhone SE, iPhone 8

// Exemplo de uso:
// import { getResponsiveFontSize, getResponsiveSpacing, currentScreenWidth } from './responsiveUtils';
// const titleSize = getResponsiveFontSize(24);
// const paddingSize = getResponsiveSpacing(16);
// if (currentScreenWidth > 500) { /* fazer algo para telas maiores */ }

export default {
  getResponsiveFontSize,
  getResponsiveSpacing,
  currentScreenWidth,
  currentScreenHeight,
  isLargeDevice,
  isMediumDevice,
  isSmallDevice,
  scaleWidth, // Exportando a escala para uso direto, se necessário
  scaleHeight, // Exportando a escala para uso direto, se necessário
};
