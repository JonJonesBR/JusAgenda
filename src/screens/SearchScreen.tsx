// src/screens/SearchScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import DraggableFlatList, {
  RenderItemParams as DraggableRenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'; // Assumindo que ainda quer usar
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext'; // Para aceder aos eventos
import { Event as EventType } from '../types/event';
import { SearchStackParamList } from '../navigation/stacks/SearchStack'; // Ajuste para a sua Stack Param List
import { Header, Input, Card, Button, LoadingSkeleton } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, EVENT_TYPES, EVENT_TYPE_LABELS, getEventTypeLabel, getEventStatusLabel } from '../constants';
import { formatDate, formatTime, parseISO, isDateValid } from '../utils/dateUtils';
import { DEBOUNCE_DELAY } from '../constants';

// Tipagem para a prop de navegação específica desta tela
type SearchScreenNavigationProp = StackNavigationProp<SearchStackParamList, typeof ROUTES.SEARCH>;

// Tipos de filtro (poderiam vir de constants.ts)
type FilterType = EventType['eventType'] | 'all';

const EVENT_FILTERS_OPTIONS: Array<{ label: string; value: FilterType }> = [
  { label: 'Todos', value: 'all' },
  ...Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ label, value: value as EventType['eventType'] })),
  // Adicionar filtros para status, prioridade, etc., se necessário
];


