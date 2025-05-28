import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Platform, StatusBar } from 'react-native';
import { Icon } from '@rneui/themed'; // IconProps removido, pois não é usado diretamente aqui
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  leftComponent?: React.ReactNode;
  onLeftComponentPress?: () => void;
  rightComponent?: React.ReactNode;
  onRightComponentPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  titleStyle: propTitleStyle,
  containerStyle: propContainerStyle,
  leftComponent,
  onLeftComponentPress,
  rightComponent,
  onRightComponentPress,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

  const componentStyles = StyleSheet.create({
    centerContainer: { // Ordem corrigida: 'centerContainer' antes de 'container' e 'title'
      alignItems: 'center', // Ordem corrigida: 'alignItems' antes de 'flex'
      flex: 1,
      justifyContent: 'center',
    },
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      height: HEADER_HEIGHT + insets.top,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: insets.top,
      ...theme.shadows.small,
    },
    sideComponentContainer: {
      alignItems: 'center',
      height: HEADER_HEIGHT,
      justifyContent: 'center',
      minWidth: HEADER_HEIGHT,
    },
    title: { // Ordem corrigida: 'title' depois de 'centerContainer'
      color: theme.colors.onPrimary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: 'center',
    },
  });

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : (Platform.OS === 'ios' ? 'dark-content' : 'light-content')}
        backgroundColor={theme.colors.primary}
        translucent={false}
      />
      <View style={[componentStyles.container, propContainerStyle]}>
        <View style={componentStyles.sideComponentContainer}>
          {leftComponent && onLeftComponentPress ? (
            <TouchableOpacity onPress={onLeftComponentPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {leftComponent}
            </TouchableOpacity>
          ) : leftComponent ? (
            leftComponent
          ) : null}
        </View>

        <View style={componentStyles.centerContainer}>
          <Text style={[componentStyles.title, propTitleStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={componentStyles.sideComponentContainer}>
          {rightComponent && onRightComponentPress ? (
            <TouchableOpacity onPress={onRightComponentPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {rightComponent}
            </TouchableOpacity>
          ) : rightComponent ? (
            rightComponent
          ) : null}
        </View>
      </View>
    </>
  );
};

export const HeaderBackButton: React.FC<{ onPress: () => void; tintColor?: string }> = ({ onPress, tintColor }) => {
    const { theme } = useTheme();
    return (
        <Icon
            name={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
            type="material-community"
            color={tintColor || theme.colors.onPrimary}
            size={28}
            onPress={onPress}
        />
    );
};

export default Header;
