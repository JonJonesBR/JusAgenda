import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@rneui/themed';
import { isLargeDevice, isMediumDevice } from '../utils/responsiveUtils';

interface BreadcrumbItem {
  id: string;
  label: string;
  onPress?: () => void;
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  accessibilityLabel?: string;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  items,
  accessibilityLabel = 'Trilha de navegação',
}) => {
  const isTablet = isLargeDevice || isMediumDevice;

  if (!items || items.length === 0) return null;

  const componentColors = {
    containerBackground: '#fff',
    containerBorder: '#e0e0e0',
    textActive: '#6200ee',
    textInactive: '#999',
    separatorIconColor: '#ccc',
  };

  // Estilos dinâmicos ordenados
  const dynamicStyles = StyleSheet.create({
    homeIconStyle: {
      marginRight: 4,
    },
    itemTextLastStyle: {
      color: componentColors.textActive,
      fontWeight: 'bold',
    },
    itemTextNormalStyle: { // MOVIDO para antes de itemTextStyle
      color: componentColors.textInactive,
      fontWeight: 'normal',
    },
    itemTextStyle: {
      fontSize: isTablet ? 16 : 14,
      maxWidth: 120,
    },
    separatorStyle: {
      color: componentColors.separatorIconColor,
      marginHorizontal: 4,
    }
  });

  return (
    <View
      style={[styles.container, {
        backgroundColor: componentColors.containerBackground,
        borderBottomColor: componentColors.containerBorder,
      }]}
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
          const homeIconColor = isLast ? componentColors.textActive : componentColors.textInactive;

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
                    color={homeIconColor}
                    style={dynamicStyles.homeIconStyle}
                  />
                )}

                <Text
                  style={[
                    dynamicStyles.itemTextStyle, // Mantém a ordem de aplicação aqui
                    isLast ? dynamicStyles.itemTextLastStyle : dynamicStyles.itemTextNormalStyle,
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
                  style={dynamicStyles.separatorStyle} // A cor já está neste estilo
                />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Estilos base ordenados
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
});

export default BreadcrumbTrail;
