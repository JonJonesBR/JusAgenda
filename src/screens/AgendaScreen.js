import React, { useCallback, useEffect, useState } from 'react'; // Added useState import
import { View, StyleSheet, Alert, Animated, ActivityIndicator } from 'react-native'; // Added ActivityIndicator import
import { Swipeable, RectButton } from 'react-native-gesture-handler'; // Removed TouchableOpacity import
import * as Haptics from 'expo-haptics';
import { Agenda } from 'react-native-calendars';
import { Card, Text } from '@rneui/themed';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const AgendaScreen = ({ navigation }) => {
  const { events, refreshEvents, deleteEvent } = useEvents();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await refreshEvents();
      setIsLoading(false);
    };
    loadData();
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
          accessibilityLabel: 'Abrir detalhes do evento',
          onPress: () => navigation.navigate('EventView', { event })
        },
        {
          text: 'Editar',
          accessibilityLabel: 'Editar detalhes do evento',
          onPress: () => navigation.navigate('EventDetails', { event })
        },
        {
          text: 'Excluir',
          accessibilityRole: 'button',
          accessibilityHint: 'Exclui permanentemente o evento',
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
    const renderRightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 0],
      });

      const handleDelete = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        try {
          await deleteEvent(item.id);
          refreshEvents();
        } catch (error) {
          if (error.message.includes('Network Error') || error.message.includes('timeout')) {
            Alert.alert('Erro de Conexão', 'Verifique sua conexão com a internet');
          } else if (error.response?.status?.toString().startsWith('5')) {
            Alert.alert('Erro no Servidor', 'Tente novamente mais tarde');
          } else {
            Alert.alert('Erro', error.message || 'Falha ao excluir evento');
          }
        }
      };

      return (
        <View style={styles.swipeContainer}>
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <RectButton
              style={[styles.rightAction, styles.editAction]}
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('EventDetails', { event: item });
              }}>
              <Text style={styles.actionText}>Editar</Text>
            </RectButton>
            <RectButton
              style={[styles.rightAction, styles.deleteAction]}
              onPress={handleDelete}>
              <Text style={styles.actionText}>Excluir</Text>
            </RectButton>
          </Animated.View>
        </View>
      );
    };

    return (
      <Swipeable
        friction={2}
        overshootRight={false}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
        {/* Removed onPress from Card, wrapped content in TouchableOpacity */}
        <Card containerStyle={styles.card}>
          {/* Replaced TouchableOpacity with RectButton */}
          <RectButton onPress={() => {
            Haptics.selectionAsync();
            handleEventPress(item);
          }} style={styles.touchableContent}> 
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
          </RectButton> 
        </Card>
      </Swipeable>
    );
  }, [handleEventPress, deleteEvent, refreshEvents, navigation]); // Dependencies remain the same

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum compromisso</Text>
      <Text style={styles.emptyText}>Arraste para baixo para atualizar</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}
      <Agenda
        items={loadItems(new Date())}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyState}
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
  },
  swipeContainer: {
    width: 180,
    flexDirection: 'row',
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
  },
  editAction: {
    backgroundColor: '#ffaa33',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  // Added style for RectButton content area if needed for layout
  touchableContent: { 
    // Add padding or other styles if the layout breaks after replacing TouchableOpacity
    padding: 10, // Example padding, adjust as needed
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});

export default AgendaScreen;
