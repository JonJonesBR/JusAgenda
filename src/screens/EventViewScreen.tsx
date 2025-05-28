// src/screens/EventViewScreen.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, Theme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType, EventContact, Reminder } from '../types/event';
import { HomeStackParamList } from '../navigation/stacks/HomeStack'; // Ajuste para a sua Stack Param List
import {
  formatDate,
  formatTime,
  formatDisplayDate,
  formatDateTime,
  parseISO,
  isDateValid,
} from '../utils/dateUtils';
import { Header, Card, Button, Section } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, getEventTypeLabel, getEventStatusLabel, PRIORIDADE_LABELS, REMINDER_OPTIONS } from '../constants';

// Tipagem para os parâmetros da rota
type EventViewScreenRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.EVENT_VIEW>;
// Tipagem para a prop de navegação
type EventViewScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.EVENT_VIEW>;

// Componente auxiliar para renderizar cada item de detalhe
const DetailItemView: React.FC<{
  label: string;
  value?: string | number | boolean | React.ReactNode;
  theme: Theme;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap; // Nome do ícone MaterialCommunityIcons
  fullWidthValue?: boolean;
  valueStyle?: object;
}> = ({ label, value, theme, iconName, fullWidthValue = false, valueStyle }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return null; // Não renderiza se o valor for nulo, indefinido ou string vazia
  }

  let displayValue: React.ReactNode;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  } else {
    displayValue = value;
  }

  return (
    <View style={styles.detailItemContainer}>
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={theme.colors.primary}
          style={styles.detailItemIcon}
        />
      )}
      <Text style={[styles.detailLabel, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        {label}:
      </Text>
      <View style={fullWidthValue ? styles.detailValueFullWidth : styles.detailValue}>
        {typeof displayValue === 'string' || typeof displayValue === 'number' ? (
          <Text style={[styles.detailValueText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }, valueStyle]}>
            {displayValue}
          </Text>
        ) : (
          displayValue // Se for um ReactNode (ex: lista de contactos)
        )}
      </View>
    </View>
  );
};


