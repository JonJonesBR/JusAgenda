import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, CheckBox, Icon, Card } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { useEvents } from "../contexts/EventContext";
import { COLORS, EVENT_TYPES } from "../utils/common";
import { formatDateTime } from "../utils/dateUtils";
import ExportService from "../services/ExportService";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useTheme } from "../contexts/ThemeContext";

const ExportScreen = () => {
  const navigation = useNavigation();
  const { events } = useEvents();
  const { theme } = useTheme();
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Filtra os eventos conforme os tipos selecionados.
  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        selectedTypes.length === 0 || selectedTypes.includes(event.type)
    );
  }, [events, selectedTypes]);

  // Alterna a seleção de um evento pelo seu id.
  const toggleEventSelection = useCallback((eventId) => {
    setSelectedEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }, []);

  // Alterna o filtro por tipo e limpa a seleção de eventos.
  const toggleTypeFilter = useCallback((type) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type]
    );
    setSelectedEvents([]); // Limpa a seleção ao mudar o filtro
  }, []);

  // Função que dispara a exportação conforme o formato escolhido.
  const handleExport = async (format) => {
    if (selectedEvents.length === 0) {
      Alert.alert("Aviso", "Selecione pelo menos um compromisso para exportar");
      return;
    }
    const eventsToExport = events.filter((event) =>
      selectedEvents.includes(event.id)
    );
    try {
      let exportResult = false;
      switch (format) {
        case "Excel":
          exportResult = await ExportService.exportToExcel(eventsToExport);
          break;
        case "PDF":
          exportResult = await ExportService.exportToPDF(eventsToExport);
          break;
        case "Word":
          exportResult = await ExportService.exportToWord(eventsToExport);
          break;
        default:
          break;
      }
      if (!exportResult || exportResult.success === false) return;
      Alert.alert(
        "Exportação Concluída",
        "O que você deseja fazer?",
        [
          {
            text: "Continuar Exportando",
            onPress: () => {
              setSelectedEvents([]);
              setSelectedTypes([]);
            },
          },
          { text: "Voltar ao Menu", onPress: () => navigation.goBack() },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert(
        "Erro na Exportação",
        "Não foi possível completar a exportação. Tente novamente."
      );
    }
  };

  // Seleciona todos os eventos visíveis (filtrados)
  const selectAll = useCallback(() => {
    setSelectedEvents(filteredEvents.map((event) => event.id));
  }, [filteredEvents]);

  // Limpa a seleção dos eventos
  const clearSelection = useCallback(() => {
    setSelectedEvents([]);
  }, []);

  // Verifica permissões de compartilhamento e acesso à MediaLibrary
  useEffect(() => {
    (async () => {
      try {
        const sharingAvailable = await Sharing.isAvailableAsync();
        const { status } = await MediaLibrary.requestPermissionsAsync();
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>
        Exportar Compromissos
      </Text>
      {/* Filtro de Tipos */}
      <Card containerStyle={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtrar por tipo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {Object.entries(EVENT_TYPES).map(([key, value]) => (
              <Button
                key={value}
                title={key.charAt(0) + key.slice(1).toLowerCase()}
                icon={{
                  name:
                    value === "audiencia"
                      ? "gavel"
                      : value === "reuniao"
                      ? "groups"
                      : value === "prazo"
                      ? "timer"
                      : "event",
                  size: 20,
                  color: selectedTypes.includes(value)
                    ? "white"
                    : theme.colors.primary,
                }}
                type={selectedTypes.includes(value) ? "solid" : "outline"}
                buttonStyle={[
                  styles.filterButton,
                  selectedTypes.includes(value) && styles.filterButtonActive,
                ]}
                onPress={() => toggleTypeFilter(value)}
              />
            ))}
          </View>
        </ScrollView>
      </Card>
      {/* Botões de Seleção */}
      <View style={styles.selectionButtons}>
        <Button title="Selecionar Todos" type="clear" onPress={selectAll} />
        <Button title="Limpar Seleção" type="clear" onPress={clearSelection} />
      </View>
      {/* Lista dos Eventos com CheckBox */}
      <ScrollView style={styles.eventsList}>
        {filteredEvents.map((event) => (
          <CheckBox
            key={event.id}
            checked={selectedEvents.includes(event.id)}
            onPress={() => toggleEventSelection(event.id)}
            title={
              <View style={styles.eventItem}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventInfo}>
                  {formatDateTime(event.date)}
                </Text>
                <Text style={styles.eventType}>
                  {event.type
                    ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
                    : ""}
                </Text>
              </View>
            }
            containerStyle={styles.checkboxContainer}
          />
        ))}
      </ScrollView>
      {/* Botões de Exportação */}
      <View style={styles.exportButtons}>
        <Button
          title="Excel"
          icon={{ name: "table", type: "font-awesome", color: "white" }}
          buttonStyle={[styles.exportButton, { backgroundColor: "#217346" }]}
          onPress={() => handleExport("Excel")}
        />
        <Button
          title="PDF"
          icon={{ name: "file-pdf-o", type: "font-awesome", color: "white" }}
          buttonStyle={[styles.exportButton, { backgroundColor: "#FF0000" }]}
          onPress={() => handleExport("PDF")}
        />
        <Button
          title="Word"
          icon={{ name: "file-word-o", type: "font-awesome", color: "white" }}
          buttonStyle={[styles.exportButton, { backgroundColor: "#2B579A" }]}
          onPress={() => handleExport("Word")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 10 },
  title: { textAlign: "center", marginVertical: 20, color: COLORS.textPrimary },
  filterCard: { margin: 10, borderRadius: 8 },
  filterTitle: { fontSize: 16, marginBottom: 10, color: COLORS.textSecondary },
  filterContainer: { flexDirection: "row", gap: 10 },
  filterButton: { paddingHorizontal: 15, borderRadius: 20 },
  filterButtonActive: { backgroundColor: COLORS.primary },
  selectionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  eventsList: { flex: 1 },
  checkboxContainer: {
    backgroundColor: "white",
    borderWidth: 0,
    marginVertical: 5,
  },
  eventItem: { marginLeft: 10 },
  eventTitle: { fontSize: 16, color: COLORS.textPrimary },
  eventInfo: { fontSize: 14, color: COLORS.textSecondary },
  eventType: { fontSize: 12, color: COLORS.primary },
  exportButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "white",
    elevation: 4,
  },
  exportButton: { paddingHorizontal: 20, borderRadius: 8 },
});

export default ExportScreen;
