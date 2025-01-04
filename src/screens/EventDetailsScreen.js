import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Icon, Button } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const event = route.params?.event;

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#b00020" />
        <Text style={styles.errorText}>Evento não encontrado</Text>
      </View>
    );
  }

  const getEventTypeIcon = (type) => {
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
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const icon = getEventTypeIcon(event.type);

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Icon name={icon.name} color={icon.color} size={32} />
          <Text h4 style={styles.title}>{event.title}</Text>
        </View>

        <Card.Divider />

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="calendar-today" size={20} color="#757575" />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>

          {event.location && (
            <View style={styles.infoItem}>
              <Icon name="location-on" size={20} color="#757575" />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          )}

          {event.client && (
            <View style={styles.infoItem}>
              <Icon name="person" size={20} color="#757575" />
              <Text style={styles.infoText}>{event.client}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Icon name="label" size={20} color="#757575" />
            <Text style={styles.infoText}>
              {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
            </Text>
          </View>
        </View>

        {event.description && (
          <>
            <Card.Divider />
            <Text style={styles.descriptionTitle}>Descrição</Text>
            <Text style={styles.description}>{event.description}</Text>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Editar"
            icon={{
              name: 'edit',
              size: 20,
              color: 'white',
            }}
            buttonStyle={styles.editButton}
            onPress={() => navigation.navigate('EditEvent', { event })}
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
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 12,
    flex: 1,
    color: '#000000',
  },
  infoSection: {
    marginVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000000',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#000000',
  },
  description: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 24,
  },
  editButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#b00020',
  },
});

export default EventDetailsScreen;
