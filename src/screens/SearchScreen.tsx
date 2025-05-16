import React, { useState, useCallback, useEffect, memo } from "react"; // Removed useMemo
import {
  View,
  StyleSheet,
  TouchableOpacity,
  //Alert, // Comment this line
  RefreshControl,
  Text,
  ScrollView,
} from "react-native";
import { SearchBar, Button, Card, Icon, Skeleton as RNESkeleton } from "@rneui/themed";
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from "expo-haptics";
import { useNavigation, useIsFocused, NavigationProp } from "@react-navigation/native";
import { useEvents, Event } from "../contexts/EventCrudContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatDate } from "../utils/dateUtils";
import { eventTypes } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  Search: undefined;
  EventView: { eventId: string };
  EventDetails: { event?: Partial<Event>; editMode?: boolean; readOnly?: boolean };
};
type SearchNavigationProp = NavigationProp<RootStackParamList, 'Search'>;

const EVENT_FILTERS = Object.entries(eventTypes || {}).map(([key, value]) => ({
    id: value.id, // Use the unique id property from the nested object
    label: key,
    icon: value.id === 'hearing' ? 'gavel' : (value.id === 'meeting' ? 'groups' : (value.id === 'deadline' ? 'timer-outline' : 'calendar-blank-outline'))
}));

