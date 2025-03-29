import React from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateTime, formatFullDate } from '../utils/dateUtils';
import { COLORS } from '../utils/common';

const EventViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { deleteEvent } = useEvents();
  const { theme, isDarkMode } = useTheme();
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
      const result = await Share.share({ message, title: event.title });
      if (result.action === Share.sharedAction && result.activityType) {
        console.log(`Compartilhado via ${result.activityType}`);
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
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              // Navega para a tela Home dentro do navigator aninhado "Main"
              navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleReminder = () => {
    Alert.alert(
      'Lembrete',
      'Deseja configurar um lembrete para este compromisso?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => {
            // Aqui seria implementada a lógica para configurar o lembrete
            Alert.alert('Sucesso', 'Lembrete configurado com sucesso!');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: theme.colors.primary };
      case 'reuniao':
        return { name: 'groups', color: theme.colors.primary };
      case 'prazo':
        return { name: 'timer', color: theme.colors.error };
      default:
        return { name: 'event', color: theme.colors.primary };
    }
  };

  const icon = getEventTypeIcon(event?.type);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    iconContainer: {
      backgroundColor: isDarkMode ? 'rgba(187, 134, 252, 0.1)' : 'rgba(98, 0, 238, 0.1)',
      padding: 16,
      borderRadius: 40,
      marginBottom: 16,
    },
    title: { textAlign: 'center', marginBottom: 8, color: theme.colors.text },
    type: { fontSize: 16, color: theme.colors.textSecondary },
    content: { padding: 20 },
    infoSection: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
      elevation: 2,
    },
    infoText: { marginLeft: 16, flex: 1 },
    label: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
    value: { fontSize: 16, color: theme.colors.text },
    time: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
    descriptionSection: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
      elevation: 2,
    },
    description: { fontSize: 16, color: theme.colors.text, marginTop: 8 },
    buttonContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'stretch',
      marginTop: 20,
      paddingHorizontal: 10,
    },
    button: { marginVertical: 5, height: 50, borderRadius: 8 },
    buttonTitle: { fontSize: 16, fontWeight: 'bold' },
    editButton: { backgroundColor: theme.colors.primary },
    shareButton: { backgroundColor: isDarkMode ? '#03dac4' : '#03dac6' },
    reminderButton: { backgroundColor: '#FFA500' },
    deleteButton: { backgroundColor: theme.colors.error },
  });

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
          <Icon name="calendar-today" color={theme.colors.textSecondary} size={24} />
          <View style={styles.infoText}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>{formatFullDate(event?.date)}</Text>
            <Text style={styles.time}>{formatDateTime(event?.date)}</Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Icon name="location-on" color={theme.colors.textSecondary} size={24} />
          <View style={styles.infoText}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>{event?.location}</Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Icon name="person" color={theme.colors.textSecondary} size={24} />
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
          title="Lembrete"
          icon={{ name: 'alarm', color: 'white', size: 20 }}
          buttonStyle={[styles.button, styles.reminderButton]}
          titleStyle={styles.buttonTitle}
          onPress={handleReminder}
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

export default EventViewScreen;
