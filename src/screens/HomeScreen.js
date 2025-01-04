import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Button, FAB } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import UpcomingEvents from '../components/UpcomingEvents';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text h4>Bem-vindo ao JusAgenda</Text>
          <Text style={styles.subtitle}>
            Gerencie seus compromissos jurídicos
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        <UpcomingEvents />

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <Button
              title="Buscar"
              icon={{
                name: 'search',
                type: 'material',
                size: 24,
                color: 'white',
              }}
              titleStyle={styles.actionButtonTitle}
              buttonStyle={[styles.actionButton, { backgroundColor: '#6200ee' }]}
              containerStyle={styles.actionButtonContainer}
              onPress={() => navigation.navigate('Search')}
            />
            <Button
              title="Novo"
              icon={{
                name: 'add',
                type: 'material',
                size: 24,
                color: 'white',
              }}
              titleStyle={styles.actionButtonTitle}
              buttonStyle={[styles.actionButton, { backgroundColor: '#03dac6' }]}
              containerStyle={styles.actionButtonContainer}
              onPress={() => navigation.navigate('AddEvent')}
            />
            <Button
              title="Agenda"
              icon={{
                name: 'calendar-today',
                type: 'material',
                size: 24,
                color: 'white',
              }}
              titleStyle={styles.actionButtonTitle}
              buttonStyle={[styles.actionButton, { backgroundColor: '#018786' }]}
              containerStyle={styles.actionButtonContainer}
              onPress={() => navigation.navigate('Calendar')}
            />
          </View>
        </View>
        
        {/* Espaço extra no final do ScrollView para evitar sobreposição com o FAB */}
        <View style={styles.fabSpace} />
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

const { width } = Dimensions.get('window');
const buttonWidth = (width - 48 - 16) / 3; // 48 para padding, 16 para gaps

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16, // Padding extra no final do conteúdo
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#000000',
  },
  quickActionsContainer: {
    paddingBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonContainer: {
    width: buttonWidth,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    height: 88,
    borderRadius: 12,
    flexDirection: 'column',
    padding: 12,
  },
  actionButtonTitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    margin: 16,
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  fabSpace: {
    height: 80, // Espaço extra para evitar sobreposição com o FAB
  },
});

export default HomeScreen;
