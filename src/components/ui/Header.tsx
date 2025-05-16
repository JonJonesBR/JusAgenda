import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@rneui/themed';

type HeaderNavigationProp = NavigationProp<Record<string, object | undefined>>;

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  transparent?: boolean;
}

const DEFAULT_HEADER_HEIGHT = 56;
const defaultSpacing = { xs: 4, sm: 8, md: 16, lg: 24 };
const defaultTypography = {
  fontSize: { sm: 12, md: 14, lg: 18, xl: 22 },
  fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
};
const defaultShadows = {
  small: Platform.OS === 'android'
      ? { elevation: 2 }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00 },
};

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBackButton = false,
  transparent = false,
}) => {
  const navigation = useNavigation<HeaderNavigationProp>();
  const { theme } = useTheme(); // Removed isDarkMode from destructuring
  const insets = useSafeAreaInsets();

  // Using local defaults as theme structure for these is unclear
  const spacing = defaultSpacing;
  const typography = defaultTypography;
  const shadows = defaultShadows;
  const surfaceColor = theme.colors.background || '#FFFFFF'; // Using background as fallback

  const handleBackPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const headerHeight = DEFAULT_HEADER_HEIGHT + insets.top;
  const paddingTop = insets.top;

  const containerStyles = [
    styles.baseContainer,
    {
      height: headerHeight,
      paddingTop: paddingTop,
      backgroundColor: transparent ? 'transparent' : surfaceColor,
      borderBottomColor: transparent ? 'transparent' : theme.colors.border,
      paddingHorizontal: spacing.md,
    },
    !transparent && shadows.small,
  ];

  const titleStyles = [
    styles.baseTitle,
    {
      color: theme.colors.text,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.medium,
    },
  ];

  const defaultBackIcon = (
    <Icon
      name={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
      type="material-community"
      color={theme.colors.primary}
      size={28}
    />
  );

  return (
    <>
      <StatusBar
        barStyle={'dark-content'} // Defaulting barStyle
        backgroundColor={transparent ? 'transparent' : surfaceColor}
        translucent={transparent || Platform.OS === 'ios'}
      />
      <View style={containerStyles}>
        <View style={styles.leftComponentContainer}>
          {showBackButton ? (
            <TouchableOpacity style={[styles.iconButton, { padding: spacing.xs }]} onPress={handleBackPress} accessibilityLabel="Voltar">
              {leftIcon || defaultBackIcon}
            </TouchableOpacity>
          ) : leftIcon ? (
            <TouchableOpacity
              style={[styles.iconButton, { padding: spacing.xs }]}
              onPress={onLeftPress}
              disabled={!onLeftPress}
              accessibilityLabel="Ação esquerda"
            >
              {leftIcon}
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>

        <View style={styles.titleContainer}>
            <Text style={titleStyles} numberOfLines={1} ellipsizeMode="tail">
            {title}
            </Text>
        </View>

        <View style={styles.rightComponentContainer}>
          {rightIcon ? (
            <TouchableOpacity
              style={[styles.iconButton, { padding: spacing.xs }]}
              onPress={onRightPress}
              disabled={!onRightPress}
              accessibilityLabel="Ação direita"
            >
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  baseTitle: {
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  iconPlaceholder: {
    height: 40,
    width: 40,
  },
  leftComponentContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 50,
  },
  rightComponentContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 50,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
});

export default Header;
