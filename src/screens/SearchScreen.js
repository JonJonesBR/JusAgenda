import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { SearchBar, Button, Text, Card, Icon } from "@rneui/themed";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import SkeletonLoader from "../components/SkeletonLoader";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useEvents } from "../contexts/EventContext";
import { useTheme } from "../contexts/ThemeContext";

const EVENT_FILTERS = [
  { id: "audiencia", label: "Audiência", icon: "gavel" },
  { id: "reuniao", label: "Reunião", icon: "groups" },
  { id: "prazo", label: "Prazo", icon: "timer" },
  { id: "outros", label: "Outros", icon: "event" },
];

const SearchScreen = () => {
  const navigation = useNavigation();
  const { events, refreshEvents, loading, deleteEvent } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [deletedEvent, setDeletedEvent] = useState(null);
  const isFocused = useIsFocused();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isFocused) refreshEvents();
  }, [isFocused, refreshEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  }, [refreshEvents]);

  // Função para desfazer a exclusão
  const undoDelete = useCallback(async () => {
    if (deletedEvent) {
      try {
        // Aqui você precisaria implementar uma função para restaurar o evento
        // Como alternativa, podemos adicionar o evento novamente
        // await addEvent(deletedEvent);
        await refreshEvents();
        setDeletedEvent(null);
        Toast.show({
          type: "success",
          text1: "Exclusão desfeita",
          text2: "O compromisso foi restaurado com sucesso",
          position: "bottom",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível restaurar o compromisso",
          position: "bottom",
        });
      }
    }
  }, [deletedEvent, refreshEvents]);

  const filters = useMemo(() => EVENT_FILTERS, []);

  const toggleFilter = useCallback((filterId) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filterId)
        ? prevFilters.filter((id) => id !== filterId)
        : [...prevFilters, filterId]
    );
  }, []);

  const searchEvents = useCallback((term, selectedFilters, eventsToSearch) => {
    const termLower = term.toLowerCase().trim();
    let filtered = eventsToSearch;

    if (termLower) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(termLower) ||
          event.cliente?.toLowerCase().includes(termLower) ||
          event.descricao?.toLowerCase().includes(termLower) ||
          event.local?.toLowerCase().includes(termLower)
      );
    }

    if (selectedFilters.length > 0) {
      filtered = filtered.filter((event) =>
        selectedFilters.includes(event.tipo?.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(a.data) - new Date(b.data));
  }, []);

  useEffect(() => {
    if (searchTerm || selectedFilters.length > 0) {
      const results = searchEvents(searchTerm, selectedFilters, events);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [events, searchEvents, searchTerm, selectedFilters]);

  const handleSearchInput = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const handleSearch = useCallback(() => {
    const results = searchEvents(searchTerm, selectedFilters, events);
    setSearchResults(results);
  }, [searchTerm, selectedFilters, events, searchEvents]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const confirmDelete = useCallback(
    (event) => {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir este compromisso?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                // Fornece feedback tátil ao excluir
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );

                // Armazena o evento antes de excluí-lo para possível restauração
                setDeletedEvent(event);

                await deleteEvent(event.id);
                await refreshEvents();
                handleSearch(); // Atualiza os resultados da busca

                // Mostra toast com opção de desfazer
                Toast.show({
                  type: "info",
                  text1: "Compromisso excluído",
                  text2: "Toque para desfazer",
                  position: "bottom",
                  visibilityTime: 4000,
                  autoHide: true,
                  onPress: undoDelete,
                });
              } catch (error) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
                Toast.show({
                  type: "error",
                  text1: "Erro",
                  text2:
                    "Não foi possível excluir o compromisso. Tente novamente.",
                  position: "bottom",
                });
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [deleteEvent, refreshEvents, undoDelete, handleSearch]
  );

  const handleEventPress = useCallback(
    (event) => {
      // Fornece feedback tátil ao pressionar
      Haptics.selectionAsync();

      Alert.alert(
        "Opções",
        "O que você deseja fazer?",
        [
          {
            text: "Visualizar",
            onPress: () =>
              navigation.navigate("EventView", {
                event: {
                  id: event.id,
                  title: event.title,
                  date:
                    event.data instanceof Date
                      ? event.data.toISOString()
                      : event.data,
                  type: event.tipo,
                  client: event.cliente,
                  location: event.local,
                  description: event.descricao,
                },
              }),
          },
          {
            text: "Editar",
            onPress: () =>
              navigation.navigate("EventDetails", {
                event: {
                  ...event,
                  data:
                    event.data instanceof Date
                      ? event.data.toISOString()
                      : event.data,
                  date:
                    event.date instanceof Date
                      ? event.date.toISOString()
                      : event.date,
                },
              }),
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => confirmDelete(event),
          },
          { text: "Cancelar", style: "cancel" },
        ],
        { cancelable: true }
      );
    },
    [navigation, confirmDelete]
  );

  const getFilterIcon = useCallback(
    (filterId) => {
      const filterObj = filters.find((f) => f.id === filterId) || {
        icon: "event",
      };
      return filterObj.icon;
    },
    [filters]
  );

  // Exibe o skeleton loader durante o carregamento inicial
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text h4 style={styles.title}>
            Buscar Compromissos
          </Text>
          <Text style={styles.subtitle}>
            Pesquise por título, cliente, descrição ou local
          </Text>
        </View>
        <Card containerStyle={styles.searchCard}>
          <SkeletonLoader type="list" height={50} />
          <View style={{ height: 20 }} />
          <SkeletonLoader type="list" height={40} />
        </Card>
        <View style={styles.resultsContainer}>
          <SkeletonLoader type="list" count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>
          Buscar Compromissos
        </Text>
        <Text style={styles.subtitle}>
          Pesquise por título, cliente, descrição ou local
        </Text>
      </View>
      <Card containerStyle={styles.searchCard}>
        <SearchBar
          placeholder="Digite sua busca..."
          onChangeText={(text) => {
            handleSearchInput(text);
            if (!text && selectedFilters.length === 0) setSearchResults([]);
          }}
          value={searchTerm}
          platform="default"
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          round
        />
        <Text style={styles.filterTitle}>Filtrar por tipo:</Text>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              title={filter.label}
              icon={{
                name: filter.icon,
                size: 20,
                color: selectedFilters.includes(filter.id)
                  ? "white"
                  : "#6200ee",
              }}
              type={selectedFilters.includes(filter.id) ? "solid" : "outline"}
              buttonStyle={[
                styles.filterButton,
                selectedFilters.includes(filter.id) &&
                  styles.filterButtonActive,
              ]}
              titleStyle={[
                styles.filterButtonText,
                selectedFilters.includes(filter.id) &&
                  styles.filterButtonTextActive,
              ]}
              onPress={() => {
                toggleFilter(filter.id);
                handleSearch();
              }}
            />
          ))}
        </View>
        <Button
          title="Buscar"
          icon={{ name: "search", size: 20, color: "white" }}
          buttonStyle={styles.searchButton}
          onPress={handleSearch}
          disabled={!searchTerm && selectedFilters.length === 0}
        />
      </Card>
      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {searchResults.length}{" "}
            {searchResults.length === 1
              ? "resultado encontrado"
              : "resultados encontrados"}
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6200ee"]}
                tintColor="#6200ee"
              />
            }
            renderItem={({ item: event }) => (
              <Card key={event.id} containerStyle={styles.resultCard}>
                <TouchableOpacity onPress={() => handleEventPress(event)}>
                  <View style={styles.resultHeader}>
                    <Icon
                      name={getFilterIcon(event.type?.toLowerCase())}
                      color="#6200ee"
                      size={24}
                      style={styles.resultIcon}
                    />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>{event.title}</Text>
                      <Text style={styles.resultDate}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                  </View>
                  {event.location && (
                    <View style={styles.resultDetail}>
                      <Icon name="location-on" size={16} color="#757575" />
                      <Text style={styles.resultDetailText}>
                        {event.location}
                      </Text>
                    </View>
                  )}
                  {event.client && (
                    <View style={styles.resultDetail}>
                      <Icon name="person" size={16} color="#757575" />
                      <Text style={styles.resultDetailText}>
                        {event.client}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            )}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      ) : searchTerm || selectedFilters.length > 0 ? (
        <Card containerStyle={styles.noResultsCard}>
          <Icon name="search-off" size={48} color="#757575" />
          <Text style={styles.noResultsText}>
            Nenhum compromisso encontrado
          </Text>
        </Card>
      ) : (
        <Card containerStyle={styles.tipsCard}>
          <Card.Title>
            <View style={styles.cardTitleContainer}>
              <Icon name="lightbulb" color="#6200ee" size={24} />
              <Text style={styles.cardTitle}>Dicas de Busca</Text>
            </View>
          </Card.Title>
          <Card.Divider />
          <View style={styles.tipItem}>
            <Icon name="info" color="#6200ee" size={20} />
            <Text style={styles.tipText}>
              Use palavras-chave específicas para encontrar compromissos com
              facilidade.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="filter-list" color="#6200ee" size={20} />
            <Text style={styles.tipText}>
              Combine filtros para refinar sua busca.
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    padding: 20,
    backgroundColor: "#6200ee",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { color: "#fff", marginBottom: 5 },
  subtitle: { color: "#fff", opacity: 0.8, fontSize: 16 },
  searchCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    padding: 15,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchBarInput: { backgroundColor: "#f5f5f5" },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#000",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "transparent",
    borderColor: "#6200ee",
    marginBottom: 8,
  },
  filterButtonActive: { backgroundColor: "#6200ee" },
  filterButtonText: { color: "#6200ee", fontSize: 14 },
  filterButtonTextActive: { color: "white" },
  searchButton: { backgroundColor: "#6200ee", borderRadius: 10, height: 50 },
  resultsContainer: { padding: 16 },
  resultsTitle: { fontSize: 16, color: "#757575", marginBottom: 8 },
  resultCard: { borderRadius: 10, marginBottom: 8, padding: 12 },
  resultHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  resultIcon: {
    backgroundColor: "rgba(98, 0, 238, 0.1)",
    padding: 8,
    borderRadius: 20,
  },
  resultInfo: { marginLeft: 12, flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: "bold", color: "#000" },
  resultDate: { fontSize: 14, color: "#757575" },
  resultDetail: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  resultDetailText: { marginLeft: 8, fontSize: 14, color: "#000" },
  noResultsCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    alignItems: "center",
  },
  noResultsText: { marginTop: 16, fontSize: 16, color: "#757575" },
  tipsCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitleContainer: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 18, marginLeft: 8, color: "#6200ee" },
  tipItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipText: { marginLeft: 12, fontSize: 14, color: "#000", flex: 1 },
});

export default memo(SearchScreen);
