import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, Text, Icon } from "@rneui/themed";
import { useEvents } from "../contexts/EventContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatDateTime } from "../utils/dateUtils";
import { Event } from "../types/event";

interface UpcomingEventsProps {
  onEventPress: (event: Event) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ onEventPress }) => {
  const { events } = useEvents();
  const { theme, isDarkMode } = useTheme();

  const upcomingEvents = events
    .filter((event) => event.data >= new Date())
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  const styles = StyleSheet.create({
    card: {
      backgroundColor: (theme.colors as any).card || "#fff",
      borderColor: theme.colors.border,
      borderRadius: 12,
      elevation: 4,
      marginBottom: 16,
      padding: 20,
      shadowColor: (theme.colors as any).shadow || "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardDate: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 3,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    cardHeader: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: 12,
    },
    cardIcon: {
      backgroundColor: isDarkMode
        ? (theme.colors as any).surfaceVariant || "#ccc"
        : `${theme.colors.primary}15`,
      borderRadius: 12,
      marginRight: 10,
      padding: 10,
    },
    cardTitle: {
      color: theme.colors.text,
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
    },
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    divider: {
      backgroundColor: theme.colors.divider,
      height: 1,
      marginVertical: 10,
    },
    locationContainer: {
      alignItems: "center",
      flexDirection: "row",
      marginTop: 8,
    },
    locationText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginLeft: 5,
    },
    noEventsContainer: {
      alignItems: "center",
      backgroundColor: (theme.colors as any).card || "#fff",
      borderColor: theme.colors.border,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
      marginHorizontal: 10,
      padding: 20,
    },
    noEventsText: {
      color: (theme.colors as any).textMuted || "#999",
      marginTop: 10,
      textAlign: "center",
    },
    viewButton: {
      alignItems: "center",
      flexDirection: "row",
      padding: 8,
    },
    viewButtonText: {
      color: theme.colors.primary,
      fontWeight: "500",
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      {upcomingEvents.length > 0 ? (
        <ScrollView horizontal>
          {upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => onEventPress(event)}
            >
              <Card containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Icon
                      name={
                        event.tipo === "audiencia"
                          ? "gavel"
                          : event.tipo === "reuniao"
                          ? "groups"
                          : event.tipo === "prazo"
                          ? "timer"
                          : "event"
                      }
                      color={
                        event.tipo === "prazo"
                          ? theme.colors.error
                          : theme.colors.primary
                      }
                      size={22}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {event.title || event.cliente}
                    </Text>
                    <Text style={styles.cardDate}>
                      {formatDateTime(event.data)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                {event.local && (
                  <View style={styles.locationContainer}>
                    <Icon
                      name="location-on"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {event.local}
                    </Text>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => onEventPress(event)}
                  >
                    <Text style={styles.viewButtonText}>Ver detalhes</Text>
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noEventsContainer}>
          <Icon
            name="event-busy"
            size={40}
            color={(theme.colors as any).textMuted || "#999"}
          />
          <Text style={styles.noEventsText}>
            Nenhum compromisso agendado para os próximos dias
          </Text>
        </View>
      )}
    </View>
  );
};

export default UpcomingEvents;
