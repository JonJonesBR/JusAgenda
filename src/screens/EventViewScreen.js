import React from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatDateTime, formatFullDate } from '../utils/dateUtils';
import { COLORS } from '../utils/common';

const EventViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const event = route.params?.event;

  const handleEdit = () => {
    navigation.navigate('EventDetails', { event });
  };

  const handleShare = async () => {
    try {
      const message = `
📅 ${event.title}

📍 Local: ${event.location}
👤 Cliente: ${event.client}
📆 Data: ${formatFullDate(event.date)}
⏰ Horário: ${formatDateTime(event.date)}
📝 Tipo: ${event.type}

${event.description ? `Descrição: ${event.description}` : ''}
      `.trim();

      const result = await Share.share({
        message,
        title: event.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Compartilhado com sucesso
          console.log(`Compartilhado via ${result.activityType}`);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o compromisso');
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: COLORS.primary };
      case 'reuniao':
        return { name: 'groups', color: COLORS.secondary };
      case 'prazo':
        return { name: 'timer', color: COLORS.error };
      default:
        return { name: 'event', color: '#018786' };
    }
  };

  const icon = getEventTypeIcon(event?.type);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon
          name={icon.name}
          color={icon.color}
          size={40}
          containerStyle={styles.iconContainer}
        />
        <Text h4 style={styles.title}>{event?.title}</Text>
        <Text style={styles.type}>
          {event?.type?.charAt(0).toUpperCase() + event?.type?.slice(1)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Icon name="calendar-today" color={COLORS.text.secondary} size={24} />
          <View style={styles.infoText}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>{formatFullDate(event?.date)}</Text>
            <Text style={styles.time}>{formatDateTime(event?.date)}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Icon name="location-on" color={COLORS.text.secondary} size={24} />
          <View style={styles.infoText}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>{event?.location}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Icon name="person" color={COLORS.text.secondary} size={24} />
          <View style={styles.infoText}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{event?.client}</Text>
          </View>
        </View>

        {event?.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Editar"
          icon={{ name: 'edit', color: 'white', size: 20 }}
          buttonStyle={[styles.button, styles.editButton]}
          onPress={handleEdit}
        />
        <Button
          title="Compartilhar"
          icon={{ name: 'share', color: 'white', size: 20 }}
          buttonStyle={[styles.button, styles.shareButton]}
          onPress={handleShare}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 16,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.text.primary,
  },
  type: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  time: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    height: 50,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
  },
});

export default EventViewScreen; 