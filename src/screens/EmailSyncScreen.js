import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Text, Button, CheckBox, Card, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import EmailService from '../services/EmailService';
import { COLORS } from '../utils/common';
import { formatDateTime } from '../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_STORAGE_KEY = '@jusagenda_email';

const EmailSyncScreen = () => {
  const navigation = useNavigation();
  const { events } = useEvents();
  const [email, setEmail] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Busca o email salvo quando a tela é carregada
  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
      }

      const available = await EmailService.isAvailable();
      setIsEmailAvailable(available);
      if (!available) {
        Alert.alert(
          'Aviso',
          'Não foi possível encontrar um aplicativo de email configurado no seu dispositivo. Algumas funcionalidades podem estar limitadas.'
        );
      }
    })();
  }, []);

  // Salva o email quando ele muda
  const handleEmailChange = (text) => {
    setEmail(text);
    AsyncStorage.setItem(EMAIL_STORAGE_KEY, text);
  };

  // Alterna a seleção de um evento
  const toggleEventSelection = (eventId) => {
    setSelectedEvents(current => {
      return current.includes(eventId)
        ? current.filter(id => id !== eventId)
        : [...current, eventId];
    });
  };

  // Seleciona todos os eventos
  const selectAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event.id));
    }
  };

  // Envia os eventos selecionados por email
  const handleSyncEvents = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    if (selectedEvents.length === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um compromisso para sincronizar.');
      return;
    }

    setIsLoading(true);
    try {
      const eventsToSync = events.filter(event => selectedEvents.includes(event.id));
      const result = await EmailService.syncEventsViaEmail(eventsToSync, email);
      
      if (result.success) {
        Alert.alert(
          'Sincronização Bem-Sucedida',
          'Os compromissos foram enviados para o seu email com sucesso!'
        );
        setSelectedEvents([]);
      } else {
        Alert.alert(
          'Erro na Sincronização',
          'Não foi possível enviar o email. Por favor, tente novamente.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao sincronizar os compromissos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Configura alertas de email para um evento
  const configureEmailAlert = async (eventId) => {
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    Alert.prompt(
      'Configurar Alerta por Email',
      'Quantos minutos antes do compromisso você deseja receber o alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Configurar',
          onPress: async (minutesBefore) => {
            if (isNaN(minutesBefore) || minutesBefore <= 0) {
              Alert.alert('Erro', 'Por favor, insira um número válido maior que zero.');
              return;
            }

            try {
              setIsLoading(true);
              const result = await EmailService.configureEmailAlert(
                event, 
                email, 
                parseInt(minutesBefore, 10)
              );
              
              if (result.success) {
                Alert.alert('Sucesso', result.message);
              } else {
                Alert.alert('Erro', result.error || 'Não foi possível configurar o alerta.');
              }
            } catch (error) {
              Alert.alert('Erro', error.message || 'Ocorreu um erro ao configurar o alerta.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ],
      'plain-text',
      '30'
    );
  };

  // Valida o formato do email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <View style={styles.container}>
      <Card containerStyle={styles.emailCard}>
        <Text style={styles.title}>Sincronização com Email</Text>
        <TextInput
          style={styles.emailInput}
          placeholder="Digite seu email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>

      <View style={styles.selectionHeader}>
        <Text style={styles.sectionTitle}>Selecione os Compromissos</Text>
        <Button
          title={selectedEvents.length === events.length ? "Desmarcar Todos" : "Selecionar Todos"}
          type="clear"
          onPress={selectAllEvents}
        />
      </View>

      <ScrollView style={styles.eventsList}>
        {events.length > 0 ? (
          events.map(event => (
            <Card key={event.id} containerStyle={styles.eventCard}>
              <View style={styles.eventHeader}>
                <CheckBox
                  checked={selectedEvents.includes(event.id)}
                  onPress={() => toggleEventSelection(event.id)}
                  containerStyle={styles.checkbox}
                />
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
              <Text style={styles.eventDate}>{formatDateTime(event.date)}</Text>
              <View style={styles.eventActions}>
                <TouchableOpacity 
                  style={styles.alertButton}
                  onPress={() => configureEmailAlert(event.id)}
                  disabled={!isEmailAvailable}
                >
                  <Icon name="email" size={20} color={isEmailAvailable ? COLORS.primary : "#aaa"} />
                  <Text style={{
                    color: isEmailAvailable ? COLORS.primary : "#aaa",
                    marginLeft: 5
                  }}>
                    Configurar Alerta
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.noEventsText}>Nenhum compromisso encontrado.</Text>
        )}
      </ScrollView>

      <Button
        title="Sincronizar Compromissos"
        containerStyle={styles.syncButtonContainer}
        buttonStyle={styles.syncButton}
        disabled={!isEmailAvailable || isLoading || selectedEvents.length === 0}
        loading={isLoading}
        onPress={handleSyncEvents}
        icon={{ name: 'sync', color: 'white', type: 'material' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emailCard: {
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.primary,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    padding: 0,
    margin: 0,
    marginRight: 5,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: COLORS.textPrimary,
  },
  eventDate: {
    fontSize: 14,
    marginVertical: 5,
    color: COLORS.textSecondary,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  noEventsText: {
    textAlign: 'center',
    margin: 30,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  syncButtonContainer: {
    margin: 15,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
  },
});

export default EmailSyncScreen; 