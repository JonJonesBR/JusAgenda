import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import { Picker } from '@react-native-picker/picker';
import CustomDateTimePicker from '../../components/CustomDateTimePicker';

interface BasicInfoStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
}

/**
 * Primeiro passo do wizard - Informações básicas do evento
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
}) => {
  const { theme } = useTheme();

  // Lista de tipos de eventos disponíveis
  const eventTypes = [
    { label: 'Selecione um tipo', value: '' },
    { label: 'Audiência', value: 'audiencia' },
    { label: 'Prazo', value: 'prazo' },
    { label: 'Reunião', value: 'reuniao' },
    { label: 'Despacho', value: 'despacho' },
    { label: 'Outro', value: 'outro' },
  ];

  // Função para simplificar a atualização de campos
  const handleFieldUpdate = (updates: Partial<Event>) => {
    onUpdate({ ...data, ...updates });
  };

  const handleDateChange = (date: Date) => {
    onUpdate({ ...data, data: date });
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
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || '#999' }]}>
        Preencha os dados básicos do evento para prosseguir.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
        <Input
          placeholder="Digite o título do evento"
          value={data.title || ''}
          onChangeText={(value) => handleFieldUpdate({ title: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="sentences"
          accessibilityLabel="Título do evento"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border || '#e0e0e0' }]}>
          <Picker
            selectedValue={data.tipo || ''}
            onValueChange={(value) => handleFieldUpdate({ tipo: value })}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
            accessibilityLabel="Tipo de evento"
          >
            {eventTypes.map((typeOption) => (
              <Picker.Item key={typeOption.value} label={typeOption.label} value={typeOption.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Data e Hora *</Text>
        <CustomDateTimePicker
          label="Data e Hora"
          value={data.data ? new Date(data.data) : new Date()}
          onChange={handleDateChange}
          mode="datetime"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Descrição</Text>
        <Input
          placeholder="Descreva o evento"
          value={data.descricao || ''}
          onChangeText={(value) => handleFieldUpdate({ descricao: value })}
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
          onChangeText={(value) => handleFieldUpdate({ local: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          accessibilityLabel="Local do evento"
        />
      </View>
    </ScrollView>
  );
};

// Estilos ajustados para consistência
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionDescription: {
    fontSize: 15,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  }
});

export default BasicInfoStep;
