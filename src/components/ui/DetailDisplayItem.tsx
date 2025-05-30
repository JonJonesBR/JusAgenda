// src/components/ui/DetailDisplayItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export interface DetailDisplayItemProps {
  label: string;
  value?: string | number | boolean | React.ReactNode;
  onEditPress?: () => void;
  isReadOnly?: boolean;
  fullWidthValue?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
}

const DetailDisplayItem: React.FC<DetailDisplayItemProps> = ({
  label,
  value,
  onEditPress,
  isReadOnly = true,
  fullWidthValue = false,
  labelStyle,
  valueStyle,
  containerStyle,
  iconName,
  iconColor,
}) => {
  const { theme } = useTheme();

  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    // Optionally, render a placeholder like '-' or an empty View with some height
    // For now, render nothing as per requirements if value is essentially empty.
    return null;
  }

  let displayValue: React.ReactNode;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  } else {
    displayValue = value;
  }

  const defaultIconColor = iconColor || theme.colors.primary;

  return (
    <View style={[styles.container, containerStyle]}>
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={theme.typography.fontSize.lg} // Consistent icon size
          color={defaultIconColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }, labelStyle]}>
        {label}:
      </Text>
      <View style={[styles.valueContainer, fullWidthValue ? styles.valueFullWidth : styles.valueShrink]}>
        {typeof displayValue === 'string' || typeof displayValue === 'number' ? (
          <Text style={[styles.valueText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }, valueStyle]}>
            {displayValue}
          </Text>
        ) : (
          displayValue // If ReactNode, render directly
        )}
      </View>
      {onEditPress && !isReadOnly && (
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <MaterialCommunityIcons
            name="pencil-circle-outline"
            size={theme.typography.fontSize.xl} // Slightly larger for touch target
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start of the cross axis
    paddingVertical: 8, // Default vertical padding
    // borderBottomWidth: StyleSheet.hairlineWidth, // Optional: if items are in a list
    // borderBottomColor: theme.colors.border, // Use theme for border
  },
  icon: {
    marginRight: 8,
    marginTop: Platform.OS === 'ios' ? 1 : 3, // Fine-tune vertical alignment with text
  },
  label: {
    fontSize: 15, // Default label size
    marginRight: 6,
    minWidth: 100, // Minimum width for label to align values, adjust as needed
    // color, fontFamily are set dynamically using theme
  },
  valueContainer: {
    // flex behavior is set by valueFullWidth or valueShrink
    alignItems: 'flex-start', // Align content within value container to the start
  },
  valueShrink: {
    flexShrink: 1, // Allows value to shrink if space is limited, but won't grow excessively
  },
  valueFullWidth: {
    flex: 1, // Allows value to take available horizontal space
  },
  valueText: {
    fontSize: 15, // Default value text size
    textAlign: 'left',
    // color, fontFamily are set dynamically using theme
  },
  editButton: {
    marginLeft: 'auto', // Pushes the button to the far right
    paddingLeft: 10, // Padding to make touch target easier
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Try to match height of text content for alignment
    minHeight: 24, // Ensure touchable area
  },
});

export default DetailDisplayItem;
