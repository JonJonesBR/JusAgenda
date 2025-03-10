import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '@rneui/themed';

const { width } = Dimensions.get('window');

/**
 * Componente de carregamento que exibe um efeito de esqueleto animado
 * para indicar que o conteúdo está sendo carregado.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo de esqueleto ('card', 'list', 'detail')
 * @param {number} props.width - Largura do esqueleto
 * @param {number} props.height - Altura do esqueleto
 * @param {number} props.count - Número de itens de esqueleto a serem exibidos
 */
const SkeletonLoader = ({ type = 'card', width: customWidth, height = 150, count = 1 }) => {
  const shimmerAnimation = new Animated.Value(0);
  
  // Configurações baseadas no tipo
  const getTypeConfig = () => {
    switch (type) {
      case 'card':
        return {
          width: customWidth || 280,
          height: height,
          borderRadius: 10,
          containerStyle: styles.cardContainer
        };
      case 'list':
        return {
          width: customWidth || width - 32,
          height: 100,
          borderRadius: 10,
          containerStyle: styles.listContainer
        };
      case 'detail':
        return {
          width: customWidth || width - 32,
          height: 200,
          borderRadius: 10,
          containerStyle: styles.detailContainer
        };
      default:
        return {
          width: customWidth || 280,
          height: height,
          borderRadius: 10,
          containerStyle: styles.cardContainer
        };
    }
  };

  const config = getTypeConfig();

  // Efeito de animação de brilho
  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
    return () => shimmerAnimation.stopAnimation();
  }, [shimmerAnimation]);

  // Interpolação para o efeito de brilho
  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.width, config.width],
  });

  const renderSkeletonItem = (index) => (
    <Card key={index} containerStyle={[config.containerStyle, { width: config.width, height: config.height }]}>
      <View style={styles.container}>
        {/* Cabeçalho do card */}
        <View style={styles.header}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.titlePlaceholder} />
        </View>
        
        {/* Corpo do card */}
        <View style={styles.bodyPlaceholder} />
        
        {/* Detalhes do card */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.iconSmallPlaceholder} />
            <View style={styles.detailPlaceholder} />
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconSmallPlaceholder} />
            <View style={styles.detailPlaceholder} />
          </View>
        </View>
        
        {/* Efeito de brilho */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
      </View>
    </Card>
  );

  // Renderiza múltiplos itens de esqueleto se necessário
  return (
    <View style={type === 'card' ? styles.horizontalContainer : styles.verticalContainer}>
      {Array.from({ length: count }).map((_, index) => renderSkeletonItem(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
  },
  verticalContainer: {
    flexDirection: 'column',
  },
  cardContainer: {
    borderRadius: 10,
    padding: 16,
    marginRight: 8,
    marginVertical: 8,
    elevation: 4,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: '#f5f5f5',
  },
  detailContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#f5f5f5',
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  titlePlaceholder: {
    marginLeft: 8,
    height: 14,
    width: '70%',
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  bodyPlaceholder: {
    height: 18,
    width: '90%',
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconSmallPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  detailPlaceholder: {
    marginLeft: 8,
    height: 14,
    width: '60%',
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -100 }],
  },
});

export default SkeletonLoader;