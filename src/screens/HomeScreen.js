import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB, Card, Icon } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';
import { getUpcomingCompromissos } from '../services/EventService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { refreshEvents, events } = useEvents();

  useEffect(() => {
    if (isFocused) {
      refreshEvents();
    }
  }, [isFocused, refreshEvents]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { event });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'audiencia':
        return { name: 'gavel', color: '#6200ee' }; // Martelinho roxo do juiz
      case 'reuniao':
        return { name: 'groups', color: '#03dac6' };
      case 'prazo':
        return { name: 'timer', color: '#ff0266' };
      default:
        return { name: 'event', color: '#018786' };
    }
  };

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleTimeString('pt-BR');
  };

  // Filtrando compromissos de hoje
  const today = new Date().toLocaleDateString('pt-BR');
  const todayCompromissos = events.filter(compromisso => new Date(compromisso.date).toLocaleDateString('pt-BR') === today);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 16 }}>
        <Card containerStyle={styles.welcomeCard}>
          <LinearGradient
            colors={['#6200ee', '#9747FF']}
            style={styles.gradient}
          >
            <View style={styles.welcomeContent}>
              <Icon
                name="gavel"
                color="#ffffff"
                size={36}
                style={styles.welcomeIcon}
              />
              <View style={styles.welcomeTextContainer}>
                <Text h4 style={styles.welcomeTitle}>{getCurrentTime()}</Text>
                <Text style={styles.welcomeSubtitle}>
                  Bem-vindo ao JusAgenda
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Seção de Compromissos de Hoje */}
        <View style={styles.section}>
          <Text h4 style={[styles.sectionTitle, { marginBottom: 8 }]}>Compromissos de Hoje</Text>
          {todayCompromissos.length > 0 ? (
            todayCompromissos.map(compromisso => {
              const icon = getEventTypeIcon(compromisso.type);
              return (
                <TouchableOpacity
                  key={compromisso.id}
                  onPress={() => handleEventPress(compromisso)}
                >
                  <Card containerStyle={styles.card}>
                    <View style={styles.cardHeader}>
                      <Icon name={icon.name} color={icon.color} size={24} />
                      <Text style={styles.eventType}>{compromisso.type?.charAt(0).toUpperCase() + compromisso.type?.slice(1)}</Text>
                    </View>
                    <Text style={styles.title}><Text style={{fontWeight: 'bold'}}>{compromisso.title}</Text></Text>
                    <View style={styles.dateContainer}>
                      <Icon name="calendar-today" size={16} color="#757575" />
                      <Text style={styles.date}>{formatDate(compromisso.date)}</Text>
                    </View>
                    {compromisso.location && (
                      <View style={styles.locationContainer}>
                        <Icon name="location-on" size={16} color="#757575" />
                        <Text style={styles.location} numberOfLines={1}>{compromisso.location}</Text>
                      </View>
                    )}
                    {compromisso.client && (
                      <View style={styles.clientContainer}>
                        <Icon name="person" size={16} color="#757575" />
                        <Text style={styles.client} numberOfLines={1}>{compromisso.client}</Text>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text>Nenhum compromisso para hoje.</Text>
          )}
        </View>

        <View style={[styles.section, {marginTop: -32}]}>
          <Text h4 style={styles.sectionTitle}>Próximos Compromissos</Text>
          <UpcomingEvents onEventPress={handleEventPress} />
        </View>
      </ScrollView>

      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#6200ee"
        placement="right"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEvent')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 0,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 0,
  },
  gradient: {
    borderRadius: 12,
  },
  welcomeContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 30,
  },
  welcomeTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    color: '#ffffff',
    marginBottom: 4,
    fontSize: 20,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#000000',
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    color: '#6200ee',
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  client: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  fab: {
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
