import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// import designSystem from '../../theme/designSystem'; // Removed
import Card from './Card';

// Define default design system values directly here for StyleSheet, or pass theme to styles
const defaultDS = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  typography: {
    fontSize: { xs: 12, sm: 14, md: 16, lg: 18 },
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
  },
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const Section: React.FC<SectionProps> = ({ title, children, action }) => {
  const { theme } = useTheme();

  const titleStyles = [
    styles.sectionTitle,
    {
      color: theme.colors.text, // Replaced textPrimary
    },
  ];

  const actionStyles = [
    styles.actionText,
    {
      color: theme.colors.primary,
    },
  ];

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={titleStyles}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text style={actionStyles}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* O Card agora envolve apenas os children, como no arquivo original */}
      <Card>{children}</Card>
    </View>
  );
};

const styles = StyleSheet.create({
  actionText: {
    fontFamily: defaultDS.typography.fontFamily.medium,
    fontSize: defaultDS.typography.fontSize.sm,
  },
  sectionContainer: {
    marginBottom: defaultDS.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: defaultDS.spacing.xs,
    // Adicionado paddingHorizontal aqui, como no arquivo original,
    // para garantir espaçamento correto do título e ação.
    paddingHorizontal: defaultDS.spacing.md,
  },
  sectionTitle: {
    fontFamily: defaultDS.typography.fontFamily.bold,
    fontSize: defaultDS.typography.fontSize.md,
  },
});

export default Section;
