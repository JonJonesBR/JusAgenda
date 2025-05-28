import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, IconProps } from '@rneui/themed';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  leftIcon?: IconProps;
  rightIcon?: IconProps;
  rightComponent?: React.ReactNode;
  onPress?: (item: ListItem) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allows for additional, unspecified properties on list items
}

interface ListProps {
  items: ListItem[];
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  keyExtractor?: (item: ListItem, index: number) => string;
  renderItem?: ListRenderItem<ListItem>;
  // Using 'any' for props of these components is a common pattern for generic list components
  // as the List component itself doesn't know or care about the specific props these might take.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onEndReached?: (() => void) | null;
  onEndReachedThreshold?: number | null;
  refreshing?: boolean;
  onRefresh?: (() => void) | null;
}

const DefaultListEmptyComponent: React.FC = () => {
    const { theme } = useTheme();
    return (
        <View style={componentStyles.emptyContainer}>
            <Icon name="information-outline" type="material-community" size={48} color={theme.colors.textSecondary} />
            <Text style={[componentStyles.emptyText, { color: theme.colors.textSecondary }]}>
                Nenhum item para exibir.
            </Text>
        </View>
    );
};


const List: React.FC<ListProps> = ({
  items,
  style,
  itemStyle,
  titleStyle: propTitleStyle,
  subtitleStyle: propSubtitleStyle,
  keyExtractor = (item) => item.id,
  renderItem,
  ListEmptyComponent = <DefaultListEmptyComponent />,
  ...flatListProps
}) => {
  const { theme } = useTheme();

  const defaultRenderItem: ListRenderItem<ListItem> = ({ item }) => (
    <TouchableOpacity
      style={[
        componentStyles.itemContainer,
        { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        itemStyle,
      ]}
      onPress={() => item.onPress && item.onPress(item)}
      disabled={!item.onPress}
      activeOpacity={item.onPress ? 0.7 : 1}
    >
      {item.leftIcon && (
        <Icon
          containerStyle={componentStyles.iconContainer}
          name={item.leftIcon.name}
          type={item.leftIcon.type || 'material-community'}
          size={item.leftIcon.size || 24}
          color={item.leftIcon.color || theme.colors.textSecondary}
          {...item.leftIcon}
        />
      )}
      <View style={componentStyles.textContainer}>
        <Text style={[componentStyles.title, { color: theme.colors.text }, propTitleStyle]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[componentStyles.subtitle, { color: theme.colors.textSecondary }, propSubtitleStyle]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      {item.rightComponent ? item.rightComponent : item.rightIcon && (
         <Icon
            containerStyle={componentStyles.iconContainer}
            name={item.rightIcon.name}
            type={item.rightIcon.type || 'material-community'}
            size={item.rightIcon.size || 24}
            color={item.rightIcon.color || theme.colors.textSecondary}
            {...item.rightIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem || defaultRenderItem}
      keyExtractor={keyExtractor}
      style={[componentStyles.listContainer, style]}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
};

const componentStyles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  itemContainer: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default List;