const componentColors = {
  white: '#FFFFFF',
  defaultPlaceholderText: '#A9A9A9',
  defaultSurface: '#FFFFFF',
};

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const eventData = useEvents();
  const events = eventData?.events || [];
  // const refreshEvents = eventData?.refreshEvents; // Not in context
  // const loadingContext = eventData?.loading ?? false; // Not in context
  //const deleteEvent = eventData.deleteEvent;
  const { theme } = useTheme();
  const isFocused = useIsFocused();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);


  const searchEventsInternal = useCallback((term: string, filters: string[], eventsToSearch: Event[]): Event[] => {
    const termLower = term.toLowerCase().trim();
    const filterSet = new Set(filters.map(f => f.toLowerCase()));
    let localFiltered = eventsToSearch;

    if (termLower) {
      localFiltered = localFiltered.filter(event =>
        (event.title?.toLowerCase().includes(termLower)) ||
        (event.cliente?.toLowerCase().includes(termLower)) ||
        (event.description?.toLowerCase().includes(termLower)) ||
        (event.local?.toLowerCase().includes(termLower)) ||
        (event.numeroProcesso?.includes(termLower))
      );
    }

    if (filterSet.size > 0) {
      localFiltered = localFiltered.filter(event => event.type && filterSet.has(event.type.toLowerCase()));
    }

    return localFiltered.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    });
  }, []);

  const loadAndSearchEvents = useCallback(async (showMainLoadingSpinner = false) => {
    if(showMainLoadingSpinner) setRefreshing(true); // Use refreshing for the main search/load activity
    const results = searchEventsInternal(searchTerm, selectedFilters, events);
    setSearchResults(results);
    if(showMainLoadingSpinner) setRefreshing(false);
  }, [searchTerm, selectedFilters, events, searchEventsInternal]);

  useEffect(() => {
    if (isFocused) {
      loadAndSearchEvents(false);
    }
  }, [isFocused, loadAndSearchEvents, events]);

  useEffect(() => {
      const results = searchEventsInternal(searchTerm, selectedFilters, events);
      setSearchResults(results);
  }, [events, searchTerm, selectedFilters, searchEventsInternal]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // if (refreshEvents) { // refreshEvents removed
    //     try {
    //         await refreshEvents();
    //     } catch {
    //         Toast.show({ type: 'error', text1: 'Erro ao atualizar'});
    //     }
    // } else {
    await loadAndSearchEvents(false); // Directly call loadAndSearchEvents
    // }
    setRefreshing(false);
  }, [loadAndSearchEvents]); // Removed refreshEvents from dependencies

  const toggleFilter = useCallback((filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedFilters((prevFilters) => {
        const newFilters = new Set(prevFilters);
        if (newFilters.has(filterId)) {
            newFilters.delete(filterId);
        } else {
            newFilters.add(filterId);
        }
        return Array.from(newFilters);
    });
  }, []);



  const handleEventPress = useCallback((event: Event) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      navigation.navigate("EventView", { eventId: event.id });
    }, [navigation]);
  const getFilterIcon = useCallback((filterId: string): string => {
      const filterObj = EVENT_FILTERS.find((f) => f.id === filterId);
      return filterObj?.icon || 'calendar-blank-outline';
  }, []);

   const renderResultItem = ({ item, drag, isActive }: RenderItemParams<Event>) => (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        onPress={() => handleEventPress(item)}
        // Removed onLongPress here as drag will handle the long press
        delayLongPress={500} // Keep delay for the remaining onPress if needed, although might not be necessary with onLongPress for drag
      >
        <Card containerStyle={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.resultHeader}>
            <Icon
              name={getFilterIcon(item.type?.toLowerCase() || '')}
              type="material-community"
              color={theme.colors.primary}
              size={24}
              containerStyle={[styles.resultIconContainer, { backgroundColor: theme.colors.primary + '20'}]}
            />
            <View style={styles.resultInfo}>
              <Text style={[styles.resultTitleStyle, { color: theme.colors.text }]} numberOfLines={1}>{item.title || "Sem Título"}</Text>
              <Text style={[styles.resultDate, { color: theme.colors.textSecondary }]}>
                {item.date ? formatDate(new Date(item.date)) : 'Sem data'}
              </Text>
            </View>
          </View>
          {item.local && (
            <View style={styles.resultDetailRow}>
              <Icon name="map-marker-outline" type="material-community" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.resultDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.local}</Text>
            </View>
          )}
          {item.cliente && (
            <View style={styles.resultDetailRow}>
              <Icon name="account-outline" type="material-community" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.resultDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.cliente}</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
       <SearchBar
          placeholder="Buscar por título, cliente, local..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          platform="default"
          containerStyle={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}
          inputContainerStyle={[styles.searchBarInput, { backgroundColor: theme.colors.background || componentColors.defaultSurface }]}
          inputStyle={styles.searchInputStyle}
          placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholderText}
          searchIcon={{ color: theme.colors.textSecondary }}
          clearIcon={{ color: theme.colors.textSecondary }}
          round
          showLoading={false} // loadingContext removed
        />

        <View style={[styles.filtersScrollViewContainer, {borderBottomColor: theme.colors.border}]}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                 {EVENT_FILTERS.map((filter) => {
                    const isSelected = selectedFilters.includes(filter.id);
                    return (
                        <Button
                            key={filter.id}
                            icon={{ name: filter.icon, type: 'material-community', size: 20, color: isSelected ? componentColors.white : theme.colors.primary }}
                            type={isSelected ? "solid" : "outline"}
                            buttonStyle={[ styles.filterChipButton, isSelected ? { backgroundColor: theme.colors.primary } : { borderColor: theme.colors.primary } ]}
                            onPress={() => toggleFilter(filter.id)}
                            accessibilityLabel={`Filtrar por ${filter.label}`}
                        />
                    );
                 })}
             </ScrollView>
        </View>

      <View style={styles.resultsListContainer}>
        {refreshing && searchResults.length === 0 ? ( // Changed to refreshing from loadingContext
            <ScrollView style={styles.skeletonContainer}>
                 <RNESkeleton height={80} style={styles.skeletonItem}/>
                 <RNESkeleton height={80} style={styles.skeletonItem}/>
                 <RNESkeleton height={80} style={styles.skeletonItem}/>
            </ScrollView>
        ) : searchResults.length > 0 ? (
          <DraggableFlatList<Event>
            data={searchResults}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => item.id ? item.id.toString() : `${item.title || 'event'}-${index}`}
            contentContainerStyle={styles.listContent}
            onDragEnd={({ data }) => { /* TODO: Update searchResults state with the new order */ setSearchResults(data); console.log('New search results order:', data); }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={11}
            removeClippedSubviews={true}
          />
        ) : (searchTerm || selectedFilters.length > 0) ? (
            <View style={styles.centeredMessageContainer}>
                <Icon name="text-search" type="material-community" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.centeredMessageText, { color: theme.colors.textSecondary }]}>
                    Nenhum compromisso encontrado para sua busca.
                </Text>
                 <Button title="Limpar Busca/Filtros" onPress={() => { setSearchTerm(''); setSelectedFilters([]); }} type="clear" titleStyle={{ color: theme.colors.primary }} />
            </View>
        ) : (
            <View style={styles.centeredMessageContainer}>
                 <Icon name="lightbulb-on-outline" type="material-community" size={48} color={theme.colors.textSecondary} />
                 <Text style={[styles.centeredMessageText, { color: theme.colors.textSecondary }]}>
                    Digite termos na barra de busca ou use os filtros rápidos para encontrar seus compromissos.
                 </Text>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredMessageContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 30,
  },
   centeredMessageText: {
      fontSize: 16,
      lineHeight: 23,
      marginTop: 16,
      textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  filterChipButton: {
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
  },
  filtersContent: {
      alignItems: 'center',
  },
  filtersScrollViewContainer: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 16,
      paddingVertical: 8,
  },
  listContent: {
      paddingBottom: 20,
      paddingHorizontal: 16,
      paddingTop: 8,
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    marginBottom: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultDate: {
    fontSize: 13,
  },
  resultDetailRow: {
      alignItems: "center",
      flexDirection: "row",
      marginLeft: 42,
      marginTop: 6,
  },
  resultDetailText: {
      flex: 1,
      fontSize: 14,
      marginLeft: 6,
  },
  resultHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 6,
  },
  resultIconContainer: {
      borderRadius: 20,
      marginRight: 10,
      padding: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitleStyle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  resultsListContainer: {
      flex: 1,
  },
  searchBarContainer: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingVertical: 4,
  },
  searchBarInput: {
    borderRadius: 10,
    height: 44,
  },
  searchInputStyle: {
    fontSize: 16,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  skeletonItem: {
    borderRadius: 12,
    marginBottom: 10,
  },
});

export default memo(SearchScreen);
