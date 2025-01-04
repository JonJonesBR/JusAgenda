import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Button, Text, Card, ButtonGroup } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const eventTypes = ['Audiência', 'Reunião', 'Prazo', 'Outro'];

const AddEventScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const newEvent = {
      title,
      date: date.toISOString(),
      location,
      client,
      description,
      type: eventTypes[selectedTypeIndex].toLowerCase(),
    };

    // TODO: Implementar a lógica de salvar o novo evento
    navigation.goBack();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Digite o título do evento"
          leftIcon={{ type: 'material', name: 'event', color: '#6200ee' }}
        />

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Data</Text>
          <Button
            title={date.toLocaleDateString('pt-BR')}
            type="outline"
            buttonStyle={styles.dateButton}
            titleStyle={styles.dateButtonText}
            icon={{
              name: 'calendar-today',
              size: 20,
              color: '#6200ee',
            }}
            onPress={() => setShowDatePicker(true)}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Tipo de Evento</Text>
          <ButtonGroup
            buttons={eventTypes}
            selectedIndex={selectedTypeIndex}
            onPress={setSelectedTypeIndex}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
            textStyle={styles.buttonGroupText}
          />
        </View>

        <Input
          label="Local"
          value={location}
          onChangeText={setLocation}
          placeholder="Digite o local do evento"
          leftIcon={{ type: 'material', name: 'location-on', color: '#6200ee' }}
        />

        <Input
          label="Cliente"
          value={client}
          onChangeText={setClient}
          placeholder="Digite o nome do cliente"
          leftIcon={{ type: 'material', name: 'person', color: '#6200ee' }}
        />

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Digite a descrição do evento"
          multiline
          numberOfLines={4}
          leftIcon={{ type: 'material', name: 'description', color: '#6200ee' }}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Salvar"
            icon={{
              name: 'save',
              size: 20,
              color: 'white',
            }}
            buttonStyle={styles.saveButton}
            onPress={handleSave}
          />

          <Button
            title="Cancelar"
            type="outline"
            icon={{
              name: 'close',
              size: 20,
              color: '#6200ee',
            }}
            buttonStyle={styles.cancelButton}
            titleStyle={styles.cancelButtonText}
            onPress={() => navigation.goBack()}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    margin: 16,
    padding: 16,
    elevation: 4,
  },
  dateContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginBottom: 8,
  },
  dateButton: {
    borderColor: '#6200ee',
    borderRadius: 10,
  },
  dateButtonText: {
    color: '#6200ee',
  },
  typeContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginBottom: 8,
  },
  buttonGroup: {
    borderRadius: 10,
    borderColor: '#6200ee',
  },
  selectedButton: {
    backgroundColor: '#6200ee',
  },
  buttonGroupText: {
    fontSize: 14,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  cancelButton: {
    borderColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  cancelButtonText: {
    color: '#6200ee',
  },
});

export default AddEventScreen;
