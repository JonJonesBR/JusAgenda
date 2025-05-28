// src/components/OptimizedFlatList.tsx
import React, { memo, ReactElement } from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, ViewToken } from 'react-native';

// Interface base para os itens da lista, garantindo que tenham um 'id' para o keyExtractor.
// Se os seus itens sempre tiverem uma estrutura diferente, ajuste esta interface.
interface BaseListItem {
  id: string | number; // ID pode ser string ou número
  // Adicione outros campos comuns se houver, ou deixe genérico.
}

// Props para o OptimizedFlatList
// Usando genéricos para o tipo do item (TItem)
// Omitimos 'data' e 'renderItem' de FlatListProps porque queremos tipá-los mais estritamente
// e possivelmente adicionar lógica customizada. No entanto, para um wrapper simples, podemos incluí-los.
interface OptimizedFlatListProps<TItem extends BaseListItem> extends Omit<FlatListProps<TItem>, 'viewabilityConfig'> {
  // data: ReadonlyArray<TItem> | null | undefined; // Já incluído em FlatListProps
  // renderItem: (info: ListRenderItemInfo<TItem>) => ReactElement | null; // Já incluído
  // keyExtractor?: (item: TItem, index: number) => string; // Já incluído

  // viewabilityConfig pode ser definido com um valor padrão otimizado
  viewabilityConfig?: FlatListProps<TItem>['viewabilityConfig'];

  // Adicione outras props customizadas se o seu OptimizedFlatList tiver lógica adicional.
  // Por exemplo, uma prop para controlar a profundidade da comparação em areEqual.
  // comparisonDepth?: number;
}

// Configuração de visibilidade padrão para otimizar o FlatList.
// Ajuste estes valores conforme necessário para o seu caso de uso.
const DEFAULT_VIEWABILITY_CONFIG = {
  minimumViewTime: 250, // Tempo mínimo em ms que um item deve estar visível para ser considerado "visto"
  viewAreaCoveragePercentThreshold: 50, // Percentagem do item que deve estar visível
  waitForInteraction: false, // Não esperar por interação para considerar itens visíveis
  itemVisiblePercentThreshold: 50, // Similar ao viewAreaCoveragePercentThreshold
};

/**
 * Uma função de comparação customizada para React.memo.
 * Compara as props relevantes para decidir se o FlatList deve ser re-renderizado.
 * @param prevProps - As props anteriores.
 * @param nextProps - As próximas props.
 * @returns true se as props forem consideradas iguais (sem necessidade de re-renderizar), false caso contrário.
 */
function areEqual<TItem extends BaseListItem>(
  prevProps: Readonly<OptimizedFlatListProps<TItem>>,
  nextProps: Readonly<OptimizedFlatListProps<TItem>>
): boolean {
  // Compara as props mais críticas primeiro.
  if (prevProps.data !== nextProps.data) {
    // Se a referência do array de dados mudou, verifica se o conteúdo realmente mudou.
    // Esta é uma comparação superficial do array. Para uma comparação profunda, seria mais custoso.
    // Para listas grandes, mudar a referência do array 'data' deve idealmente significar que os dados mudaram.
    if (!prevProps.data || !nextProps.data || prevProps.data.length !== nextProps.data.length) {
      return false; // Comprimento diferente ou um é nulo e o outro não.
    }
    // Compara item a item (superficialmente, pela referência do item)
    // Se os seus itens são objetos e mudam internamente sem mudar a referência do array 'data',
    // esta otimização pode não funcionar como esperado.
    for (let i = 0; i < prevProps.data.length; i++) {
      if (prevProps.data[i] !== nextProps.data[i]) {
        return false; // Referência de um item mudou.
      }
    }
    // Se chegou aqui, os itens são os mesmos (por referência), mas o array 'data' mudou de referência.
    // Isso pode acontecer se você fizer `setData([...oldData])`.
    // Se o `renderItem` ou `extraData` não mudaram, podemos considerar igual.
  }

  if (prevProps.renderItem !== nextProps.renderItem) return false;
  if (prevProps.extraData !== nextProps.extraData) return false;
  if (prevProps.numColumns !== nextProps.numColumns) return false;
  if (prevProps.keyExtractor !== nextProps.keyExtractor) return false;
  if (prevProps.ListHeaderComponent !== nextProps.ListHeaderComponent) return false;
  if (prevProps.ListFooterComponent !== nextProps.ListFooterComponent) return false;
  if (prevProps.ListEmptyComponent !== nextProps.ListEmptyComponent) return false;
  if (prevProps.refreshing !== nextProps.refreshing) return false;
  if (prevProps.onEndReached !== nextProps.onEndReached) return false; // Funções podem mudar de referência
  if (prevProps.onRefresh !== nextProps.onRefresh) return false;

  // Compara outras props importantes se necessário.
  // Cuidado para não tornar esta função de comparação muito complexa,
  // pois isso pode anular os ganhos de performance do React.memo.

  // Se todas as props relevantes forem iguais, não re-renderiza.
  return true;
}

