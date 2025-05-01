import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Alert, // Keep Alert for other potential uses, but remove delete confirmation
  Animated,
  ActivityIndicator,
} from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Agenda } from "react-native-calendars";
import Toast from "react-native-toast-message"; // Import Toast
import { Card, Text } from "@rneui/themed";
import { useEvents } from "../contexts/EventContext";
import { formatDateTime } from "../utils/dateUtils";
import { Event } from "../types/event";
import { useTheme } from "../contexts/ThemeContext"; // Import useTheme for styling Toast

interface AgendaScreenProps {
  navigation: any;
}

const AgendaScreen: React.FC<AgendaScreenProps> = ({ navigation }) => {
  // Get new functions and ref from context
  const {
    events,
    refreshEvents,
    deleteEvent,
    confirmDeleteEvent,
    undoDeleteEvent,
    deleteTimerRef,
  } = useEvents();
  const { theme, isDarkMode } = useTheme(); // Get theme for Toast styling
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle showing the undo toast
  const showUndoToast = (deletedEvent: Event) => {
    // Clear any existing timer before setting a new one
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    Toast.show({
      type: "info", // Or a custom type
      text1: "Compromisso excluído",
      text2: `"${deletedEvent.title}" foi excluído.`,
      position: "bottom",
      visibilityTime: 5000, // Auto-hide after 5 seconds (will trigger confirm)
      autoHide: true,
      onPress: () => {
        // User tapped the toast itself (optional action, maybe dismiss?)
        Toast.hide();
      },
      onHide: () => {
        // This is called when the toast is hidden, either by timeout or manually
        // We only confirm deletion if it hid due to timeout (not undo press)
        if (deleteTimerRef.current) { // Check if the timer is still active
           confirmDeleteEvent().catch(err => {
             console.error("Erro ao confirmar exclusão automática:", err);
             Alert.alert("Erro", "Não foi possível confirmar a exclusão.");
             // Optionally try to undo again if confirmation failed
             undoDeleteEvent();
           });
           deleteTimerRef.current = null; // Clear the ref after confirmation
        }
      },
      props: { // Custom props for the button
        undo: () => {
          if (deleteTimerRef.current) {
             clearTimeout(deleteTimerRef.current); // Prevent confirm on undo
             deleteTimerRef.current = null;
          }
          undoDeleteEvent();
          Toast.hide(); // Hide toast immediately on undo
        },
        buttonText: "Desfazer",
        buttonStyle: { backgroundColor: theme.colors.primary },
        buttonTextStyle: { color: theme.colors.background },
      },
    });

    // Set the timer to confirm deletion after visibilityTime
     deleteTimerRef.current = setTimeout(() => {
       // The onHide logic handles the confirmation now
       // Just ensure the ref is cleared if timeout completes normally
       // This timeout mainly ensures onHide is triggered correctly
       deleteTimerRef.current = null;
     }, 5000); // Match visibilityTime
  };

  // Function to handle the deletion process
  const handleDeleteProcess = async (event: Event) => {
     try {
       const deletedEvent = await deleteEvent(event.id);
       if (deletedEvent) {
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Feedback for temporary delete
         showUndoToast(deletedEvent);
       } else {
         // Handle case where event wasn't found or deleteEvent failed pre-service call
         Alert.alert("Erro", "Não foi possível iniciar a exclusão do compromisso.");
       }
     } catch (error: any) {
       console.error("Erro ao iniciar exclusão:", error);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       Alert.alert("Erro", error.message || "Falha ao excluir evento");
       // Optionally attempt to refresh state if delete failed unexpectedly
       refreshEvents();
     }
  };


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await refreshEvents();
      setIsLoading(false);
    };
    loadData();
  }, [refreshEvents]);

  const loadItems = useCallback(
    (day: any): Record<string, Event[]> => {
      const items: Record<string, Event[]> = {};
      events.forEach((event) => {
        const dateStr = event.data.toISOString().split("T")[0];
        if (!items[dateStr]) {
          items[dateStr] = [];
        }
        items[dateStr].push(event);
      });
      return items;
    },
    [events]
  );

  const handleEventPress = useCallback(
    (event: Event) => {
      Alert.alert(
        "Opções",
        "O que você deseja fazer?",
        [
          {
            text: "Visualizar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: false }),
          },
          {
            text: "Editar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: true }),
          },
          {
            // Removed duplicate text property
            text: "Excluir",
            style: "destructive",
            onPress: () => handleDeleteProcess(event), // Use the new handler, remove confirmation Alert
          },
          { text: "Cancelar", style: "cancel" },
        ],
        { cancelable: true }
      );
    },
    // Correct dependencies for handleEventPress
    [navigation, handleDeleteProcess] // Removed deleteEvent, refreshEvents which are not directly used here
  );

  const renderItem = useCallback(
    (item: Event) => {
      // Define renderRightActions *inside* renderItem's scope
      const renderRightActions = (progress: Animated.AnimatedInterpolation<any>, dragX: Animated.AnimatedInterpolation<any>) => {
        const trans = dragX.interpolate({
          inputRange: [-100, 0], // Adjust input range for right swipe actions
          outputRange: [1, 0],   // Adjust output range for translation
          extrapolate: 'clamp',
        });

        // Define the swipe handler here
        const handleDeleteSwipe = () => {
          // Consider closing the swipeable row if you add refs later
          handleDeleteProcess(item);
        };

        return (
          // Ensure this returns a valid JSX structure for the actions
          <View style={styles.swipeContainer}>
             {/* Edit Action */}
            <Animated.View style={{ transform: [{ translateX: trans }] }}>
              <RectButton
                style={[styles.rightAction, styles.editAction]}
                onPress={() => {
                  Haptics.selectionAsync();
                  navigation.navigate("EventDetails", { event: item, editMode: true });
                  // Consider closing the swipeable row here if refs are added
                }}
              >
                <Text style={styles.actionText}>Editar</Text>
              </RectButton>
            </Animated.View>
             {/* Delete Action */}
            <Animated.View style={{ transform: [{ translateX: trans }] }}>
              <RectButton
                style={[styles.rightAction, styles.deleteAction]}
                onPress={handleDeleteSwipe} // Use the correct handler
              >
                <Text style={styles.actionText}>Excluir</Text>
              </RectButton>
            </Animated.View>
          </View>
        );
      }; // End of renderRightActions definition

      // Return the Swipeable component structure correctly
      return (
        <Swipeable
          friction={2}
          rightThreshold={40} // Threshold to trigger actions
          overshootRight={false}
          renderRightActions={renderRightActions} // Pass the function defined above
          onSwipeableOpen={(direction) => {
             if (direction === 'right') {
               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
             }
          }}
          // Add key for performance
          key={item.id}
        >
          {/* Card component wrapped by RectButton for press handling */}
          <RectButton
            onPress={() => {
              Haptics.selectionAsync();
              handleEventPress(item); // Use the options menu handler
            }}
            style={styles.touchableWrapper} // Add a wrapper style if needed
          >
            <Card containerStyle={[styles.card, { borderColor: theme.colors.border }]}>
              <View style={styles.touchableContent}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventType, { color: theme.colors.primary }]}>
                    {item.tipo?.charAt(0).toUpperCase() + item.tipo?.slice(1)}
                  </Text>
                  <Text style={[styles.eventTime, { color: theme.colors.textSecondary || theme.colors.text }]}>
                    {formatDateTime(item.data).split(" ")[1]}
                  </Text>
                </View>
                <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.title}</Text>
                {item.local && (
                  <Text style={[styles.eventLocation, { color: theme.colors.textSecondary || theme.colors.text }]}>📍 {item.local}</Text>
                )}
                {item.cliente && (
                  <Text style={[styles.eventClient, { color: theme.colors.textSecondary || theme.colors.text }]}>👤 {item.cliente}</Text>
                )}
              </View>
            </Card>
          </RectButton>
        </Swipeable>
      );
    },
    // Correct dependencies for renderItem
    [handleEventPress, navigation, handleDeleteProcess, theme] // Added theme
  );

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
        rowHasChanged={(r1: Event, r2: Event) => r1.id !== r2.id}
        showClosingKnob={true}
        theme={{
          // Use theme colors
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.background,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          // Correct theme property usage (remove duplicate lines)
          textDisabledColor: theme.colors.textDisabled,
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.background,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.text,
          indicatorColor: theme.colors.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
          agendaDayTextColor: theme.colors.primary,
          agendaDayNumColor: theme.colors.primary,
          agendaTodayColor: theme.colors.primary,
          agendaKnobColor: theme.colors.primary,
        }}
      />
      {/* Toast component is already in App.js, no need to add here */}
    </View>
  );
};

