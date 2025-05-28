// src/components/ui/List.tsx
import React, { ReactElement, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Interface para os itens da lista, pode ser expandida ou tornada genérica
// Se cada item tiver uma estrutura mais complexa, defina-a aqui ou importe.
export interface ListItem {
  id: string; // ID é geralmente obrigatório para keyExtractor
  title?: string;
  subtitle?: string;
  // Adicione outros campos que seus itens de lista possam ter
  [key: string]: any; // Permite outros campos, mas com cuidado para type safety
}

// Props para o componente List
// Usando genéricos para o tipo do item (TItem)
interface ListProps<TItem extends ListItem> extends Omit<FlatListProps<TItem>, 'renderItem' | 'data'> {
  data: TItem[] | null | undefined;
  renderItem?: (info: ListRenderItemInfo<TItem>) => ReactElement | null; // renderItem é opcional, podemos ter um padrão
  keyExtractor?: (item: TItem, index: number) => string;
  isLoading?: boolean;
  loadingIndicatorColor?: string;
  ListEmptyComponent?: ReactElement | null;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>; // Para o contentContainerStyle do FlatList
  // Adicione outras props customizadas que seu List possa precisar
  // Ex: onEndReachedThreshold, onRefresh, refreshing
}

// Componente padrão para quando a lista está vazia
const DefaultListEmptyComponent: React.FC<{
  title?: string;
  message?: string;
  icon?: ReactElement;
  textColor: string;
  fontFamilyRegular: string;
  fontFamilyBold: string;
}> = ({ title = 'Nada para mostrar', message, icon, textColor, fontFamilyRegular, fontFamilyBold }) => (
  <View style={styles.emptyContainer}>
    {icon && <View style={styles.emptyIconContainer}>{icon}</View>}
    <Text style={[styles.emptyTitle, { color: textColor, fontFamily: fontFamilyBold }]}>{title}</Text>
    {message && <Text style={[styles.emptyMessage, { color: textColor, fontFamily: fontFamilyRegular }]}>{message}</Text>}
  </View>
);

// Componente List genérico
function List<TItem extends ListItem>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  loadingIndicatorColor,
  ListEmptyComponent: CustomEmptyComponent,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateIcon,
  containerStyle,
  contentContainerStyle,
  ...flatListProps // Restante das props do FlatList
}: ListProps<TItem>): ReactElement {
  const { theme } = useTheme();

  const defaultKeyExtractor = useCallback((item: TItem, index: number): string => {
    if (item && typeof item.id === 'string') {
      return item.id;
    }
    // console.warn(`List: Item no índice ${index} não possui um 'id' string. Usando índice como chave.`);
    return index.toString();
  }, []);

  // Renderizador de item padrão simples (se nenhum for fornecido)
  // Geralmente, o usuário do componente List fornecerá seu próprio renderItem.
  const defaultRenderItem = ({ item }: ListRenderItemInfo<TItem>): ReactElement => (
    <View style={{ padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md, fontFamily: theme.typography.fontFamily.regular }}>
        {item.title || `Item ${item.id}`}
      </Text>
      {item.subtitle && (
        <Text style={{ color: theme.colors.placeholder, fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.fontFamily.regular }}>
          {item.subtitle}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={loadingIndicatorColor || theme.colors.primary} />
      </View>
    );
  }

  const finalRenderItem = renderItem || defaultRenderItem;
  const finalKeyExtractor = keyExtractor || defaultKeyExtractor;

  const EmptyComponentToRender = CustomEmptyComponent !== undefined // Se CustomEmptyComponent for explicitamente null, não renderiza nada
    ? CustomEmptyComponent
    : (
        <DefaultListEmptyComponent
          title={emptyStateTitle}
          message={emptyStateMessage}
          icon={emptyStateIcon}
          textColor={theme.colors.text}
          fontFamilyRegular={theme.typography.fontFamily.regular}
          fontFamilyBold={theme.typography.fontFamily.bold}
        />
      );


  return (
    <FlatList<TItem> // Especificando o tipo TItem para FlatList
      data={data || []} // Garante que data nunca seja null/undefined para FlatList
      renderItem={finalRenderItem}
      keyExtractor={finalKeyExtractor}
      ListEmptyComponent={data === null || (data && data.length === 0) ? EmptyComponentToRender : null}
      style={containerStyle} // Estilo para o container do FlatList em si
      contentContainerStyle={[
        (data === null || data?.length === 0) && styles.emptyContentContainer, // Centraliza o EmptyComponent se a lista estiver vazia
        contentContainerStyle // Permite sobrescrever ou adicionar estilos ao contentContainer
      ]}
      {...flatListProps} // Passa as props restantes para o FlatList
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 150, // Altura mínima para o container vazio
  },
  emptyContentContainer: { // Usado para centralizar o EmptyComponent
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18, // Ajustado via theme.typography
    fontWeight: 'bold', // Ajustado via theme.typography
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14, // Ajustado via theme.typography
    textAlign: 'center',
  },
  // Estilos para o item padrão (defaultRenderItem) são inline para simplicidade,
  // mas poderiam ser movidos para cá se ficassem mais complexos.
});

export default List;
