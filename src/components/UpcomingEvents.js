// UpcomingEvents.js
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { useEvents } from '../contexts/EventContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateTime } from '../utils/dateUtils';

const UpcomingEvents = ({ onEventPress }) => {
  const { events } = useEvents();
  const { theme, isDarkMode } = useTheme();

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    card: {
      marginBottom: 16,
      padding: 20,
      borderRadius: 12,
      elevation: 4,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardIcon: {
      marginRight: 10,
      padding: 10,
      borderRadius: 12,
      backgroundColor: isDarkMode ? theme.colors.surfaceVariant : `${theme.colors.primary}15`,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    cardDate: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 3,
    },
    noEventsContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      marginHorizontal: 10,
      marginBottom: 16,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    noEventsText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 10,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    locationText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginLeft: 5,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: 10,
    },
    cardFooter: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    viewButtonText: {
      marginLeft: 4,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {upcomingEvents.length > 0 ? (
        <ScrollView horizontal>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} onPress={() => onEventPress(event)}>
              <Card containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Icon
                      name={event.type === 'audiencia' ? 'gavel' : event.type === 'reuniao' ? 'groups' : event.type === 'prazo' ? 'timer' : 'event'}
                      color={event.type === 'prazo' ? theme.colors.error : theme.colors.primary}
                      size={22}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.cardDate}>{formatDateTime(event.date)}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                {event.location && (
                  <View style={styles.locationContainer}>
                    <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1}>{event.location}</Text>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.viewButton} onPress={() => onEventPress(event)}>
                    <Text style={styles.viewButtonText}>Ver detalhes</Text>
                    <Icon name="chevron-right" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noEventsContainer}>
          <Icon name="event-busy" size={40} color={theme.colors.textMuted} />
          <Text style={styles.noEventsText}>Nenhum compromisso agendado para os próximos dias</Text>
        </View>
      )}
    </View>
  );
};

export default UpcomingEvents;