const EventViewScreen: React.FC = () => {
  const { theme } = useTheme();
  const { getEventById, deleteEvent } = useEvents();
  const navigation = useNavigation<EventViewScreenNavigationProp>();
  const route = useRoute<EventViewScreenRouteProp>();

  const eventId = route.params?.eventId;
  const eventFromParams = route.params?.event; // Se o evento completo for passado

  // Tenta obter o evento dos parâmetros da rota ou do contexto
  const event = useMemo(() => {
    if (eventFromParams) return eventFromParams as EventType; // Confia no tipo se passado
    if (eventId) return getEventById(eventId);
    return null;
  }, [eventId, eventFromParams, getEventById]);


  useEffect(() => {
    if (event) {
      navigation.setOptions({ headerTitle: event.title || 'Detalhes do Evento' });
    } else if (!event && eventId) {
      // Se o evento não foi encontrado pelo ID (ex: após uma atualização de contexto)
      // Pode ser que o evento tenha sido deletado ou o ID é inválido.
      // Não definir título aqui, o Header fará isso.
      // A lógica abaixo (no return) tratará o caso de evento não encontrado.
    }
  }, [navigation, event, eventId]);

  const handleEdit = () => {
    if (event) {
      navigation.navigate(ROUTES.EVENT_DETAILS, { eventId: event.id });
    }
  };

  const handleDelete = () => {
    if (!event) return;
    Alert.alert(
      'Confirmar Exclusão',
      `Tem a certeza que deseja apagar o evento "${event.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            const success = deleteEvent(event.id);
            if (success) {
              Toast.show({ type: 'success', text1: 'Evento Apagado', text2: `"${event.title}" foi removido.` });
              navigation.goBack();
            } else {
              Toast.show({ type: 'error', text1: 'Erro ao Apagar', text2: 'Não foi possível apagar o evento.' });
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      const eventDateObj = event.data ? parseISO(event.data) : null;
      const displayDate = eventDateObj && isDateValid(eventDateObj) ? formatDisplayDate(eventDateObj) : 'N/D';
      const displayTime = event.hora || (event.isAllDay ? 'Dia Todo' : '');

      let message = `Evento: ${event.title}\n`;
      message += `Data: ${displayDate}${displayTime ? ` às ${displayTime}` : ''}\n`;
      if (event.local) message += `Local: ${event.local}\n`;
      if (event.description) message += `Descrição: ${event.description}\n`;
      // Adicionar mais detalhes se desejar

      const result = await Share.share({
        message,
        title: `Detalhes do Evento: ${event.title}`, // Título para algumas plataformas de partilha
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Partilhado com sucesso via activityType
          console.log(`Evento partilhado via: ${result.activityType}`);
        } else {
          // Partilhado com sucesso
          console.log('Evento partilhado.');
        }
      } else if (result.action === Share.dismissedAction) {
        // Descartado (iOS)
        console.log('Partilha de evento descartada.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro ao Partilhar', `Não foi possível partilhar o evento: ${errorMessage}`);
    }
  };


  if (!event) {
    // Se eventId foi passado mas o evento não foi encontrado
    if (eventId && !eventFromParams) { // Evita mostrar se estava a tentar carregar de params e falhou
        return (
            <View style={[styles.centeredMessageContainer, { backgroundColor: theme.colors.background }]}>
                <Header title="Evento Não Encontrado" onBackPress={() => navigation.goBack()} />
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={[styles.messageText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
                    O evento solicitado não foi encontrado ou pode ter sido removido.
                </Text>
                <Button title="Voltar" onPress={() => navigation.goBack()} type="outline" />
            </View>
        );
    }
    // Se nenhum ID ou evento foi passado, ou se está a carregar (pouco provável aqui sem um estado de loading local)
    return (
      <View style={[styles.centeredMessageContainer, { backgroundColor: theme.colors.background }]}>
        <Header title="Detalhes do Evento" onBackPress={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.messageText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
          A carregar detalhes do evento...
        </Text>
      </View>
    );
  }

  const eventDateObj = event.data ? parseISO(event.data) : null;
  const displayFullDateTime = eventDateObj && isDateValid(eventDateObj)
    ? formatDateTime(
        event.hora ? combineDateTime(eventDateObj, event.hora) : eventDateObj,
        `EEEE, dd 'de' MMMM 'de' yyyy${event.hora && !event.isAllDay ? " 'às' HH:mm" : ""}`
      )
    : 'Data/Hora inválida';

  const formatDisplayReminders = (reminders?: Reminder[]): string => {
    if (!reminders || reminders.length === 0) return 'Nenhum';
    return reminders
      .map(rValue => REMINDER_OPTIONS.find(opt => opt.value === rValue)?.label || `${rValue} min`)
      .join('; ');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title={event.title} // O título já deve estar definido pelo useEffect
        onBackPress={() => navigation.goBack()}
        // rightComponent={ // Exemplo de como adicionar um botão de partilha no header
        //   <TouchableOpacity onPress={handleShare} style={{ paddingHorizontal: theme.spacing.md }}>
        //     <MaterialCommunityIcons name="share-variant-outline" size={24} color={theme.colors.primary} />
        //   </TouchableOpacity>
        // }
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <DetailItemView
            label="Quando"
            value={event.isAllDay ? `${formatDisplayDate(eventDateObj)} (Dia Todo)` : displayFullDateTime}
            theme={theme}
            iconName="calendar-clock"
            fullWidthValue
            valueStyle={{ fontWeight: 'bold', fontSize: theme.typography.fontSize.md }}
          />
          {event.local && <DetailItemView label="Local" value={event.local} theme={theme} iconName="map-marker-outline" fullWidthValue />}
          {event.eventType && <DetailItemView label="Tipo" value={getEventTypeLabel(event.eventType)} theme={theme} iconName="tag-outline" />}
          {event.status && <DetailItemView label="Status" value={getEventStatusLabel(event.status)} theme={theme} iconName="list-status" />}
          {event.prioridade && <DetailItemView label="Prioridade" value={PRIORIDADE_LABELS[event.prioridade] || event.prioridade} theme={theme} iconName="priority-high" />}
          {event.cor && <DetailItemView label="Cor" value={event.cor} theme={theme} iconName="palette-outline" />}
        </Card>

        {(event.description || (event.reminders && event.reminders.length > 0)) && (
          <Card style={styles.card}>
            <Section title="Observações e Lembretes" theme={theme} noHorizontalPadding noVerticalPadding>
              {event.description && <DetailItemView label="Descrição" value={event.description} theme={theme} iconName="text-long" fullWidthValue />}
              {(event.reminders && event.reminders.length > 0) && (
                <DetailItemView label="Lembretes" value={formatDisplayReminders(event.reminders)} theme={theme} iconName="bell-ring-outline" fullWidthValue />
              )}
            </Section>
          </Card>
        )}


        {(event.numeroProcesso || event.vara || event.comarca) && (
          <Card style={styles.card}>
            <Section title="Detalhes do Processo" theme={theme} noHorizontalPadding noVerticalPadding>
              {event.numeroProcesso && <DetailItemView label="Nº Processo" value={event.numeroProcesso} theme={theme} iconName="gavel" />}
              {event.vara && <DetailItemView label="Vara/Tribunal" value={event.vara} theme={theme} iconName="bank-outline" />}
              {event.comarca && <DetailItemView label="Comarca" value={event.comarca} theme={theme} iconName="map-legend" />}
              {event.instancia && <DetailItemView label="Instância" value={event.instancia} theme={theme} iconName="layers-outline" />}
              {event.naturezaAcao && <DetailItemView label="Natureza da Ação" value={event.naturezaAcao} theme={theme} iconName="scale-balance" />}
              {event.faseProcessual && <DetailItemView label="Fase Processual" value={event.faseProcessual} theme={theme} iconName="progress-check" />}
              {event.linkProcesso && <DetailItemView label="Link do Processo" value={event.linkProcesso} theme={theme} iconName="link-variant" fullWidthValue />}
            </Section>
          </Card>
        )}

        {event.clienteNome && (
          <Card style={styles.card}>
            <Section title="Cliente Associado" theme={theme} noHorizontalPadding noVerticalPadding>
                <DetailItemView label="Nome" value={event.clienteNome} theme={theme} iconName="account-tie-outline" />
            </Section>
          </Card>
        )}

        {event.contacts && event.contacts.length > 0 && (
          <Card style={styles.card}>
            <Section title="Outros Contactos" theme={theme} noHorizontalPadding noVerticalPadding>
              {event.contacts.map((contact, index) => (
                <View key={contact.id || index} style={styles.contactDetailItem}>
                  <Text style={[styles.contactName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                    {contact.name} {contact.role ? `(${contact.role})` : ''}
                  </Text>
                  {contact.phone && <DetailItemView label="Telefone" value={contact.phone} theme={theme} iconName="phone-outline" />}
                  {contact.email && <DetailItemView label="Email" value={contact.email} theme={theme} iconName="email-outline" />}
                </View>
              ))}
            </Section>
          </Card>
        )}

        <View style={styles.actionsContainer}>
          <Button
            title="Editar"
            onPress={handleEdit}
            type="outline"
            icon="pencil-outline"
            buttonStyle={styles.actionButton}
          />
          <Button
            title="Partilhar"
            onPress={handleShare}
            type="clear"
            icon="share-variant-outline"
            buttonStyle={styles.actionButton}
            titleStyle={{color: theme.colors.primary}} // Para botões 'clear'
          />
          <Button
            title="Apagar"
            onPress={handleDelete}
            type="clear" // Ou 'outline' com cor de erro
            icon="delete-outline"
            buttonStyle={styles.actionButton}
            titleStyle={{ color: theme.colors.error }}
            iconColor={theme.colors.error}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 8, // Usar theme.spacing.sm
    paddingHorizontal: 16, // Usar theme.spacing.md
  },
  card: {
    marginBottom: 16, // Usar theme.spacing.md
  },
  detailItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Alinha ícone e texto no topo
    paddingVertical: 6, // Usar theme.spacing.xs
    // borderBottomWidth: StyleSheet.hairlineWidth, // Opcional, dentro do Card
    // borderBottomColor: // theme.colors.border,
  },
  detailItemIcon: {
    marginRight: 10, // Usar theme.spacing.sm
    marginTop: Platform.OS === 'ios' ? 1 : 3, // Ajuste fino de alinhamento vertical do ícone
  },
  detailLabel: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    marginRight: 6, // Usar theme.spacing.xs
    // Cor e fontFamily são dinâmicas
    minWidth: 80, // Largura mínima para o rótulo
  },
  detailValue: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  detailValueFullWidth: {
    flex: 1, // Ocupa o espaço restante
    alignItems: 'flex-start',
  },
  detailValueText: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    textAlign: 'left',
    // Cor e fontFamily são dinâmicas
  },
  contactDetailItem: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: theme.colors.border, // Aplicar no Card ou Section
  },
  contactName: {
    fontSize: 15,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16, // Usar theme.spacing.md
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: theme.colors.border, // Aplicar no Card ou Section
    marginTop: 8, // Usar theme.spacing.sm
  },
  actionButton: {
    flex: 1, // Para que os botões dividam o espaço
    marginHorizontal: 4, // Usar theme.spacing.xs
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Usar theme.spacing.lg
  },
  messageText: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    textAlign: 'center',
    marginTop: 16, // Usar theme.spacing.md
    marginBottom: 20, // Usar theme.spacing.lg
  },
});

export default EventViewScreen;
