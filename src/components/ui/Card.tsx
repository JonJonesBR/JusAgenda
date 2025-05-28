import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, Text, TouchableOpacity, TextStyle } from 'react-native'; // TextStyle imported
// Icon and IconProps were removed in previous versions as they were not directly used.
// If they are needed for a specific use case within this generic Card, they would be passed as props/children.
import { useTheme, ShadowStyle, DesignSystemProps } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevationName?: keyof DesignSystemProps['shadows'] | 'none';
  noPadding?: boolean;
  title?: string;
  titleStyle?: ViewStyle; // Style for the title's container View
  titleTextStyle?: TextStyle; // Style for the title Text component
  headerRight?: React.ReactNode;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevationName = 'medium',
  noPadding = false,
  title,
  titleStyle,
  titleTextStyle: propTitleTextStyle,
  headerRight,
  onPress,
}) => {
  const { theme } = useTheme();
  const { spacing, radii, shadows, colors, typography } = theme;

  const getElevationStyle = (): ShadowStyle => {
    const validElevationName = elevationName as keyof DesignSystemProps['shadows'];

    if (elevationName === 'none' || !shadows[validElevationName]) {
      return Platform.OS === 'android'
        ? { elevation: 0 }
        : { shadowColor: colors.transparent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 };
    }
    const selectedShadow = shadows[validElevationName];
    return {
        ...selectedShadow,
        shadowColor: selectedShadow.shadowColor || colors.defaultShadowColor,
    };
  };

  const componentSpecificStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
    },
    contentContainer: {
      // Base styles for the content area
    },
    defaultPadding: { // Corrected order: 'defaultPadding' before 'noPaddingStyle'
      padding: spacing.md,
    },
    headerContainer: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    noPaddingStyle: { // Corrected order: 'noPaddingStyle' after 'defaultPadding'
      padding: 0,
    },
    titleText: {
      color: colors.text,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
    },
  });

  const cardComputedStyle: ViewStyle[] = [
    componentSpecificStyles.container,
    getElevationStyle() as ViewStyle,
    style,
  ];

  const contentPaddingStyle = noPadding ? componentSpecificStyles.noPaddingStyle : componentSpecificStyles.defaultPadding;

  const CardContent = (
    <View style={cardComputedStyle}>
      {(title || headerRight) && (
        <View style={[componentSpecificStyles.headerContainer, titleStyle]}>
          {title && <Text style={[componentSpecificStyles.titleText, propTitleTextStyle]}>{title}</Text>}
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={[componentSpecificStyles.contentContainer, contentPaddingStyle]}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

export default Card;
