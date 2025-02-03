import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Text, Button, StatusBar } from 'react-native';
import { FAB, Card, Icon } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';
import { exportToExcel, exportToPDF, exportToWord, shareFile } from '../services/ExportService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { refreshEvents, events } = useEvents();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      refreshEvents();
    }
  }, [isFocused, refreshEvents]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { event });
  };

  const handleExport = async (format) => {
    try {
      let filePath;
      if (format === 'Excel') filePath = await exportToExcel(events);
      if (format === 'PDF') filePath = await exportToPDF(events);
      if (format === 'Word') filePath = await exportToWord(events);
      if (filePath) await shareFile(filePath);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setModalVisible(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR');
  const todayCompromissos = events.filter(
    (compromisso) =>
      new Date(compromisso.date).toLocaleDateString('pt-BR') === today
  );

  return (
    <View style={styles.container}>
      {/* StatusBar e Cabeçalho */}
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <LinearGradient colors={['#6200ee', '#9747FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getCurrentTime()}</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo ao JusAgenda</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Compromissos de Hoje */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Compromissos de Hoje</Text>
          {todayCompromissos.length > 0 ? (
            todayCompromissos.map((compromisso) => (
              <TouchableOpacity key={compromisso.id} onPress={() => handleEventPress(compromisso)}>
                <Card containerStyle={styles.card}>
                  <View style={styles.cardHeader}>
                    <Icon name="event" size={24} color="#6200ee" />
                    <Text style={styles.eventType}>
                      {compromisso.type?.charAt(0).toUpperCase() + compromisso.type?.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.title}>
                    <Text style={{ fontWeight: 'bold' }}>{compromisso.title}</Text>
                  </Text>
                  <View style={styles.dateContainer}>
                    <Icon name="calendar-today" size={16} color="#757575" />
                    <Text style={styles.date}>{new Date(compromisso.date).toLocaleString('pt-BR')}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>Nenhum compromisso para hoje.</Text>
          )}
        </View>

        {/* Próximos Compromissos */}
        <View style={[styles.section, { marginTop: -32 }]}>
          <Text style={styles.sectionTitle}>Próximos Compromissos</Text>
          <UpcomingEvents onEventPress={handleEventPress} />
        </View>

        {/* Botão para Exportação */}
        <View style={styles.section}>
          <Button title="Exportar Compromissos" onPress={() => setModalVisible(true)} color="#6200ee" />
        </View>
      </ScrollView>

      {/* Modal para Escolha de Exportação */}
      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Escolha o formato de exportação</Text>
            <Button title="Exportar para Excel" onPress={() => handleExport('Excel')} color="#6200ee" />
            <Button title="Exportar para PDF" onPress={() => handleExport('PDF')} color="#6200ee" />
            <Button title="Exportar para Word" onPress={() => handleExport('Word')} color="#6200ee" />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#999" />
          </View>
        </View>
      </Modal>

      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#6200ee"
        placement="right"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEvent')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 24,
    paddingBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#000000',
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: '#ffffff',
  },
  noEventsText: {
    color: '#757575',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fab: {
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
