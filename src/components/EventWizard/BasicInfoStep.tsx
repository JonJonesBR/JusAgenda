import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text, Button } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';

interface BasicInfoStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
  isEditMode?: boolean;
}

/**
 * Primeiro passo do wizard - Informações básicas do evento
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Lista de tipos de eventos disponíveis
  const eventTypes = [
    { label: 'Selecione um tipo', value: '' },
    { label: 'Audiência', value: 'audiencia' },
    { label: 'Prazo', value: 'prazo' },
    { label: 'Reunião', value: 'reuniao' },
    { label: 'Despacho', value: 'despacho' },
    { label: 'Outro', value: 'outro' },
  ];

  // Manipular mudança de data
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onUpdate({ data: moment(selectedDate).format('YYYY-MM-DD') });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Informações Básicas
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey1 || '#999' }]}>
        Preencha os dados básicos do evento para prosseguir.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
        <Input
          placeholder="Digite o título do evento"
          value={data.titulo || ''}
          onChangeText={(value) => onUpdate({ titulo: value, title: value })} // Atualize ambos para compatibilidade
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="sentences"
          accessibilityLabel="Título do evento"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.grey5 || '#e0e0e0' }]}>
          <Picker
            selectedValue={data.tipo || ''}
            onValueChange={(value) => onUpdate({ tipo: value })}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
            accessibilityLabel="Tipo de evento"
          >
            {eventTypes.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Data *</Text>
        <Button
          title={data.data ? moment(data.data).format('DD/MM/YYYY') : 'Selecionar data'}
          type="outline"
          buttonStyle={[styles.dateButton, { borderColor: theme.colors.grey5 || '#e0e0e0' }]}
          titleStyle={{ color: theme.colors.text }}
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="Selecionar data do evento"
          icon={{
            name: 'calendar',
            type: 'material-community',
            color: theme.colors.text,
          }}
          iconPosition="left"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Descrição</Text>
        <Input
          placeholder="Descreva o evento"
          value={data.descricao || ''}
          onChangeText={(value) => onUpdate({ descricao: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          accessibilityLabel="Descrição do evento"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Local</Text>
        <Input
          placeholder="Local do evento"
          value={data.local || ''}
          onChangeText={(value) => onUpdate({ local: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          accessibilityLabel="Local do evento"
        />
      </View>

      {/* Exibir o seletor de data quando solicitado */}
      {showDatePicker && (
        <DateTimePicker
          value={data.data ? moment(data.data).toDate() : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
});

export default BasicInfoStep;
