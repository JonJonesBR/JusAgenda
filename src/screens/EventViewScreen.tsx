import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Share, Alert, Text } from "react-native"; // Removed ActivityIndicator
import { Button, Icon, Badge, Card } from "@rneui/themed";
import { useNavigation, useRoute, CommonActions, RouteProp, NavigationProp } from "@react-navigation/native";
import { useEvents, Event as EventFromContext } from "../contexts/EventCrudContext";
import { useTheme, Theme as ThemeType } from "../contexts/ThemeContext";
import { formatDateTime, formatFullDate } from "../utils/dateUtils";
import type { Event as EventTypeFromTypes } from "../types/event";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message'; // Assuming this will be installed
// Haptics import removed as it's not used in this file

type DisplayEvent = Partial<EventTypeFromTypes & EventFromContext>;

type EventViewParams = {
    eventId?: string;
    event?: Partial<EventTypeFromTypes>;
};

type RootStackParamList = {
  EventView: EventViewParams;
  EventDetails: { event: Partial<EventTypeFromTypes>; editMode: boolean };
  HomeScreen: undefined; // Assuming HomeScreen is a valid route name
};

type EventViewNavigationProp = NavigationProp<RootStackParamList, 'EventView'>;
type EventViewRouteProp = RouteProp<RootStackParamList, 'EventView'>;

const componentColors = {
  white: '#FFFFFF',
  defaultGrey: '#A9A9A9',
  lightGrey: '#D3D3D3', // For empty list icon
  defaultSurface: '#FFFFFF',
};

const getEventTypeDetailsLocal = (eventType: string | undefined | null, currentTheme: ThemeType) => {
    const typeLower = eventType?.toLowerCase() || 'evento';
    switch (typeLower) {
      case 'audiencia': return { name: 'gavel', type: 'material', color: currentTheme.colors.primary, label: 'Audiência' };
      case 'reuniao': return { name: 'groups', type: 'material', color: currentTheme.colors.secondary || '#03dac6', label: 'Reunião' };
      case 'prazo': return { name: 'timer-outline', type: 'material-community', color: currentTheme.colors.error || '#ff0266', label: 'Prazo' };
      case 'despacho': return { name: 'receipt-long', type: 'material', color: currentTheme.colors.info || '#018786', label: 'Despacho' };
      default: return { name: 'calendar-blank-outline', type: 'material-community', color: currentTheme.colors.textSecondary || componentColors.defaultGrey, label: eventType || 'Evento' };
    }
};

const getStatusBadgeLocal = (eventDateString: string | Date | undefined | null, currentTheme: ThemeType) => {
    if (!eventDateString) return { label: 'Data?', color: currentTheme.colors.textSecondary || componentColors.defaultGrey, icon: 'help-circle-outline' };
    try {
        const now = new Date();
        const eventDate = new Date(eventDateString);
        now.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (isNaN(eventDate.getTime())) return { label: 'Data Inválida', color: currentTheme.colors.error || 'red', icon: 'alert-circle-outline'};
        if (eventDate < now) return { label: 'Realizado', color: currentTheme.colors.success || 'green', icon: 'check-circle-outline' };
        if (eventDate.getTime() === now.getTime()) return { label: 'Hoje', color: currentTheme.colors.warning || 'orange', icon: 'alert-outline' };
        return { label: 'Agendado', color: currentTheme.colors.primary || 'blue', icon: 'clock-outline' };
    } catch {
        return { label: 'Data Inválida', color: currentTheme.colors.error || 'red', icon: 'alert-circle-outline' };
    }
};

const getBadgeColorLocal = (priority: string | undefined | null, currentTheme: ThemeType): string => {
    if (!priority) return currentTheme.colors.textSecondary || componentColors.defaultGrey;
    const p = priority.toLowerCase();
    if (p === 'alta' || p === 'urgente') return currentTheme.colors.error || 'red';
    if (p === 'media' || p === 'média') return currentTheme.colors.warning || 'orange';
    if (p === 'baixa') return currentTheme.colors.success || 'green';
    return currentTheme.colors.textSecondary || componentColors.defaultGrey;
};

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, theme, iconType = "material-community", valueColor }) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        if (typeof value !== 'boolean') return null;
    }
    const displayValue = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value);
    const finalValueColor = valueColor || theme.colors.text;

    return (
        <View style={styles.detailItemContainer}>
            <Icon name={icon} type={iconType} size={20} color={theme.colors.textSecondary} style={styles.detailItemIcon} />
            <View style={styles.detailItemTextContainer}>
                <Text style={[styles.detailItemLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.detailItemValue, { color: finalValueColor }]} selectable={true}>{displayValue}</Text>
            </View>
        </View>
    );
};

