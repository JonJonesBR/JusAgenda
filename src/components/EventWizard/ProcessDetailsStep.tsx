import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text, CheckBox } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import { Picker } from '@react-native-picker/picker';

interface ProcessDetailsStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
  isEditMode?: boolean;
}

/**
 * Segundo passo do wizard - Detalhes processuais
 */
const ProcessDetailsStep: React.FC<ProcessDetailsStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  // Lista de prioridades
  const priorities = [
    { label: 'Selecione a prioridade', value: '' },
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Urgente', value: 'urgente' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Detalhes Processuais
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey1 || '#999' }]}>
        Adicione informações do processo relacionado a este evento.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Número do Processo</Text>
        <Input
          placeholder="Ex: 0000000-00.0000.0.00.0000"
          value={data.numeroProcesso || ''}
          onChangeText={(value) => onUpdate({ numeroProcesso: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="default"
          accessibilityLabel="Número do processo"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Vara/Tribunal</Text>
        <Input
          placeholder="Ex: 2ª Vara Cível"
          value={data.vara || ''}
          onChangeText={(value) => onUpdate({ vara: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          accessibilityLabel="Vara ou tribunal"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Prioridade</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.grey5 || '#e0e0e0' }]}>
          <Picker
            selectedValue={data.prioridade || ''}
            onValueChange={(value) => onUpdate({ prioridade: value })}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
            accessibilityLabel="Prioridade do evento"
          >
            {priorities.map((priority) => (
              <Picker.Item key={priority.value} label={priority.label} value={priority.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Observações Processuais</Text>
        <Input
          placeholder="Observações sobre o processo"
          value={data.observacoes || ''}
          onChangeText={(value) => onUpdate({ observacoes: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Observações processuais"
        />
      </View>

      <View style={styles.formGroup}>
        <CheckBox
          title="Requer presença obrigatória"
          checked={data.presencaObrigatoria || false}
          onPress={() => onUpdate({ presencaObrigatoria: !(data.presencaObrigatoria || false) })}
          containerStyle={[styles.checkboxContainer, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
          textStyle={{ color: theme.colors.text }}
          checkedColor={theme.colors.primary}
          accessibilityLabel="Requer presença obrigatória"
        />
      </View>

      <View style={styles.formGroup}>
        <CheckBox
          title="Configurar lembretes"
          checked={data.lembretes || false}
          onPress={() => onUpdate({ lembretes: !(data.lembretes || false) })}
          containerStyle={[styles.checkboxContainer, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
          textStyle={{ color: theme.colors.text }}
          checkedColor={theme.colors.primary}
          accessibilityLabel="Configurar lembretes"
        />
      </View>
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
  checkboxContainer: {
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 10,
  },
});

export default ProcessDetailsStep;
