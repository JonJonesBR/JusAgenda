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

  const handleDelete = () => {
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
              await deleteEvent(event.id);
              navigation.navigate('HomeScreen');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
          titleStyle={styles.buttonTitle}
          onPress={handleEdit}
        />
        <Button
          title="Compartilhar"
          icon={{ name: 'share', color: 'white', size: 20 }}
          buttonStyle={[styles.button, styles.shareButton]}
          titleStyle={styles.buttonTitle}
          onPress={handleShare}
        />
        <Button
          title="Excluir"
          icon={{ name: 'delete', color: 'white', size: 20 }}
          buttonStyle={[styles.button, styles.deleteButton]}
          titleStyle={styles.buttonTitle}
          onPress={handleDelete}
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  button: {
    marginVertical: 5,
    height: 50,
    borderRadius: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
  shareButton: {
    backgroundColor: '#03dac6',
  },
  deleteButton: {
    backgroundColor: '#ff0266',
  },
});

export default EventViewScreen; 