interface DetailItemProps {
    icon: string;
    label: string;
    value?: string | number | boolean | null;
    theme: ThemeType;
    iconType?: string;
    valueColor?: string;
}

const EventViewScreen: React.FC = () => {
  const navigation = useNavigation<EventViewNavigationProp>();
  const route = useRoute<EventViewRouteProp>();
  const eventData = useEvents();
  const events = eventData?.events || [];
  const deleteEvent = eventData.deleteEvent;
  // const isLoading = eventData?.loading ?? false; // loading state not in context
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const eventId = route.params?.eventId || route.params?.event?.id;
  const event: DisplayEvent | undefined = useMemo(() => {
      if (route.params?.event && route.params.event.id === eventId) {
          return route.params.event;
      }
      return events.find((e) => e.id === eventId);
  }, [route.params, events, eventId]);

  useEffect(() => {
    const currentTitle = event?.title;
    const currentType = event?.tipo || event?.type; // tipo from EventTypeFromTypes, type from EventFromContext
    if (currentType) {
      navigation.setOptions({ title: currentType.charAt(0).toUpperCase() + currentType.slice(1) });
    } else if (currentTitle) {
         navigation.setOptions({ title: currentTitle });
    } else {
      navigation.setOptions({ title: "Detalhes" });
    }
  }, [navigation, event]);

  const handleEdit = () => {
    if (!event) return;
    navigation.navigate("EventDetails", { event: event as Partial<EventTypeFromTypes>, editMode: true });
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      const eventDate = event.data ? new Date(event.data) : null;
      const dataFormatada = eventDate ? formatFullDate(eventDate) : 'N/A';
      const horarioFormatado = eventDate ? formatDateTime(eventDate) : 'N/A';
      const cliente = event.cliente || event.title || 'Compromisso';
      const tipo = event.tipo ? event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1) : 'Compromisso';

      let message = `📝 *${tipo}*`;
      if (cliente !== 'Compromisso') message += ` - ${cliente}`;
      message += `\n\n`;
      message += `📅 *Data:* ${dataFormatada}\n`;
      message += `⏰ *Horário:* ${horarioFormatado}\n`;
      if (event.local) message += `📍 *Local:* ${event.local}\n`;
      if (event.numeroProcesso) message += `🔢 *Processo:* ${event.numeroProcesso}\n`;
      if (event.descricao) message += `\n📄 *Descrição:*\n${event.descricao}\n`;

      await Share.share({ message: message.trim(), title: `${tipo} - ${cliente}` });
    } catch (error: unknown) {
      console.error("Erro ao compartilhar:", error);
      Alert.alert("Erro", "Não foi possível compartilhar o compromisso no momento.");
    }
  };

  const handleDelete = () => {
    if (!event?.id) return;
    Alert.alert("Confirmar Exclusão", `Tem certeza que deseja excluir "${event.title || 'este compromisso'}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            if(deleteEvent) await deleteEvent(event.id!);
            Toast.show({ type: 'success', text1: 'Compromisso Excluído' });
            navigation.dispatch( CommonActions.reset({ index: 0, routes: [{ name: "HomeScreen" }] }) );
          } catch (err: unknown) { // Explicitly type err
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            Alert.alert("Erro", `Não foi possível excluir: ${message}`);
          }
        },
      },
    ]);
  };

  // if (isLoading && !event) { // isLoading removed
  //     return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
  // }

  if (!event) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="alert-circle-outline" type="material-community" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Compromisso não encontrado</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} type="clear" />
      </View>
    );
  }

  const eventTypeDetails = getEventTypeDetailsLocal(event.tipo, theme);
  const statusBadgeDetails = getStatusBadgeLocal(event.data, theme);

  return (
    <View style={styles.flexContainer}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={[styles.customHeader, { backgroundColor: theme.colors.background || componentColors.defaultSurface, borderBottomColor: theme.colors.border }]}>
          <Icon name={eventTypeDetails.name} type={eventTypeDetails.type || 'material-community'} size={28} color={eventTypeDetails.color} style={styles.headerIcon} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{event.title || "Sem Título"}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{eventTypeDetails.label}</Text>
          </View>
          {(event.prioridade) && (
            <Badge
              value={event.prioridade.charAt(0).toUpperCase() + event.prioridade.slice(1)}
              badgeStyle={[styles.priorityBadge, { backgroundColor: getBadgeColorLocal(event.prioridade, theme) }]}
              textStyle={styles.priorityBadgeText}
            />
          )}
        </View>

        <View style={styles.bodyContainer}>
          <Card containerStyle={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
             <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}><Text>Detalhes Principais</Text></Card.Title>
             <Card.Divider color={theme.colors.border}/>
             <DetailItem icon="calendar-month-outline" label="Data e Hora" value={event.data ? formatFullDate(new Date(event.data)) + ' às ' + formatDateTime(new Date(event.data)) : 'N/A'} theme={theme} />
             <DetailItem icon="map-marker-outline" label="Local" value={event.local} theme={theme} />
             <DetailItem icon="account-outline" label="Cliente" value={event.cliente} theme={theme} />
             <DetailItem icon="text-long" label="Descrição/Obs." value={event.descricao} theme={theme} />
             <DetailItem icon={statusBadgeDetails.icon} label="Status" value={statusBadgeDetails.label} theme={theme} valueColor={statusBadgeDetails.color} />
          </Card>

          {(event.numeroProcesso || event.vara || event.observacoes) && (
              <Card containerStyle={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                  <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}><Text>Detalhes Processuais</Text></Card.Title>
                  <Card.Divider color={theme.colors.border}/>
                  <DetailItem icon="pound-box-outline" label="Nº Processo" value={event.numeroProcesso} theme={theme} />
                  <DetailItem icon="gavel" label="Vara/Tribunal" value={event.vara} theme={theme} />
                  <DetailItem icon="comment-text-outline" label="Observações Proc." value={event.observacoes} theme={theme} />
              </Card>
          )}

           {(event.presencaObrigatoria !== undefined || event.lembretes !== undefined) && (
              <Card containerStyle={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                  <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}><Text>Configurações</Text></Card.Title>
                  <Card.Divider color={theme.colors.border}/>
                  {event.presencaObrigatoria !== undefined && <DetailItem icon={event.presencaObrigatoria ? "account-check-outline" : "account-off-outline"} label="Presença Obrigatória" value={event.presencaObrigatoria} theme={theme} />}
                  {event.lembretes !== undefined && <DetailItem icon={event.lembretes ? "bell-check-outline" : "bell-off-outline"} label="Lembretes" value={event.lembretes ? 'Ativados' : 'Desativados'} theme={theme} />}
              </Card>
           )}
        </View>
      </ScrollView>

      <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || 10, backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <Button
            onPress={handleDelete}
            icon={<Icon name="delete-outline" type="material-community" color={theme.colors.error} size={24} />}
            type="outline"
            buttonStyle={[styles.actionButton, { borderColor: theme.colors.error }]}
            titleStyle={[styles.actionButtonTitle, { color: theme.colors.error }]}
            containerStyle={styles.actionButtonWrapper}
            title="Excluir"
          />
          <Button
            onPress={handleShare}
            icon={<Icon name="share-variant-outline" type="material-community" color={theme.colors.primary} size={24} />}
            type="outline"
            buttonStyle={[styles.actionButton, { borderColor: theme.colors.primary }]}
            titleStyle={[styles.actionButtonTitle, { color: theme.colors.primary }]}
            containerStyle={styles.actionButtonWrapper}
            title="Compart."
          />
          <Button
            onPress={handleEdit}
            icon={<Icon name="pencil-outline" type="material-community" color={componentColors.white} size={24} />}
            buttonStyle={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            titleStyle={[styles.actionButtonTitle, { color: componentColors.white }]}
            containerStyle={styles.actionButtonWrapper}
            title="Editar"
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  bodyContainer: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'left',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  customHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  detailItemContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 14,
  },
  detailItemIcon: {
    marginRight: 14,
    marginTop: 3,
  },
  detailItemLabel: {
    fontSize: 13,
    marginBottom: 3,
    opacity: 0.8,
  },
  detailItemTextContainer: {
    flex: 1,
  },
  detailItemValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  fixedButtonContainer: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    right: 0,
  },
  flexContainer: {
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.9,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 16,
    padding: 16,
  },
  priorityBadge: {
    height: 25,
    paddingHorizontal: 10,
  },
  priorityBadgeText: {
    color: componentColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
});

export default EventViewScreen;
