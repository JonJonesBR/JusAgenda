// src/screens/EmailSyncScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import _ from 'lodash'; // Para isNil, isEmpty

import { useTheme, Theme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType } from '../types/event';
import { SyncStackParamList } from '../navigation/stacks/SyncStack'; // Ajuste para a sua Stack Param List
import { Header, Input, Button, Card, List, InputDialog } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, STORAGE_KEYS, getEventTypeLabel, REMINDER_OPTIONS } from '../constants';
import * as EmailService from '../services/EmailService';
import { formatDate, formatTime, parseISO, combineDateTime } from '../utils/dateUtils';

// Tipagem para a prop de navegação
type EmailSyncScreenNavigationProp = StackNavigationProp<SyncStackParamList, typeof ROUTES.EMAIL_SYNC>;

interface SelectableEvent extends EventType {
  isSelected?: boolean;
}

const EmailSyncScreen: React.FC = () => {
  const { theme } = useTheme();
  const { events: allEvents, isLoading: isLoadingEvents } = useEvents();
  const navigation = useNavigation<EmailSyncScreenNavigationProp>();

  const [email, setEmail] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>(''); // Para o InputDialog
  const [isEmailDialogVisible, setIsEmailDialogVisible] = useState<boolean>(false);
  const [isEmailClientAvailable, setIsEmailClientAvailable] = useState<boolean>(false);

  const [selectableEvents, setSelectableEvents] = useState<SelectableEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configuringAlertEventId, setConfiguringAlertEventId] = useState<string | null>(null); // ID do evento para o qual se configura alerta
  const [alertTimeDialogVisible, setAlertTimeDialogVisible] = useState<boolean>(false);
  const [alertMinutesInput, setAlertMinutesInput] = useState<string>('15'); // Valor padrão para o diálogo de minutos

  const loadStoredEmail = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL_FOR_NOTIFICATIONS);
      const emailAvailable = await EmailService.isEmailClientAvailable();
      setEmail(storedEmail || '');
      setTempEmail(storedEmail || '');
      setIsEmailClientAvailable(emailAvailable);
    } catch (error) {
      console.error("EmailSyncScreen: Erro ao carregar email:", error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar o email salvo.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredEmail();
  }, [loadStoredEmail]);

  useEffect(() => {
    // Atualiza selectableEvents quando allEvents muda
    setSelectableEvents(
      allEvents
        .filter(event => event.data && parseISO(event.data) >= new Date()) // Apenas eventos futuros
        .sort((a,b) => parseISO(a.data).getTime() - parseISO(b.data).getTime()) // Ordena por data
        .map(event => ({ ...event, isSelected: selectedEventIds.has(event.id) }))
    );
  }, [allEvents, selectedEventIds]);


  const handleSaveEmail = async (newEmail: string) => {
    if (EmailService.isValidEmail(newEmail)) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL_FOR_NOTIFICATIONS, newEmail);
        setEmail(newEmail);
        setIsEmailDialogVisible(false);
        Toast.show({ type: 'success', text1: 'Email Salvo', text2: 'Email para alertas/sincronização atualizado.' });
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: 'Não foi possível salvar o email.' });
      }
    } else {
      Toast.show({ type: 'error', text1: 'Email Inválido', text2: 'Por favor, insira um email válido.' });
    }
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

  const toggleSelectAll = () => {
    if (selectedEventIds.size === selectableEvents.length) {
      setSelectedEventIds(new Set()); // Desmarcar todos
    } else {
      setSelectedEventIds(new Set(selectableEvents.map(e => e.id))); // Marcar todos
    }
  };

  const handleSyncSelectedEvents = () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Email Necessário', text2: 'Configure um email antes de sincronizar.' });
      return;
    }
    if (selectedEventIds.size === 0) {
      Toast.show({ type: 'info', text1: 'Nenhum Evento', text2: 'Selecione eventos para sincronizar.' });
      return;
    }
    const eventsToSync = allEvents.filter(e => selectedEventIds.has(e.id));
    // Lógica de sincronização (ex: enviar para API, gerar iCal e enviar por email)
    console.log('Sincronizar eventos:', eventsToSync, 'para o email:', email);
    Toast.show({ type: 'success', text1: 'Sincronização Iniciada', text2: `${eventsToSync.length} eventos enviados para ${email}.` });
    // Placeholder:
    Alert.alert('Sincronização (Placeholder)', `A sincronização de ${eventsToSync.length} eventos para ${email} seria iniciada aqui.`);
  };

  const openAlertTimeDialog = (eventId: string) => {
    if (!email) {
        Toast.show({ type: 'error', text1: 'Email Necessário', text2: 'Configure um email para definir alertas.' });
        return;
    }
    setConfiguringAlertEventId(eventId);
    setAlertMinutesInput('15'); // Reset para valor padrão
    setAlertTimeDialogVisible(true);
  };

  const handleConfirmAlertTime = () => {
    if (!configuringAlertEventId || !email) return;
    const minutes = parseInt(alertMinutesInput, 10);
    if (isNaN(minutes) || minutes < 0) {
        Toast.show({type: 'error', text1: 'Valor Inválido', text2: 'Insira um número válido de minutos.'});
        return;
    }
    const eventToAlert = allEvents.find(e => e.id === configuringAlertEventId);
    if (eventToAlert) {
        // Aqui você chamaria o serviço para agendar o alerta por email no backend
        // ou usaria o EmailService.configureEmailAlert se ele fizesse o agendamento local (o que não faz)
        // Por agora, EmailService.configureEmailAlert é um placeholder.
        const result = EmailService.configureEmailAlert(eventToAlert, email, minutes);
        if (result.success) {
            Toast.show({type: 'success', text1: 'Alerta Configurado (Simulação)', text2: `Alerta para "${eventToAlert.title}" ${minutes} min antes.`});
        } else {
            Toast.show({type: 'error', text1: 'Falha ao Configurar Alerta', text2: result.error});
        }
    }
    setAlertTimeDialogVisible(false);
    setConfiguringAlertEventId(null);
  };


  const renderSelectableEventItem = ({ item }: { item: SelectableEvent }) => (
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
          {item.local && <Text style={[styles.eventDetail, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>Local: {item.local}</Text>}
        </View>
        {!isReadOnly && ( // Assumindo que isReadOnly pode ser uma prop futura
            <Button
                title="Alerta Email"
                onPress={() => openAlertTimeDialog(item.id)}
                type="clear"
                size="sm"
                icon="email-alert-outline"
                titleStyle={{fontSize: 12, color: theme.colors.primary}}
                disabled={!email}
            />
        )}
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Sincronização com Email" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="Configuração de Email" theme={theme} style={styles.sectionStyle}>
          <Text style={[styles.infoText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
            Configure o seu email para receber alertas de eventos ou para sincronizar a sua agenda.
          </Text>
          <Card style={styles.emailCard}>
            <View style={styles.emailDisplayRow}>
              <MaterialCommunityIcons name="email-outline" size={24} color={theme.colors.primary} style={styles.iconStyle} />
              <Text style={[styles.emailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
                {email || 'Nenhum email configurado'}
              </Text>
            </View>
            <Button
              title={email ? "Alterar Email" : "Configurar Email"}
              onPress={() => { setTempEmail(email); setIsEmailDialogVisible(true); }}
              type={email ? "outline" : "solid"}
              icon={email ? "email-edit-outline" : "email-plus-outline"}
              disabled={!isEmailClientAvailable && !email} // Permite configurar mesmo sem cliente, mas avisa
            />
            {!isEmailClientAvailable && (
                <Text style={[styles.warningText, {color: theme.colors.warning, fontFamily: theme.typography.fontFamily.regular}]}>
                    Nenhum cliente de email encontrado no dispositivo. A funcionalidade de envio direto pode ser limitada.
                </Text>
            )}
          </Card>
        </Section>

        <Section title="Selecionar Eventos para Sincronizar/Alertar" theme={theme} style={styles.sectionStyle}>
          {isLoadingEvents ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : selectableEvents.length === 0 ? (
            <Text style={[styles.infoText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center' }]}>
              Nenhum evento futuro para selecionar.
            </Text>
          ) : (
            <>
              <View style={styles.selectAllRow}>
                <Button
                  title={selectedEventIds.size === selectableEvents.length ? "Desmarcar Todos" : "Marcar Todos"}
                  onPress={toggleSelectAll}
                  type="clear"
                  size="sm"
                  icon={selectedEventIds.size === selectableEvents.length ? "checkbox-multiple-marked-outline" : "checkbox-multiple-blank-outline"}
                />
              </View>
              <List<SelectableEvent> // Usando o componente List genérico
                data={selectableEvents}
                renderItem={renderSelectableEventItem}
                keyExtractor={(item) => item.id}
                // contentContainerStyle={{paddingHorizontal: 0}} // Remover padding do List se Card já tem
              />
            </>
          )}
        </Section>

        <Button
          title="Sincronizar Eventos Selecionados"
          onPress={handleSyncSelectedEvents}
          type="solid"
          icon="sync"
          disabled={selectedEventIds.size === 0 || !email}
          buttonStyle={{ marginVertical: theme.spacing.lg }}
        />
      </ScrollView>

      <InputDialog
        visible={isEmailDialogVisible}
        title="Configurar Email"
        message="Insira o seu endereço de email."
        initialValue={tempEmail}
        placeholder="seuemail@exemplo.com"
        confirmText="Salvar"
        cancelText="Cancelar"
        onConfirm={handleSaveEmail}
        onCancel={() => setIsEmailDialogVisible(false)}
        textInputProps={{ keyboardType: 'email-address', autoCapitalize: 'none' }}
      />
      <InputDialog
        visible={alertTimeDialogVisible}
        title="Definir Alerta por Email"
        message="Quantos minutos antes do evento deseja ser alertado?"
        initialValue={alertMinutesInput}
        placeholder="Ex: 15 (para 15 minutos)"
        confirmText="Confirmar Alerta"
        cancelText="Cancelar"
        onConfirm={handleConfirmAlertTime}
        onCancel={() => setAlertTimeDialogVisible(false)}
        textInputProps={{ keyboardType: 'number-pad' }}
      />
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
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingBottom: 30,
  },
  sectionStyle: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    marginBottom: 12, // Usar theme.spacing.sm
    lineHeight: 20, // Usar theme.typography.lineHeight.normal
  },
  emailCard: {
    padding: 16, // Usar theme.spacing.md
  },
  emailDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Usar theme.spacing.sm
  },
  iconStyle: {
    marginRight: 12, // Usar theme.spacing.sm
  },
  emailText: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    flexShrink: 1,
  },
  warningText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8, // Usar theme.spacing.sm
  },
  eventItemCard: {
    marginBottom: 8, // Usar theme.spacing.sm
    // padding: 0, // O Card já tem padding, mas o conteúdo interno pode precisar de ajuste
  },
  eventItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // Usar theme.spacing.sm
  },
  checkboxIcon: {
    marginRight: 12, // Usar theme.spacing.sm
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    marginBottom: 2,
  },
  eventDateTime: {
    fontSize: 13, // Usar theme.typography.fontSize.xs
  },
  eventDetail: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default EmailSyncScreen;
