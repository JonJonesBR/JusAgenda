import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Text, Button, StatusBar, Dimensions, Alert } from 'react-native';
import { FAB, Card, Icon } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';
import ExportService from '../services/ExportService';
import { formatDateTime, isToday } from '../utils/dateUtils';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { refreshEvents, events } = useEvents();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) refreshEvents();
  }, [isFocused, refreshEvents]);

  const getCurrentTime = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleEventPress = (event) => {
    Alert.alert(
      'Opções',
      'O que você deseja fazer?',
      [
        {
          text: 'Visualizar',
          onPress: () => navigation.navigate('EventView', { event }),
        },
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EventDetails', { event }),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleExport = () => {
    navigation.navigate('Export');
  };

  const today = isToday(new Date());
  const todayEvents = events.filter((event) =>
    isToday(new Date(event.date))
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
                    <Text style={styles.date}>
                      {formatDateTime(event.date)}
                    </Text>
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
          <Button
            title="📤 Exportar Compromissos"
            onPress={handleExport}
            color="#6200ee"
          />
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