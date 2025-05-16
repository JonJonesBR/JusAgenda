import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@rneui/themed';

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
  const isTablet = false; // valor fixo

  if (!items || items.length === 0) return null;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
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
                    color={isLast ? '#6200ee' : '#999'}
                    style={styles.homeIcon}
                  />
                )}
                
                <Text
                  style={[
                    styles.itemText,
                    isLast ? styles.itemTextLast : styles.itemTextNormal,
                    isTablet ? styles.itemTextTablet : styles.itemTextMobile
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
                  // color is now part of styles.separator
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

const componentColors = {
  containerBackground: '#fff',
  containerBorder: '#e0e0e0',
  textActive: '#6200ee',
  textInactive: '#999',
  separatorIconColor: '#ccc',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: componentColors.containerBackground,
    borderBottomColor: componentColors.containerBorder,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  homeIcon: {
    marginRight: 4,
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  itemText: {
    maxWidth: 120,
  },
  itemTextLast: {
    color: componentColors.textActive,
    fontWeight: 'bold',
  },
  itemTextMobile: {
    fontSize: 14,
  },
  itemTextNormal: {
    color: componentColors.textInactive,
    fontWeight: 'normal',
  },
  itemTextTablet: {
    fontSize: 16,
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
  separator: {
    color: componentColors.separatorIconColor,
    marginHorizontal: 4,
  },
});

export default BreadcrumbTrail;
