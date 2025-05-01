import React, { memo, useCallback, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  loadingMore?: boolean;
  onEndReachedThreshold?: number;
  emptyText?: string;
  estimatedItemSize?: number;
  prefetchItems?: number;
  initialNumToRender?: number;
  emptyComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  cacheKey?: string; // Para memoização de dados
}

/**
 * FlatList otimizado com configurações para melhor performance e UX
 * - Usa windowing para renderizar apenas itens visíveis + buffer
 * - Aplica técnicas de memoização para evitar re-renderizações
 * - Configurações padrão otimizadas para desempenho
 * - Implementa estados de carregamento e lista vazia
 */
function OptimizedFlatListComponent<T>({
  data,
  renderItem,
  keyExtractor,
  loadingMore = false,
  onEndReachedThreshold = 0.5,
  emptyText = 'Nenhum item encontrado',
  estimatedItemSize = 100,
  prefetchItems = 5,
  initialNumToRender = 10,
  emptyComponent,
  footerComponent,
  headerComponent,
  onScroll,
  cacheKey,
  ...rest
}: OptimizedFlatListProps<T>) {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList<T>>(null);
  
  // Usar memoização para o renderItem para evitar re-renders desnecessários
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem({ item, index }),
    [renderItem]
  );

  // Memoizar o keyExtractor para evitar re-renders desnecessários
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Fallback para index se não for fornecido um keyExtractor
      return index.toString();
    },
    [keyExtractor]
  );

  // Componente a ser exibido quando não houver dados
  const EmptyComponent = useCallback(() => {
    if (emptyComponent) {
      return emptyComponent;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {emptyText}
        </Text>
      </View>
    );
  }, [emptyText, emptyComponent, theme]);

  // Componente a ser exibido no rodapé da lista
  const FooterComponent = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Carregando mais itens...
          </Text>
        </View>
      );
    }

    if (footerComponent) {
      return footerComponent;
    }

    return null;
  }, [loadingMore, footerComponent, theme]);

  // Componente a ser exibido no cabeçalho da lista
  const HeaderComponent = useCallback(() => {
    if (headerComponent) {
      return headerComponent;
    }
    return null;
  }, [headerComponent]);

  // Otimiza o cálculo de tamanho
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    }),
    [estimatedItemSize]
  );

  // Implementação de scroll otimizado com debounce
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (onScroll) {
        // Implementa um debounce simples para prevenir chamadas frequentes demais
        requestAnimationFrame(() => {
          onScroll(event);
        });
      }
    },
    [onScroll]
  );
  
  const perf = {
    // Evita renderização quando itens saem completamente da tela
    removeClippedSubviews: true,
    // Pré-renderiza itens fora da tela para rolagem suave
    windowSize: 1 + (prefetchItems / 5),
    // Renderiza em lote para melhor performance
    maxToRenderPerBatch: prefetchItems,
    // Atualiza itens em lote para melhor performance
    updateCellsBatchingPeriod: 50,
    // Evita cálculos desnecessários enquanto arrasta
    disableScrollViewPanResponder: true,
    // Mantem um buffer de itens enquanto rola
    maintainVisibleContentPosition: {
      minIndexForVisible: 0,
    },
    // Número inicial de itens a renderizar (menos é mais rápido)
    initialNumToRender: initialNumToRender,
  };

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      ListEmptyComponent={EmptyComponent}
      ListFooterComponent={FooterComponent}
      ListHeaderComponent={HeaderComponent}
      onEndReachedThreshold={onEndReachedThreshold}
      getItemLayout={getItemLayout}
      onScroll={handleScroll}
      {...perf}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

// Usando memo para evitar re-renders desnecessários quando as props não mudam
export const OptimizedFlatList = memo(OptimizedFlatListComponent) as typeof OptimizedFlatListComponent;