// Componente OptimizedFlatList usando React.memo e a função de comparação areEqual.
// O tipo genérico TItem precisa ser passado para o React.Memo e para a função.
const OptimizedFlatListInner = <TItem extends BaseListItem>(
  props: OptimizedFlatListProps<TItem>,
  ref: React.Ref<FlatList<TItem>> // Encaminhando a ref
) => {
  const { viewabilityConfig = DEFAULT_VIEWABILITY_CONFIG, ...restProps } = props;

  // Função de fallback para keyExtractor se nenhuma for fornecida.
  const defaultKeyExtractor = useCallback(
    (item: TItem, index: number): string => {
      if (item && (typeof item.id === 'string' || typeof item.id === 'number')) {
        return item.id.toString();
      }
      // console.warn(`OptimizedFlatList: Item no índice ${index} não possui um 'id' válido. Usando índice como chave.`);
      return `index-${index}`;
    },
    []
  );

  // Renderizador de item de fallback (geralmente você fornecerá o seu)
  const defaultRenderItem = ({ item }: ListRenderItemInfo<TItem>): ReactElement => (
    <View style={{ padding: 10 }}><Text>ID: {item.id}</Text></View>
  );

  return (
    <FlatList<TItem> // Especificando o tipo TItem para o FlatList interno
      ref={ref} // Aplicando a ref encaminhada
      keyExtractor={props.keyExtractor || defaultKeyExtractor}
      renderItem={props.renderItem || defaultRenderItem}
      viewabilityConfig={viewabilityConfig}
      // Otimizações comuns para FlatList:
      initialNumToRender={props.initialNumToRender ?? 10} // Renderiza um lote inicial menor
      maxToRenderPerBatch={props.maxToRenderPerBatch ?? 10} // Número de itens a renderizar por lote fora da janela de visualização
      windowSize={props.windowSize ?? 21} // Define a "janela" de renderização (em múltiplos da altura da viewport)
      removeClippedSubviews={props.removeClippedSubviews ?? Platform.OS === 'android'} // Remove subviews fora da tela (pode ter bugs no iOS)
      updateCellsBatchingPeriod={props.updateCellsBatchingPeriod ?? 50} // Atraso em ms para renderizar lotes de células
      // getItemLayout é uma otimização poderosa se todos os seus itens tiverem a mesma altura (ou se você puder calculá-la)
      // getItemLayout={(data, index) => (
      //   {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
      // )}
      {...restProps} // Passa as props restantes
    />
  );
};

// Envolvendo com React.forwardRef e React.memo
// É importante tipar corretamente o forwardRef e o memo quando se usa genéricos.
const OptimizedFlatList = React.forwardRef(OptimizedFlatListInner) as <TItem extends BaseListItem>(
  props: OptimizedFlatListProps<TItem> & { ref?: React.Ref<FlatList<TItem>> }
) => ReactElement;

// Aplicando React.memo com a função de comparação customizada.
// O memo precisa ser tipado corretamente com o genérico também.
export default memo(OptimizedFlatList, areEqual) as typeof OptimizedFlatList;

// Exemplo de uso:
/*
interface MyDataItem extends BaseListItem {
  id: string;
  title: string;
}
const data: MyDataItem[] = [{id: '1', title: 'Item 1'}, {id: '2', title: 'Item 2'}];

<OptimizedFlatList<MyDataItem>
  data={data}
  renderItem={({item}) => <Text>{item.title}</Text>}
  keyExtractor={item => item.id}
/>
*/
