import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Button, CheckBox, Card } from "@rneui/themed";
import { useEvents } from "../contexts/EventCrudContext"; // Event import removed
import { eventTypes } from "../constants";
import { formatDate } from "../utils/dateUtils";
import ExportService from "../services/ExportService";
import * as Sharing from "expo-sharing";
import { useTheme } from "../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

type ExportFormat = 'Excel' | 'PDF' | 'Word';

const componentColors = {
  white: '#FFFFFF',
  transparent: 'transparent', // Added for checkbox
};

const ExportScreen: React.FC = () => {
  const { events } = useEvents();
  const { theme } = useTheme();
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSharingAvailable, setIsSharingAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEvents = useMemo(() => {
    if (selectedTypes.length === 0) {
      return events;
    }
    const typeSet = new Set(selectedTypes);
    return events.filter((event) => event.type && typeSet.has(event.type));
  }, [events, selectedTypes]);

  useEffect(() => {
    (async () => {
      try {
        const available = await Sharing.isAvailableAsync();
        setIsSharingAvailable(available);
        if (!available) {
            Alert.alert("Compartilhamento Indisponível", "Não será possível compartilhar arquivos exportados diretamente.");
        }
      } catch (error) {
        console.error("Erro ao verificar disponibilidade de compartilhamento:", error);
      }
    })();
  }, []);

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEventIds((currentIds) => {
      const newIds = new Set(currentIds);
      if (newIds.has(eventId)) {
        newIds.delete(eventId);
      } else {
        newIds.add(eventId);
      }
      return Array.from(newIds);
    });
  }, []);

  const toggleTypeFilter = useCallback((typeValue: string) => {
    setSelectedTypes((currentTypes) => {
      const newTypes = new Set(currentTypes);
      if (newTypes.has(typeValue)) {
        newTypes.delete(typeValue);
      } else {
        newTypes.add(typeValue);
      }
      return Array.from(newTypes);
    });
    setSelectedEventIds([]);
  }, []);

  const toggleSelectAllFiltered = useCallback(() => {
      const allFilteredIds = filteredEvents.map((event) => event.id);
      const allFilteredSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedEventIds.includes(id));

      if (allFilteredSelected) {
          const currentSelectedSet = new Set(selectedEventIds);
          allFilteredIds.forEach(id => currentSelectedSet.delete(id));
          setSelectedEventIds(Array.from(currentSelectedSet));
      } else {
          const currentSelectedSet = new Set(selectedEventIds);
          allFilteredIds.forEach(id => currentSelectedSet.add(id));
          setSelectedEventIds(Array.from(currentSelectedSet));
      }
  }, [filteredEvents, selectedEventIds]);

  const clearSelection = useCallback(() => {
    setSelectedEventIds([]);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    if (selectedEventIds.length === 0) {
      Alert.alert("Nenhum Evento", "Selecione pelo menos um compromisso para exportar.");
      return;
    }
     if (!isSharingAvailable) {
         Alert.alert("Compartilhamento Indisponível", "Não é possível exportar/compartilhar o arquivo.");
         return;
    }

    const eventsToExport = events.filter((event) => selectedEventIds.includes(event.id));

    setIsLoading(true);
    try {
      let result: { success: boolean; message?: string; error?: string; filePath?: string } = { success: false };

      switch (format) {
        case "Excel":
          result = await ExportService.exportToExcel(eventsToExport);
          break;
        case "PDF":
          result = await ExportService.exportToPDF(eventsToExport);
          break;
        case "Word":
           result = await ExportService.exportToWord(eventsToExport);
           break;
      }

      if (result.success) {
        if (result.filePath && isSharingAvailable) {
            await Sharing.shareAsync(result.filePath, {
                mimeType: format === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : (format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
                dialogTitle: `Compartilhar ${format}`,
            });
            Toast.show({type: 'success', text1: 'Exportado e Pronto para Compartilhar!'});
        } else {
             Alert.alert("Exportação Concluída", result.message || `Arquivo ${format} gerado com sucesso.` );
        }
        setSelectedEventIds([]);
      } else {
        Alert.alert("Erro na Exportação", result.error || "Não foi possível gerar o arquivo.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Não foi possível completar a exportação para ${format}.`;
      console.error(`Erro ao exportar para ${format}:`, error);
      Alert.alert("Erro Inesperado", message);
    } finally {
      setIsLoading(false);
    }
  };

  const allFilteredSelected = useMemo(() => {
      const allFilteredIds = filteredEvents.map((event) => event.id);
      return allFilteredIds.length > 0 && allFilteredIds.every(id => selectedEventIds.includes(id));
  }, [filteredEvents, selectedEventIds]);

  const exportButtonColors = {
    Excel: theme.colors.success || '#217346',
    PDF: theme.colors.error || '#FF0000',
    Word: theme.colors.info || '#2B579A',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
        Exportar Compromissos
      </Text>

      <Card containerStyle={[styles.filterCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.filterTitle, { color: theme.colors.textSecondary }]}>Filtrar por tipo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {Object.entries(eventTypes || {}).map(([key, value]) => {
             const typeValue = String(value);
             const isSelected = selectedTypes.includes(typeValue);
             return (
                <Button
                    key={String(typeValue)}
                    title={key}
                    icon={{ name: 'tag-outline', type: 'material-community', size: 18, color: isSelected ? componentColors.white : theme.colors.primary }}
                    type={isSelected ? "solid" : "outline"}
                    buttonStyle={[ styles.filterButton, isSelected ? { backgroundColor: theme.colors.primary } : { borderColor: theme.colors.primary } ]}
                    titleStyle={[styles.filterButtonTitle, {color: isSelected ? componentColors.white : theme.colors.primary}]}
                    onPress={() => toggleTypeFilter(typeValue)}
                    disabled={isLoading}
                />
             );
          })}
        </ScrollView>
      </Card>

      <View style={styles.selectionActions}>
        <Button
            title={allFilteredSelected ? "Desmarcar Todos" : "Selecionar Todos"}
            type="clear"
            onPress={toggleSelectAllFiltered}
            titleStyle={{ color: theme.colors.primary }}
            disabled={isLoading || filteredEvents.length === 0}
         />
        <Button
            title="Limpar Seleção"
            type="clear"
            onPress={clearSelection}
            titleStyle={{ color: theme.colors.primary }}
            disabled={isLoading || selectedEventIds.length === 0}
         />
      </View>

      <ScrollView style={styles.eventsList}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <TouchableOpacity key={event.id} onPress={() => toggleEventSelection(event.id)} disabled={isLoading}>
                 <Card containerStyle={[styles.eventItemCard, { backgroundColor: theme.colors.card, borderColor: selectedEventIds.includes(event.id) ? theme.colors.primary : theme.colors.border }]}>
                    <View style={styles.eventItemRow}>
                         <CheckBox
                            checked={selectedEventIds.includes(event.id)}
                            onPress={() => toggleEventSelection(event.id)}
                            containerStyle={styles.checkbox}
                            checkedColor={theme.colors.primary}
                            uncheckedColor={theme.colors.textSecondary}
                            disabled={isLoading}
                        />
                        <View style={styles.eventItemText}>
                            <Text style={[styles.eventItemTitle, { color: theme.colors.text }]}>{event.title || "Sem Título"}</Text>
                            <Text style={[styles.eventItemInfo, { color: theme.colors.textSecondary }]}>
                                {formatDate(event.date)} - {event.type ? (event.type.charAt(0).toUpperCase() + event.type.slice(1)) : "Geral"}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noEventsText, { color: theme.colors.textSecondary }]}>
            Nenhum compromisso encontrado {selectedTypes.length > 0 ? 'para os tipos selecionados' : ''}.
          </Text>
        )}
      </ScrollView>

      <View style={[styles.exportButtonContainer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        {(['Excel', 'PDF', 'Word'] as ExportFormat[]).map((format) => (
          <Button
            key={format}
            title={format}
            icon={{ name: format === 'Excel' ? 'file-excel-outline' : (format === 'PDF' ? 'file-pdf-box' : 'file-word-outline'), type: "material-community", color: componentColors.white }}
            buttonStyle={[styles.exportButton, { backgroundColor: exportButtonColors[format] }]}
            titleStyle={[styles.exportButtonTitle, {color: componentColors.white}]}
            onPress={() => handleExport(format)}
            disabled={isLoading || selectedEventIds.length === 0}
            loading={isLoading && format === 'Excel'}
            containerStyle={styles.exportButtonWrapper}
          />
        ))}
      </View>
       {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.primary} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    backgroundColor: componentColors.transparent, // Use constant
    borderWidth: 0,
    margin: 0,
    marginRight: 10,
    padding: 0,
  },
  container: {
    flex: 1,
  },
  eventItemCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 10,
  },
  eventItemInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  eventItemRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  eventItemText: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventsList: {
    flex: 1,
  },
  exportButton: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  exportButtonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exportButtonTitle: {
    fontSize: 14,
  },
  exportButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonTitle: {
    fontSize: 13,
  },
  filterCard: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  filterScroll: {
      paddingLeft: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 8,
  },
  loadingIndicator: {
    alignSelf: 'center',
    bottom: 80,
    position: 'absolute',
  },
  noEventsText: {
    fontSize: 16,
    marginVertical: 40,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  selectionActions: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
});

export default React.memo(ExportScreen);
