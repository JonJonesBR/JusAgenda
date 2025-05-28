import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
  addSeparator?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  titleStyle: propTitleStyle,
  contentStyle,
  noPadding = false,
  addSeparator = false,
}) => {
  const { theme } = useTheme();

  const componentStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    contentWrapper: {
      // Padding applied dynamically
    },
    separator: { // Corrected order: 'separator' before 'titleText'
      backgroundColor: theme.colors.border, // Corrected order: 'backgroundColor' before 'height'
      height: 1,
      marginBottom: theme.spacing.md,
    },
    titleText: {
      color: theme.colors.text, // Corrected order: 'color' before 'fontFamily'
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: title ? (addSeparator ? theme.spacing.xs : theme.spacing.sm) : 0,
    },
  });

  return (
    <View style={[componentStyles.container, style]}>
      {title && (
        <>
          <Text style={[componentStyles.titleText, propTitleStyle]}>{title}</Text>
          {addSeparator && <View style={componentStyles.separator} />}
        </>
      )}
      <View style={[
        componentStyles.contentWrapper,
        !noPadding && { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
        contentStyle
      ]}>
        {children}
      </View>
    </View>
  );
};

export default Section;
