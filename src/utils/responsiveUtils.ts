import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 768;
export const isLargeDevice = width >= 768;

export const getResponsiveFontSize = (size: number): number => {
  const scale = width / 375; // base width of 375 for iPhone
  const newSize = size * scale;
  return Math.round(newSize);
};

export const getResponsiveSpacing = (spacing: number): number => {
  const scale = width / 375;
  return Math.round(spacing * scale);
};

export const screenWidth = width;
export const screenHeight = height; 