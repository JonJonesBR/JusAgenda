import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { Card, Text } from '@rneui/themed';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const AgendaScreen = ({ navigation }) => {
  const { events, refreshEvents, deleteEvent } = useEvents();

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const loadItems = useCallback((day) => {
    const items = {};
    events.forEach((event) => {
      const dateStr = event.date.split('T')[0];
      if (!items[dateStr]) {
        items[dateStr] = [];
      }
      items[dateStr].push(event);
    });
    return items;
  }, [events]);

  const handleEventPress = useCallback((event) => {
    Alert.alert(
      'Opções',
      'O que você deseja fazer?',
      [
        {
          text: 'Visualizar',
          onPress: () => navigation.navigate('EventView', { event })
        },
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EventDetails', { event })
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar Exclusão',
              'Tem certeza que deseja excluir este compromisso?',
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
                      Alert.alert('Erro', 'Não foi possível excluir o compromisso');
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [navigation, deleteEvent, refreshEvents]);

  const renderItem = useCallback((item) => {
    return (
      <Card
        containerStyle={styles.card}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventType}>
            {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
          </Text>
          <Text style={styles.eventTime}>
            {formatDateTime(item.date).split(' ')[1]}
          </Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.location && (
          <Text style={styles.eventLocation}>📍 {item.location}</Text>
        )}
        {item.client && (
          <Text style={styles.eventClient}>👤 {item.client}</Text>
        )}
      </Card>
    );
  }, [handleEventPress]);

  return (
    <View style={styles.container}>
      <Agenda
        items={loadItems(new Date())}
        renderItem={renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>Nenhum compromisso neste dia</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => r1.id !== r2.id}
        showClosingKnob={true}
        theme={{
          agendaDayTextColor: '#6200ee',
          agendaDayNumColor: '#6200ee',
          agendaTodayColor: '#6200ee',
          agendaKnobColor: '#6200ee'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  card: {
    marginRight: 10,
    marginTop: 17,
    borderRadius: 8
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee'
  },
  eventTime: {
    fontSize: 14,
    color: '#666'
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  eventClient: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
});

export default AgendaScreen;