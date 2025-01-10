import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Icon, Card } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { cancelEventNotification, removeFromDeviceCalendar } from '../services/NotificationService';

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params;
  const { deleteEvent } = useEvents();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    navigation.navigate('AddEvent', { event });
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este compromisso?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancela notificações antes de excluir
              if (event.notificationId) {
                await cancelEventNotification(event.notificationId);
              }
              if (event.calendarEventId) {
                await removeFromDeviceCalendar(event.calendarEventId);
              }

              const success = await deleteEvent(event.id);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o compromisso');
              }
            } catch (error) {
              console.error('Erro ao excluir compromisso:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir o compromisso');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text h4 style={styles.title}>{event.title}</Text>
            <Text style={styles.type}>{event.type}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Icon name="calendar-today" color="#6200ee" size={20} />
          <Text style={styles.sectionText}>{formatDate(event.date)}</Text>
        </View>

        {event.location && (
          <View style={styles.section}>
            <Icon name="location-on" color="#6200ee" size={20} />
            <Text style={styles.sectionText}>{event.location}</Text>
          </View>
        )}

        {event.client && (
          <View style={styles.section}>
            <Icon name="person" color="#6200ee" size={20} />
            <Text style={styles.sectionText}>{event.client}</Text>
          </View>
        )}

        {event.description && (
          <View style={styles.descriptionSection}>
            <Icon name="description" color="#6200ee" size={20} />
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        <View style={styles.notificationInfo}>
          <Icon name="notifications" color="#6200ee" size={20} />
          <Text style={styles.notificationText}>
            Lembrete agendado para 24h antes do compromisso
            {event.calendarEventId && ' (Adicionado à agenda do dispositivo)'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Editar"
            icon={{
              name: 'edit',
              size: 20,
              color: 'white',
            }}
            buttonStyle={[styles.button, styles.editButton]}
            onPress={handleEdit}
          />
          <Button
            title="Excluir"
            icon={{
              name: 'delete',
              size: 20,
              color: 'white',
            }}
            buttonStyle={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    margin: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#000000',
    marginBottom: 4,
  },
  type: {
    color: '#6200ee',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  descriptionSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    lineHeight: 24,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
});

export default EventDetailsScreen;
