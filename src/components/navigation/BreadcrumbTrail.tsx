import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsiveDimensions } from '../../utils/responsiveUtils';

interface BreadcrumbItem {
  id: string;
  label: string;
  onPress?: () => void;
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  accessibilityLabel?: string;
}

/**
 * Componente de trilha de navegação (breadcrumb) que permite ao usuário 
 * visualizar e navegar pelo caminho percorrido na aplicação
 */
const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  items,
  accessibilityLabel = 'Trilha de navegação',
}) => {
  const { theme } = useTheme();
  const { isTablet } = useResponsiveDimensions().dimensions;

  if (!items || items.length === 0) return null;

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.grey5 || '#e0e0e0',
        }
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="navigation"
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                onPress={isLast ? undefined : item.onPress}
                disabled={isLast || !item.onPress}
                style={styles.itemContainer}
                accessible={true}
                accessibilityLabel={`${item.label}${isLast ? ', página atual' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLast || !item.onPress }}
              >
                {index === 0 && (
                  <Icon
                    name="home"
                    type="material"
                    size={isTablet ? 18 : 16}
                    color={isLast ? theme.colors.primary : theme.colors.grey1 || '#999'}
                    style={styles.homeIcon}
                  />
                )}
                
                <Text
                  style={[
                    styles.itemText,
                    {
                      color: isLast ? theme.colors.primary : theme.colors.grey1 || '#999',
                      fontWeight: isLast ? 'bold' : 'normal',
                      fontSize: isTablet ? 16 : 14,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
              
              {!isLast && (
                <Icon
                  name="chevron-right"
                  type="material"
                  size={isTablet ? 22 : 18}
                  color={theme.colors.grey3 || '#ccc'}
                  style={styles.separator}
                />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemText: {
    maxWidth: 120,
  },
  separator: {
    marginHorizontal: 4,
  },
  homeIcon: {
    marginRight: 4,
  },
});

export default BreadcrumbTrail;
