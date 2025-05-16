import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native"; // Added Alert import
import { Text, Card, Icon } from "@rneui/themed";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { searchCompromissos } from "../services/EventService";
import { useEvents } from "../contexts/EventContext"; // Added useEvents import

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { term, filters } = route.params || {};
  const [events, setEvents] = useState([]);
  const { deleteEvent, refreshEvents } = useEvents(); // Get delete and refresh functions

  const searchForEvents = useCallback(async () => {
    try {
      let results = await searchCompromissos(term || "");
      if (filters && filters.length > 0) {
        results = results.filter((event) =>
          filters.includes(event.type?.toLowerCase())
        );
      }
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(results);
    } catch (error) {
      console.error("Error searching events:", error);
      setEvents([]);
    }
  }, [term, filters]);

  useEffect(() => {
    if (isFocused) searchForEvents();
  }, [isFocused, searchForEvents]);

  // Function to handle event press and show options
  const handleEventPress = useCallback(
    (event) => {
      Alert.alert(
        "Opções",
        "O que você deseja fazer?",
        [
          {
            text: "Visualizar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: false }),
          },
          {
            text: "Editar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: true }),
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
  ); // Added confirmDelete to dependencies

  // Function to confirm event deletion
  const confirmDelete = useCallback(
    (event) => {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir este compromisso?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteEvent(event.id);
                // Refresh both the context and the local search results
                await refreshEvents();
                await searchForEvents();
              } catch (error) {
                Alert.alert("Erro", "Não foi possível excluir o compromisso");
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [deleteEvent, refreshEvents, searchForEvents]
  ); // Added dependencies

  const getEventTypeIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case "audiencia":
        return { name: "gavel", color: "#6200ee" };
      case "reuniao":
        return { name: "groups", color: "#03dac6" };
      case "prazo":
        return { name: "timer", color: "#ff0266" };
      default:
        return { name: "event", color: "#018786" };
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-off" size={48} color="#757575" />
        <Text style={styles.emptyText}>
          Nenhum compromisso encontrado{term ? ` para "${term}"` : ""}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item: event }) => {
    const icon = getEventTypeIcon(event.type);
    return (
      // Updated onPress to call handleEventPress
      <TouchableOpacity onPress={() => handleEventPress(event)}>
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name={icon.name} color={icon.color} size={24} />
            <Text style={styles.eventType}>
              {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={16} color="#757575" />
            <Text style={styles.date}>{formatDate(event.date)}</Text>
          </View>
          {event.location && (
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#757575" />
              <Text style={styles.location} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
          {event.client && (
            <View style={styles.clientContainer}>
              <Icon name="person" size={16} color="#757575" />
              <Text style={styles.client} numberOfLines={1}>
                {event.client}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.resultsText}>
        {events.length}{" "}
        {events.length === 1
          ? "compromisso encontrado"
          : "compromissos encontrados"}
        {term ? ` para "${term}"` : ""}
      </Text>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listContainer: { padding: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  resultsText: { padding: 16, fontSize: 16, color: "#000" },
  card: { marginBottom: 16, padding: 16, borderRadius: 12, elevation: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  eventType: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  date: { marginLeft: 8, fontSize: 14, color: "#757575" },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  location: { marginLeft: 8, fontSize: 14, color: "#757575", flex: 1 },
  clientContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  client: { marginLeft: 8, fontSize: 14, color: "#757575", flex: 1 },
});

export default SearchResultsScreen;
