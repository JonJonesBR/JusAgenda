import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEvents, Event } from '../contexts/EventCrudContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/dateUtils';
import { Header, Card, Section, List, ListItem } from '../components/ui';
import { FAB, Icon, Skeleton, Button } from '@rneui/themed';
import * as Haptics from 'expo-haptics';

type RootStackParamList = {
  Home: undefined;
  EventDetails: { event?: Partial<Event>; editMode?: boolean };
  Search: undefined;
  Calendar: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const componentColors = {
  defaultOnPrimary: '#FFFFFF',
  defaultGrey: '#A9A9A9',
  defaultSurface: '#FFFFFF',
};

// Define default design system values locally
const defaultDs = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  typography: {
    fontSize: { sm: 13, md: 14, lg: 17, xl: 20 },
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
  },
  radii: { sm: 4, md: 8, lg: 12 },
  shadows: { large: { elevation: Platform.OS === 'android' ? 8 : undefined, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 } },
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const eventData = useEvents(); // Get the whole context value

  const events = eventData?.events || [];
  // Temporarily disable features relying on these potentially missing properties
  const eventsLoading = false; // Assuming not loading by default
  const eventsError = null;    // Assuming no error by default
  const refreshEvents = undefined; // Assuming no refresh function by default

  const { theme } = useTheme();

  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use local defaults as theme structure for these is not as expected or might be missing
  const ds = useMemo(() => ({
    spacing: defaultDs.spacing,
    typography: defaultDs.typography,
    radii: defaultDs.radii,
    shadows: defaultDs.shadows,
  }), []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    detailIcon: {
      marginRight: ds.spacing.sm,
    },
    emptyCard: {
      alignItems: 'center',
      borderStyle: 'dashed',
      borderWidth: 1,
      justifyContent: 'center',
      marginHorizontal: 0,
      paddingVertical: ds.spacing.xl * 2,
    },
    emptyCardButtonContainer: {
      marginTop: ds.spacing.md,
    },
    emptyCardText: {
      fontSize: ds.typography.fontSize.lg,
      marginBottom: ds.spacing.md,
      marginTop: ds.spacing.md,
      textAlign: 'center',
    },
    errorContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: ds.spacing.lg * 1.25,
    },
    errorText: {
        fontSize: ds.typography.fontSize.lg,
        marginBottom: ds.spacing.lg - 1,
        marginTop: ds.spacing.sm + 2,
        textAlign: 'center',
    },
    eventTypeIndicator: {
      borderRadius: ds.radii.sm,
      height: ds.spacing.md - 2,
      marginRight: ds.spacing.md - 2,
      width: ds.spacing.md - 2,
    },
    fabStyle: {},
    headerContentContainer: { // For content within the ListHeaderComponent, before the actual list items
      paddingVertical: ds.spacing.lg,
      // paddingHorizontal is applied by ds.spacing.lg in the JSX
    },
    listContentContainer: { // Used for FlatList's contentContainerStyle
      paddingBottom: 80, // To ensure FAB doesn't overlap last item
      // Horizontal padding is handled by headerContentContainer for header items
      // and can be added to individual list items if needed.
    },
    nextEventCard: {
      marginHorizontal: 0, // Handled by parent padding
    },
    nextEventDetailRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: ds.spacing.sm - 2,
    },
    nextEventDetailText: {
      flex: 1,
    },
    nextEventDetails: {
      paddingLeft: ds.spacing.xl - 4,
    },
    nextEventHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: ds.spacing.md,
    },
    nextEventTitle: {
      flex: 1,
      fontWeight: 'bold',
    },
    nextEventTouchable: {},
    upcomingEventsHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: ds.spacing.sm, // Space below this section title before the list items start
      marginTop: ds.spacing.lg, // Space above this section title
      paddingHorizontal: 0, // ds.spacing.lg is applied to parent
    },
    upcomingEventsTitle: { // Added back in correct alphabetical order
      fontSize: ds.typography.fontSize.lg, // Using local default
      fontWeight: 'bold',
      // color: theme.colors.text, // Will inherit from parent or use default
    },
    // scrollContent: { // No longer needed as FlatList handles its own content
    //   paddingBottom: 80,
    //   paddingHorizontal: 16,
    //   paddingVertical: 16,
    // },
    // scrollViewStyle: { // No longer needed
    //   flex: 1,
    // },
  });

  const calculatedNextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    let closestEvent: Event | null = null;
    let closestTime = Infinity;

    for (const event of events) {
      try {
        if (!event.date) continue;
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) continue;

        const timeDiff = eventDate.getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff < closestTime) {
          closestTime = timeDiff;
          closestEvent = event;
        }
      } catch (processingError) {
        console.warn(`Erro ao processar data do evento ${event.id}:`, processingError);
      }
    }
    return closestEvent;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    now.setHours(0,0,0,0);
    sevenDaysLater.setHours(23,59,59,999);

    return events
      .filter(event => {
        try {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          if (isNaN(eventDate.getTime())) return false;
          return eventDate >= now && eventDate <= sevenDaysLater;
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  }, [events]);

  useEffect(() => {
    setNextEvent(calculatedNextEvent);
  }, [calculatedNextEvent]);

  const handleRefresh = useCallback(async () => {
    if (!refreshEvents) {
        console.warn("Função refreshEvents não disponível no contexto.");
        setIsRefreshing(false);
        return;
    }
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await refreshEvents();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a lista de eventos.");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEvents]);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { event: event as Partial<Event>, editMode: false });
  };
  const handleAddEvent = () => {
    navigation.navigate('EventDetails', { editMode: false });
  };
  const handleSearch = () => navigation.navigate('Search');
  const handleCalendar = () => navigation.navigate('Calendar');

  const getEventTypeColor = useCallback((eventType?: string | null): string => {
    const typeLower = eventType?.toLowerCase();
    switch (typeLower) {
      case 'audiencia': return theme.colors.primary || 'blue';
      case 'reuniao': return theme.colors.secondary || 'teal';
      case 'prazo': return theme.colors.error || 'red';
      case 'despacho': return theme.colors.info || 'purple';
      default: return theme.colors.textSecondary || componentColors.defaultGrey;
    }
  }, [theme.colors]);

  const renderNextEvent = () => {
    if (!nextEvent) {
      return (
        <Card style={{...styles.emptyCard, borderColor: theme.colors.border, backgroundColor: theme.colors.background || componentColors.defaultSurface }}>
          <Icon name="calendar-remove-outline" type="material-community" size={40} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyCardText, { color: theme.colors.textSecondary }]}>
            Nenhum compromisso futuro agendado.
          </Text>
          <Button
            title="Agendar Novo"
            onPress={handleAddEvent}
            type="clear"
            titleStyle={{ color: theme.colors.primary }}
            icon={<Icon name="add-circle-outline" type="material" color={theme.colors.primary} />}
            containerStyle={styles.emptyCardButtonContainer}
          />
        </Card>
      );
    }

    const eventDate = new Date(nextEvent.date!);

    return (
      <Card style={styles.nextEventCard}>
        <TouchableOpacity
          style={styles.nextEventTouchable}
          onPress={() => handleEventPress(nextEvent)}
          activeOpacity={0.7}
        >
          <View style={styles.nextEventHeader}>
            <View style={[ styles.eventTypeIndicator, { backgroundColor: getEventTypeColor(nextEvent.type) } ]} />
            <Text style={[styles.nextEventTitle, { color: theme.colors.text }]}>
              {nextEvent.title || "Sem Título"}
            </Text>
          </View>

          <View style={styles.nextEventDetails}>
             <View style={styles.nextEventDetailRow}>
                <Icon name="calendar-month-outline" type="material-community" size={16} color={theme.colors.textSecondary} style={styles.detailIcon}/>
                <Text style={[styles.nextEventDetailText, { color: theme.colors.text }]}>
                    {formatDate(eventDate)}
                </Text>
             </View>
             <View style={styles.nextEventDetailRow}>
                <Icon name="clock-outline" type="material-community" size={16} color={theme.colors.textSecondary} style={styles.detailIcon}/>
                <Text style={[styles.nextEventDetailText, { color: theme.colors.text }]}>
                    {formatDate(eventDate)}
                </Text>
             </View>
             {nextEvent.description && (
                <View style={styles.nextEventDetailRow}>
                     <Icon name="text-short" type="material-community" size={16} color={theme.colors.textSecondary} style={styles.detailIcon}/>
                    <Text style={[styles.nextEventDetailText, { color: theme.colors.text }]} numberOfLines={2}>
                      {nextEvent.description}
                    </Text>
                </View>
             )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEventItem = (item: Event) => {
    const eventDate = new Date(item.date!);
    const subtitleText = `${formatDate(eventDate)}`;

    return (
      <ListItem
        title={item.title || "Sem Título"}
        subtitle={subtitleText}
        leftIcon={
          <View style={[ styles.eventTypeIndicator, { backgroundColor: getEventTypeColor(item.type) } ]} />
        }
        onPress={() => handleEventPress(item)}
        bottomDivider
        containerStyle={{ paddingVertical: ds.spacing.md }}
        titleStyle={{fontFamily: ds.typography.fontFamily.medium}}
        subtitleStyle={{fontFamily: ds.typography.fontFamily.regular, color: theme.colors.textSecondary}}
      />
    );
  };

  const ListHeader = () => (
    <>
      <Header
        title="JusAgenda"
        rightIcon={
          <Icon
            name="magnify"
            type="material-community"
            color={theme.colors.primary}
            size={28}
            onPress={handleSearch}
          />
        }
      />
      <View style={[styles.headerContentContainer, { paddingHorizontal: ds.spacing.lg }]}>
        {eventsError ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" type="material-community" size={40} color={theme.colors.error} />
            <Text style={[styles.errorText, {color: theme.colors.error}]}>Erro ao carregar compromissos.</Text>
            <Button title="Tentar Novamente" onPress={handleRefresh} type="clear"/>
          </View>
        ) : (
          <Section title="Próximo Compromisso">
            {eventsLoading && !isRefreshing ? <Skeleton height={130} /> : renderNextEvent()}
          </Section>
        )}
        {/* Title for the upcoming events list */}
        {!eventsError && (
          <View style={styles.upcomingEventsHeader}>
            <Text style={styles.upcomingEventsTitle}>Próximos 7 Dias</Text>
            {upcomingEvents.length > 0 && (
              <Button
                title="Ver Calendário"
                type="clear"
                onPress={handleCalendar}
                titleStyle={{ color: theme.colors.primary, fontSize: ds.typography.fontSize.sm }}
              />
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List
        data={eventsError ? [] : upcomingEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        emptyText={eventsError ? "" : "Nenhum compromisso nos próximos 7 dias."}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={refreshEvents ? handleRefresh : undefined}
        refreshing={refreshEvents ? isRefreshing : false}
      />

      <FAB
        icon={{ name: 'add', color: theme.colors.background || componentColors.defaultOnPrimary }}
        color={theme.colors.primary}
        placement="right"
        onPress={handleAddEvent}
        style={styles.fabStyle}
        buttonStyle={{...ds.shadows.large}}
        accessibilityLabel="Adicionar novo compromisso"
        size="large"
        visible={!eventsLoading}
      />
    </View>
  );
};

export default HomeScreen;
