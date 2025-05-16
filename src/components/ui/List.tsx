import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  bottomDivider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  onPress,
  leftIcon,
  rightIcon,
  disabled = false,
  containerStyle,
  titleStyle,
  subtitleStyle,
  bottomDivider = true,
}) => {
  const { theme } = useTheme();
  const ds = {
    spacing: theme.spacing,
    typography: theme.typography,
  };

  const resolvedContainerStyles = [
    styles.itemContainerBase,
    {
      paddingVertical: ds.spacing.md,
      paddingHorizontal: ds.spacing.md,
      borderBottomColor: theme.colors.border, // Replaced divider
    },
    bottomDivider && styles.itemContainerBottomDivider,
    disabled && styles.disabledItem,
    containerStyle,
  ];

  const resolvedTitleStyles = [
    styles.itemTitleBase,
    {
      color: disabled ? theme.colors.textSecondary : theme.colors.text, // Replaced disabledText and grey3
      fontSize: ds.typography.fontSize.md,
      fontFamily: ds.typography.fontFamily.medium,
      marginBottom: subtitle ? ds.spacing.xs : 0,
    },
    titleStyle,
  ];

  const resolvedSubtitleStyles = [
    styles.itemSubtitleBase,
    {
      color: disabled ? theme.colors.textSecondary : theme.colors.textSecondary, // Replaced disabledText, grey3, grey1
      fontSize: ds.typography.fontSize.sm,
    },
    subtitleStyle,
  ];

  const WrapperComponent = onPress && !disabled ? TouchableOpacity : View;

  return (
    <WrapperComponent
      style={resolvedContainerStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      {leftIcon && <View style={[styles.iconWrapper, { marginRight: ds.spacing.md }]}>{leftIcon}</View>}
      <View style={styles.textWrapper}>
        <Text style={resolvedTitleStyles} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {subtitle && (
          <Text style={resolvedSubtitleStyles} numberOfLines={2} ellipsizeMode="tail">
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && <View style={[styles.iconWrapper, { marginLeft: ds.spacing.md }]}>{rightIcon}</View>}
    </WrapperComponent>
  );
};

interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  title?: string;
  emptyText?: string;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<object> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<object> | React.ReactElement | null;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  numColumns?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  title,
  emptyText = "Nenhum item encontrado",
  loading = false,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  horizontal = false,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = true,
  numColumns,
  contentContainerStyle,
  style,
}: ListProps<T>) {
  const { theme } = useTheme();
  const ds = {
    spacing: theme.spacing,
    typography: theme.typography,
  };

  const resolvedTitleStyles = [
    styles.listTitleBase,
    {
      color: theme.colors.text, // Replaced textPrimary
      fontSize: ds.typography.fontSize.lg,
      fontFamily: ds.typography.fontFamily.bold,
      marginBottom: ds.spacing.sm,
      marginHorizontal: horizontal ? 0 : ds.spacing.md,
    },
  ];

  const emptyTextStyles = [
    styles.emptyTextBase,
    {
      color: theme.colors.textSecondary, // Removed grey2
      fontSize: ds.typography.fontSize.md,
    },
  ];

  const renderEmpty = () => {
    if (loading && (!data || data.length === 0)) {
      return (
        <View style={[styles.activityIndicatorContainer, { padding: ds.spacing.xl }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <View style={[styles.emptyListContainer, { padding: ds.spacing.xl }]}>
        <Text style={emptyTextStyles}>{emptyText}</Text>
      </View>
    );
  };

  const finalContentContainerStyle = [
    data.length === 0 && !loading ? styles.emptyListContent : null,
    contentContainerStyle
  ];
  if (numColumns && numColumns > 1 && data.length > 0) {
    finalContentContainerStyle.push({paddingHorizontal: ds.spacing.md / 2});
  }

  return (
    <View style={[styles.listContainerBase, style]}>
      {title && <Text style={resolvedTitleStyles}>{title}</Text>}
      <FlatList
        data={data}
        renderItem={({ item, index }) => renderItem(item, index)}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        numColumns={numColumns}
        contentContainerStyle={finalContentContainerStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledItem: {
    opacity: 0.5,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTextBase: {
    textAlign: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainerBase: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemContainerBottomDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemSubtitleBase: {
    // fontSize, color são dinâmicos
  },
  itemTitleBase: {
    // fontSize, fontFamily, color, marginBottom são dinâmicos
  },
  listContainerBase: {
    flex: 1,
  },
  listTitleBase: {
    // Estilos dinâmicos aplicados no componente
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});
