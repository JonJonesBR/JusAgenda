// HomeScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Dimensions } from 'react-native';
import { FAB, Card, Icon, Button, Text } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateTime, isToday } from '../utils/dateUtils';

const { width, height } = Dimensions.get('window');

const ALERT_MESSAGES = {
  DELETE_CONFIRM: {
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este compromisso?',
  },
  DELETE_ERROR: {
    title: 'Erro',
    message: 'Não foi possível excluir o compromisso',
  },
  OPTIONS: {
    title: 'Opções',
    message: 'O que você deseja fazer?',
  },
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { refreshEvents, events, deleteEvent } = useEvents();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) refreshEvents();
  }, [isFocused, refreshEvents]);

  const getCurrentTime = useCallback(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  // Função para garantir que a data seja serializável
  const serializeEvent = (event) => ({
    ...event,
    date: event.date instanceof Date ? event.date.toISOString() : event.date,
  });

  const handleEventAction = useCallback((event, action) => {
    switch (action) {
      case 'view':
        navigation.navigate('EventView', { event: serializeEvent(event) });
        break;
      case 'edit':
        navigation.navigate('EventDetails', { event: serializeEvent(event) });
        break;
      case 'delete':
        confirmDelete(event);
        break;
      default:
        break;
    }
  }, [navigation]);

  const handleEventPress = useCallback((event) => {
    Alert.alert(
      ALERT_MESSAGES.OPTIONS.title,
      ALERT_MESSAGES.OPTIONS.message,
      [
        { text: 'Visualizar', onPress: () => handleEventAction(event, 'view') },
        { text: 'Editar', onPress: () => handleEventAction(event, 'edit') },
        { text: 'Excluir', style: 'destructive', onPress: () => handleEventAction(event, 'delete') },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [handleEventAction]);

  const confirmDelete = useCallback((event) => {
    Alert.alert(
      ALERT_MESSAGES.DELETE_CONFIRM.title,
      ALERT_MESSAGES.DELETE_CONFIRM.message,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              refreshEvents();
            } catch (error) {
              Alert.alert(ALERT_MESSAGES.DELETE_ERROR.title, ALERT_MESSAGES.DELETE_ERROR.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [deleteEvent, refreshEvents]);

  const handleExport = useCallback(() => {
    navigation.navigate('Export');
  }, [navigation]);

  const todayEvents = useMemo(() => 
    events.filter(event => isToday(new Date(event.date))),
    [events]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <LinearGradient colors={['#6200ee', '#9747FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getCurrentTime()}</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo ao JusAgenda</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: height * 0.1 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Compromissos de Hoje</Text>
          {todayEvents.length > 0 ? (
            todayEvents.map((event) => (
              <TouchableOpacity key={event.id} onPress={() => handleEventPress(event)}>
                <Card containerStyle={styles.card}>
                  <View style={styles.cardHeader}>
                    <Icon name="event" size={28} color="#6200ee" />
                    <Text style={styles.eventType}>
                      {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.title}>{event.title}</Text>
                  <View style={styles.dateContainer}>
                    <Icon name="calendar-today" size={20} color="#757575" />
                    <Text style={styles.date}>{formatDateTime(event.date)}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>Nenhum compromisso para hoje.</Text>
          )}
        </View>
        <View style={[styles.section, { marginTop: -16 }]}>
          <Text style={styles.sectionTitle}>📌 Próximos Compromissos</Text>
          <UpcomingEvents onEventPress={handleEventPress} />
        </View>
        <View style={styles.exportContainer}>
          <Button title="📤 Exportar Compromissos" onPress={handleExport} color="#6200ee" />
        </View>
      </ScrollView>
      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#6200ee"
        placement="right"
        style={styles.fab}
        onPress={() => navigation.navigate('EventDetails')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  header: { paddingTop: StatusBar.currentHeight || 24, paddingBottom: 16 },
  headerContent: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { color: '#fff', opacity: 0.9, fontSize: 18, textAlign: 'center' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 12 },
  card: { marginBottom: 16, padding: 20, borderRadius: 12, elevation: 4, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  eventType: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#6200ee' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  date: { fontSize: 16, marginLeft: 6, color: '#757575' },
  noEventsText: { textAlign: 'center', fontSize: 16, color: '#757575' },
  exportContainer: { margin: 20 },
  fab: { position: 'absolute', bottom: 16, right: 16 },
});

export default HomeScreen;
