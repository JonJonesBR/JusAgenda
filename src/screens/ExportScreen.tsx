// src/screens/ExportScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Switch, // Usando Switch para filtros de tipo de evento
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import _ from 'lodash';

import { useTheme, Theme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType } from '../types/event';
import { SyncStackParamList } from '../navigation/stacks/SyncStack'; // Ajuste para a sua Stack Param List
import { Header, Button, Card, List } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, EVENT_TYPES, EVENT_TYPE_LABELS, getEventTypeLabel } from '../constants';
import * as ExportService from '../services/ExportService'; // Usando o ExportService atualizado
import { formatDate, parseISO } from '../utils/dateUtils';

// Tipagem para a prop de navegação
type ExportScreenNavigationProp = StackNavigationProp<SyncStackParamList, typeof ROUTES.EXPORT>;

interface SelectableEventForExport extends EventType {
  isSelected?: boolean;
}

type ExportFormatOption = ExportService.ExportFormat;

const EXPORT_FORMAT_OPTIONS: Array<{ label: string; value: ExportFormatOption, icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { label: 'Excel (.xlsx)', value: 'excel', icon: 'file-excel-outline' },
  { label: 'PDF (.pdf)', value: 'pdf', icon: 'file-pdf-box' },
  { label: 'Word (.docx)', value: 'word', icon: 'file-word-outline' },
  { label: 'CSV (.csv)', value: 'csv', icon: 'file-delimited-outline' },
  { label: 'JSON (.json)', value: 'json', icon: 'code-json' },
];