// Define styles outside the component to avoid re-creation on every render
// Styles that depend on the theme will be applied inline or adjusted inside the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color is handled by Agenda's theme prop
  },
  card: { // Keep basic margin/padding, let RNE handle theme colors
    marginRight: 10,
    marginTop: 17,
    borderRadius: 8,
    padding: 0, // Remove default Card padding if using RectButton inside
    // borderColor applied inline now
  },
   touchableWrapper: { // Added wrapper for RectButton if needed
     // Styles for the RectButton wrapper itself
   },
  // Removed duplicate touchableContent style block
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: "bold",
    // Color applied inline using theme
  },
  eventTime: {
    fontSize: 14,
    // Color applied inline using theme (using textSecondary fallback)
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    // Color applied inline using theme
  },
  eventLocation: {
    fontSize: 14,
    marginTop: 4,
    // Color applied inline using theme (using textSecondary fallback)
  },
  eventClient: {
    fontSize: 14,
    marginTop: 4,
    // Color applied inline using theme (using textSecondary fallback)
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  swipeContainer: {
    width: 180,
    flexDirection: "row",
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: "100%",
  },
  deleteAction: {
    backgroundColor: "#ff4444",
  },
  editAction: {
    backgroundColor: "#ffaa33",
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // Keep the intended touchableContent style here
  touchableContent: {
    padding: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default AgendaScreen;