const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const { events: allEvents, isLoading: isLoadingEventsContext } = useEvents();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const isFocused = useIsFocused();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']); // Filtro de tipo de evento
  const [searchResults, setSearchResults] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading para a própria busca
  const [showFilters, setShowFilters] = useState(false); // Para mostrar/esconder opções de filtro

  // Debounce para o termo de busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [searchTerm]);


  const performSearch = useCallback(() => {
    if (!isFocused) return; // Não executa a busca se a tela não estiver focada

    // console.log(`SearchScreen: Performing search for "${debouncedSearchTerm}" with filters:`, activeFilters);
    if (!debouncedSearchTerm.trim() && activeFilters.includes('all') && activeFilters.length === 1) {
      setSearchResults([]); // Limpa resultados se a busca for vazia e sem filtros específicos
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    // Simula uma busca (poderia ser uma chamada de API ou uma filtragem mais complexa)
    setTimeout(() => {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      const results = allEvents.filter(event => {
        const matchesTerm = !lowerSearchTerm || // Se não houver termo, considera que corresponde (para filtrar apenas por tipo)
          (event.title && event.title.toLowerCase().includes(lowerSearchTerm)) ||
          (event.description && event.description.toLowerCase().includes(lowerSearchTerm)) ||
          (event.local && event.local.toLowerCase().includes(lowerSearchTerm)) ||
          (event.numeroProcesso && event.numeroProcesso.toLowerCase().includes(lowerSearchTerm));

        const matchesFilters = activeFilters.includes('all') ||
          (event.eventType && activeFilters.includes(event.eventType));
          // Adicionar lógica para outros tipos de filtro (status, prioridade) aqui

        return matchesTerm && matchesFilters;
      }).sort((a, b) => { // Ordena por data (mais recente primeiro) e depois por hora
        const dateA = a.data ? parseISO(a.data).getTime() : 0;
        const dateB = b.data ? parseISO(b.data).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA; // Mais recente primeiro
        const timeA = a.hora ? a.hora.replace(':', '') : '0000';
        const timeB = b.hora ? b.hora.replace(':', '') : '0000';
        return timeA.localeCompare(timeB);
      });

      setSearchResults(results);
      setIsLoading(false);
      // console.log(`SearchScreen: Found ${results.length} results.`);
    }, 500); // Simula latência da busca
  }, [allEvents, debouncedSearchTerm, activeFilters, isFocused]);

  // Executa a busca quando o termo debounceado ou os filtros mudam, ou quando a tela foca
  useEffect(() => {
    if (isFocused) { // Só executa a busca se a tela estiver focada
        performSearch();
    } else {
        // Opcional: limpar resultados ou manter o estado anterior quando a tela não está focada
        // setSearchResults([]); // Exemplo: limpar resultados ao sair da tela
    }
  }, [debouncedSearchTerm, activeFilters, isFocused, performSearch]); // performSearch foi adicionado


  const toggleFilter = (filterValue: FilterType) => {
    setActiveFilters(prevFilters => {
      if (filterValue === 'all') {
        return ['all']; // Se 'all' for selecionado, remove outros filtros de tipo
      }
      const newFilters = prevFilters.includes(filterValue)
        ? prevFilters.filter(f => f !== filterValue && f !== 'all') // Remove o filtro e 'all'
        : [...prevFilters.filter(f => f !== 'all'), filterValue]; // Adiciona o filtro e remove 'all'

      return newFilters.length === 0 ? ['all'] : newFilters; // Se nenhum filtro específico, volta para 'all'
    });
  };

  const navigateToEventView = (event: EventType) => {
    Keyboard.dismiss(); // Esconde o teclado antes de navegar
    navigation.navigate(ROUTES.EVENT_VIEW, { eventId: event.id, eventTitle: event.title, event });
  };

  const renderSearchResultItem = ({ item, drag, isActive }: DraggableRenderItemParams<EventType>) => (
    <ScaleDecorator>
      <Card
        style={styles.resultCard}
        onPress={() => navigateToEventView(item)}
        onLongPress={!isActive ? drag : undefined} // Permite arrastar com long press
        disabled={isActive}
        elevation="sm"
      >
        <Text style={[styles.itemTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {item.title}
        </Text>
        <View style={styles.itemDetailRow}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
          <Text style={[styles.itemDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
            {item.data ? formatDate(parseISO(item.data), 'dd/MM/yyyy') : 'N/D'}
            {item.hora && !item.isAllDay ? ` às ${item.hora}` : (item.isAllDay ? ' (Dia Todo)' : '')}
          </Text>
        </View>
        {item.local && (
          <View style={styles.itemDetailRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
            <Text style={[styles.itemDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>{item.local}</Text>
          </View>
        )}
        {item.eventType && (
            <View style={[styles.itemDetailRow, {marginTop: theme.spacing.xs/2}]}>
                <View style={[styles.badge, {backgroundColor: theme.colors.primary}]}>
                    <Text style={[styles.badgeText, {color: theme.colors.white, fontFamily: theme.typography.fontFamily.regular}]}>{getEventTypeLabel(item.eventType)}</Text>
                </View>
                {item.status && (
                    <View style={[styles.badge, {backgroundColor: theme.colors.info, marginLeft: theme.spacing.xs}]}>
                        <Text style={[styles.badgeText, {color: theme.colors.white, fontFamily: theme.typography.fontFamily.regular}]}>{getEventStatusLabel(item.status)}</Text>
                    </View>
                )}
            </View>
        )}
      </Card>
    </ScaleDecorator>
  );

  const renderFilterOptions = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.filterTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Filtrar por Tipo:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {EVENT_FILTERS_OPTIONS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              activeFilters.includes(filter.value) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => toggleFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: activeFilters.includes(filter.value) ? theme.colors.white : theme.colors.primary, fontFamily: theme.typography.fontFamily.regular },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Buscar"
        // Opcional: Adicionar um botão para limpar a busca ou filtros no header
        // rightComponent={
        //   (searchTerm || activeFilters.length > 1 || !activeFilters.includes('all')) ? (
        //     <TouchableOpacity onPress={() => { setSearchTerm(''); setActiveFilters(['all']); }}>
        //       <MaterialCommunityIcons name="close-circle-outline" size={24} color={theme.colors.text} />
        //     </TouchableOpacity>
        //   ) : null
        // }
      />
      <View style={styles.searchControlsContainer}>
        <Input
          placeholder="Digite para buscar eventos..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder} />}
          containerStyle={{ flex: 1, marginRight: theme.spacing.sm }}
          // autoFocus // Pode ser irritante se a tela focar e o teclado abrir sempre
        />
        <Button
            icon={showFilters ? "filter-variant-remove" : "filter-variant"}
            onPress={() => setShowFilters(prev => !prev)}
            type="outline"
            size="md" // Para alinhar com a altura do Input
        />
      </View>

      {showFilters && renderFilterOptions()}

      {isLoading && searchResults.length === 0 ? ( // Mostra skeleton se estiver a carregar e não houver resultados ainda
        <View style={{padding: theme.spacing.md, flex:1}}>
            <LoadingSkeleton count={4} rowHeight={100} />
        </View>
      ) : (
        <DraggableFlatList<EventType>
          data={searchResults}
          renderItem={renderSearchResultItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setSearchResults(data)} // Atualiza a ordem local se arrastar
          // useNativeDriver={Platform.OS !== 'web'} // useNativeDriver pode ser problemático na web para draggable
          ListEmptyComponent={
            !isLoading && ( // Só mostra se não estiver a carregar
              <View style={styles.centeredMessageContainer}>
                <MaterialCommunityIcons name="text-search" size={48} color={theme.colors.placeholder} />
                <Text style={[styles.messageText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
                  {debouncedSearchTerm || (activeFilters.length > 1 || !activeFilters.includes('all'))
                    ? 'Nenhum resultado encontrado para sua busca.'
                    : 'Digite algo para buscar ou aplique filtros.'}
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchControlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingTop: 8,       // Usar theme.spacing.sm
    paddingBottom: 4,    // Usar theme.spacing.xs
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingVertical: 8,   // Usar theme.spacing.sm
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: theme.colors.border, // Aplicar dinamicamente
  },
  filterTitle: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    marginBottom: 8, // Usar theme.spacing.sm
  },
  filterScroll: {
    paddingRight: 16, // Espaço no final do scroll horizontal
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16, // Usar theme.radii.xl ou round
    borderWidth: 1,
    marginRight: 8, // Usar theme.spacing.sm
  },
  filterButtonText: {
    fontSize: 13, // Usar theme.typography.fontSize.xs
  },
  resultCard: {
    marginHorizontal: 16, // Usar theme.spacing.md
    marginVertical: 8,   // Usar theme.spacing.sm
  },
  itemTitle: {
    fontSize: 17, // Usar theme.typography
    marginBottom: 6,
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconStyle: {
    marginRight: 8,
  },
  itemDetailText: {
    fontSize: 14,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12, // Usar theme.radii.lg
  },
  badgeText: {
    fontSize: 11, // Usar theme.typography.fontSize.xs
    // fontWeight: 'bold', // Opcional
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  centeredMessageContainer: {
    flex: 1, // Para ocupar o espaço se a lista estiver vazia
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 30, // Para não ficar colado nos filtros/busca
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SearchScreen;