const ExportScreen: React.FC = () => {
  const { theme } = useTheme();
  const { events: allEvents, isLoading: isLoadingEvents } = useEvents();
  const navigation = useNavigation<ExportScreenNavigationProp>();

  const [selectableEvents, setSelectableEvents] = useState<SelectableEventForExport[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(Object.values(EVENT_TYPES))); // Todos os tipos selecionados por padrão
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatOption>(EXPORT_FORMAT_OPTIONS[0].value); // Excel como padrão

  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filtra e prepara eventos para seleção
  const filteredEventsForSelection = useMemo(() => {
    return allEvents
      .filter(event => selectedTypes.has(event.eventType || ''))
      .sort((a, b) => parseISO(b.data).getTime() - parseISO(a.data).getTime()); // Mais recentes primeiro
  }, [allEvents, selectedTypes]);

  useEffect(() => {
    setSelectableEvents(
      filteredEventsForSelection.map(event => ({
        ...event,
        isSelected: selectedEventIds.has(event.id),
      }))
    );
  }, [filteredEventsForSelection, selectedEventIds]);

  const toggleEventTypeFilter = (eventTypeValue: string) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventTypeValue)) {
        newSet.delete(eventTypeValue);
      } else {
        newSet.add(eventTypeValue);
      }
      // Limpa seleção de eventos se os filtros mudarem para evitar exportar itens não visíveis
      setSelectedEventIds(new Set());
      return newSet;
    });
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedEventIds.size === selectableEvents.length && selectableEvents.length > 0) {
      setSelectedEventIds(new Set()); // Desmarcar todos os filtrados
    } else {
      setSelectedEventIds(new Set(selectableEvents.map(e => e.id))); // Marcar todos os filtrados
    }
  };

  const handleExport = async () => {
    if (selectedEventIds.size === 0) {
      Toast.show({ type: 'info', text1: 'Nenhum Evento', text2: 'Selecione pelo menos um evento para exportar.' });
      return;
    }
    if (!await Sharing.isAvailableAsync()) {
        Toast.show({ type: 'error', text1: 'Partilha Indisponível', text2: 'A funcionalidade de partilha não está disponível neste dispositivo.' });
        return;
    }

    setIsExporting(true);
    const eventsToExport = allEvents.filter(e => selectedEventIds.has(e.id));

    try {
      // Chama o serviço de exportação (que é um placeholder)
      const result = await ExportService.exportData(eventsToExport, { format: selectedFormat });

      if (result.success && result.filePath) {
        Toast.show({ type: 'success', text1: 'Exportação Concluída (Simulação)', text2: `Ficheiro gerado: ${result.filePath.split('/').pop()}` });
        // Tenta partilhar o ficheiro simulado
        // Em uma implementação real, o filePath seria um URI acessível.
        // Para simulação, podemos criar um ficheiro temporário se o ExportService não o fizer.
        // Por agora, vamos assumir que o filePath é um placeholder e tentar partilhar.
        // A partilha de um caminho de ficheiro falso provavelmente falhará, mas demonstra o fluxo.
        await Sharing.shareAsync(result.filePath, {
          mimeType: getMimeType(selectedFormat),
          dialogTitle: `Partilhar ${selectedFormat.toUpperCase()} de eventos`,
        });
      } else {
        Toast.show({ type: 'error', text1: 'Falha na Exportação', text2: result.error || 'Não foi possível gerar o ficheiro.' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("ExportScreen: Erro ao exportar ou partilhar:", message);
      Toast.show({ type: 'error', text1: 'Erro', text2: `Ocorreu um erro: ${message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const getMimeType = (format: ExportFormatOption): string => {
    switch (format) {
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf': return 'application/pdf';
      case 'word': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      default: return 'application/octet-stream';
    }
  };


  const renderSelectableEventItem = ({ item }: { item: SelectableEventForExport }) => (
    <Card style={styles.eventItemCard} onPress={() => toggleEventSelection(item.id)}>
      <View style={styles.eventItemContainer}>
        <MaterialCommunityIcons
          name={item.isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
          size={24}
          color={item.isSelected ? theme.colors.primary : theme.colors.placeholder}
          style={styles.checkboxIcon}
        />
        <View style={styles.eventDetails}>
          <Text style={[styles.eventTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{item.title}</Text>
          <Text style={[styles.eventDateTime, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            {formatDate(parseISO(item.data), 'dd/MM/yyyy')}
            {item.hora && !item.isAllDay ? ` às ${item.hora}` : (item.isAllDay ? ' (Dia Todo)' : '')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderFilterTypeSwitch = (typeValue: string, typeLabel: string) => (
    <View key={typeValue} style={styles.filterSwitchRow}>
        <Text style={[styles.filterSwitchLabel, {color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular}]}>{typeLabel}</Text>
        <Switch
            trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
            ios_backgroundColor={theme.colors.disabled}
            onValueChange={() => toggleEventTypeFilter(typeValue)}
            value={selectedTypes.has(typeValue)}
            disabled={isExporting}
        />
    </View>
  );


  if (isLoadingEvents && selectableEvents.length === 0) { // Mostra loading inicial dos eventos
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Exportar Dados" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="1. Selecionar Formato" theme={theme} style={styles.sectionStyle}>
            <View style={styles.formatSelectorContainer}>
                {EXPORT_FORMAT_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.formatButton,
                            {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
                            selectedFormat === opt.value && {backgroundColor: theme.colors.primary, borderColor: theme.colors.primary}
                        ]}
                        onPress={() => setSelectedFormat(opt.value)}
                        disabled={isExporting}
                    >
                        <MaterialCommunityIcons name={opt.icon} size={24} color={selectedFormat === opt.value ? theme.colors.white : theme.colors.primary} />
                        <Text style={[
                            styles.formatButtonText,
                            {fontFamily: theme.typography.fontFamily.regular, color: selectedFormat === opt.value ? theme.colors.white : theme.colors.primary }
                        ]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Section>

        <Section title="2. Filtrar Tipos de Evento (Opcional)" theme={theme} style={styles.sectionStyle}>
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) =>
                renderFilterTypeSwitch(value, label)
            )}
        </Section>

        <Section title="3. Selecionar Eventos para Exportar" theme={theme} style={styles.sectionStyle}>
          {selectableEvents.length === 0 && !isLoadingEvents ? (
            <Text style={[styles.infoText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center' }]}>
              Nenhum evento encontrado com os filtros aplicados.
            </Text>
          ) : (
            <>
              <View style={styles.selectAllRow}>
                <Button
                  title={selectedEventIds.size === selectableEvents.length && selectableEvents.length > 0 ? "Desmarcar Todos" : "Marcar Todos os Visíveis"}
                  onPress={toggleSelectAllFiltered}
                  type="clear"
                  size="sm"
                  icon={selectedEventIds.size === selectableEvents.length && selectableEvents.length > 0 ? "checkbox-multiple-marked-outline" : "checkbox-multiple-blank-outline"}
                  disabled={isExporting || selectableEvents.length === 0}
                />
              </View>
              <List<SelectableEventForExport>
                data={selectableEvents}
                renderItem={renderSelectableEventItem}
                keyExtractor={(item) => item.id}
                // contentContainerStyle={{ maxHeight: 300 }} // Limitar altura da lista se necessário
              />
            </>
          )}
        </Section>

        <Button
          title={`Exportar ${selectedEventIds.size} Evento(s) como ${selectedFormat.toUpperCase()}`}
          onPress={handleExport}
          type="solid"
          icon="export-variant"
          loading={isExporting}
          disabled={isExporting || selectedEventIds.size === 0}
          buttonStyle={{ marginVertical: theme.spacing.lg }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionStyle: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  formatSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  formatButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8, // Usar theme.radii.md
    minWidth: 100, // Largura mínima para cada botão de formato
    margin: 4, // Usar theme.spacing.xs
  },
  formatButtonText: {
    fontSize: 12, // Usar theme.typography.fontSize.xs
    marginTop: 4,
  },
  filterSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Usar theme.spacing.xs
    // borderBottomWidth: StyleSheet.hairlineWidth, // Opcional
    // borderBottomColor: theme.colors.border,
  },
  filterSwitchLabel: {
    fontSize: 15, // Usar theme.typography.fontSize.sm
    flexShrink: 1,
    marginRight: 8,
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  eventItemCard: {
    marginBottom: 8,
  },
  eventItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  eventDateTime: {
    fontSize: 13,
  },
});

export default ExportScreen;
