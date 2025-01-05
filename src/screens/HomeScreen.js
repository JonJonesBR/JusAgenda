import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, Card, Icon } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { refreshEvents } = useEvents();

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
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

        <View style={styles.section}>
          <Text h4 style={styles.sectionTitle}>Próximos Eventos</Text>
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
  fab: {
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
