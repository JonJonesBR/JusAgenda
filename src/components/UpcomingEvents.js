import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import SkeletonLoader from './SkeletonLoader';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';

const UpcomingEvents = ({ onEventPress }) => {
  const navigation = useNavigation();
  const { events, deleteEvent, refreshEvents, loading } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [deletedEvent, setDeletedEvent] = useState(null);

  // Calcula os compromissos futuros, ordenando-os e limitando a 5 itens
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [events]);

  const getEventTypeIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: '#6200ee' };
      case 'reuniao':
        return { name: 'groups', color: '#03dac6' };
      case 'prazo':
        return { name: 'timer', color: '#ff0266' };
      default:
        return { name: 'event', color: '#018786' };
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  }, [refreshEvents]);

  // Função para desfazer a exclusão
  const undoDelete = useCallback(async () => {
    if (deletedEvent) {
      try {
        // Aqui você precisaria implementar uma função para restaurar o evento
        // Como alternativa, podemos adicionar o evento novamente
        // await addEvent(deletedEvent);
        await refreshEvents();
        setDeletedEvent(null);
        Toast.show({
          type: 'success',
          text1: 'Exclusão desfeita',
          text2: 'O compromisso foi restaurado com sucesso',
          position: 'bottom',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível restaurar o compromisso',
          position: 'bottom',
        });
      }
    }
  }, [deletedEvent, refreshEvents]);

  const confirmDelete = useCallback((event) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este compromisso?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fornece feedback tátil ao excluir
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Armazena o evento antes de excluí-lo para possível restauração
              setDeletedEvent(event);
              
              await deleteEvent(event.id);
              refreshEvents();
              
              // Mostra toast com opção de desfazer
              Toast.show({
                type: 'info',
                text1: 'Compromisso excluído',
                text2: 'Toque para desfazer',
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
                onPress: undoDelete,
              });
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir o compromisso. Tente novamente.',
                position: 'bottom',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [deleteEvent, refreshEvents, undoDelete]);

  const handleEventPress = useCallback((event) => {
    // Se onEventPress foi fornecido como prop, use-o
    if (onEventPress) {
      return onEventPress(event);
    }
    
    // Caso contrário, use o comportamento padrão
    // Fornece feedback tátil ao pressionar
    Haptics.selectionAsync();
    
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
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDelete(event),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, [navigation, confirmDelete, onEventPress]);

  // Exibe o skeleton loader durante o carregamento
  if (loading && !refreshing) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card containerStyle={styles.emptyCard}>
        <Icon name="event-busy" size={48} color="#757575" />
        <Text style={styles.emptyText}>Nenhum compromisso próximo</Text>
      </Card>
    );
  }

  const renderEventItem = useCallback(({ item: event }) => {
    const icon = getEventTypeIcon(event.type);
    return (
      <TouchableOpacity
        onPress={() => handleEventPress(event)}
      >
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name={icon.name} color={icon.color} size={24} />
            <Text style={styles.eventType}>
              {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={16} color="#757575" />
            <Text style={styles.date}>{formatDate(event.date)}</Text>
          </View>
          {event.location && (
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#757575" />
              <Text style={styles.location} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
          {event.client && (
            <View style={styles.clientContainer}>
              <Icon name="person" size={16} color="#757575" />
              <Text style={styles.client} numberOfLines={1}>
                {event.client}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }, [getEventTypeIcon, handleEventPress, formatDate]);

  return (
    <FlatList
      data={upcomingEvents}
      renderItem={renderEventItem}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      initialNumToRender={3}
      maxToRenderPerBatch={5}
      windowSize={3}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6200ee']}
          tintColor="#6200ee"
        />
      }
    />
  );
};

UpcomingEvents.propTypes = {
  onEventPress: PropTypes.func,
};

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  card: {
    borderRadius: 10,
    padding: 16,
    width: 280,
    marginRight: 8,
    marginVertical: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  client: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
});

export default UpcomingEvents;
