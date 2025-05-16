import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text, CheckBox } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import { Picker } from '@react-native-picker/picker';

const componentColors = {
  transparent: 'transparent',
  defaultTextGrey: '#999999',
  defaultSurface: '#FFFFFF',
  defaultBorderGrey: '#E0E0E0',
};

interface ProcessDetailsStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
}

const ProcessDetailsStep: React.FC<ProcessDetailsStepProps> = ({
  data,
  onUpdate,
}) => {
  const { theme } = useTheme();

  const priorities = [
    { label: 'Selecione a prioridade', value: '' },
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Urgente', value: 'urgente' },
  ];

  const handleFieldUpdate = (updates: Partial<Event>) => {
    onUpdate({ ...data, ...updates });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Detalhes Processuais
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || componentColors.defaultTextGrey }]}>
        Adicione informações do processo relacionado a este evento, se houver.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Número do Processo</Text>
        <Input
          placeholder="Ex: 0000000-00.0000.0.00.0000"
          value={data.numeroProcesso || ''}
          onChangeText={(value) => handleFieldUpdate({ numeroProcesso: value })}
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
          placeholder="Ex: 2ª Vara Cível de Comarca X"
          value={data.vara || ''}
          onChangeText={(value) => handleFieldUpdate({ vara: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Vara ou tribunal"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Prioridade</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background || componentColors.defaultSurface, borderColor: theme.colors.border || componentColors.defaultBorderGrey }]}>
          <Picker
            selectedValue={data.prioridade || ''}
            onValueChange={(value) => handleFieldUpdate({ prioridade: value })}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
            accessibilityLabel="Prioridade do evento"
            prompt="Selecione a Prioridade"
          >
            {priorities.map((priorityOption) => (
              <Picker.Item key={priorityOption.value} label={priorityOption.label} value={priorityOption.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Observações Processuais</Text>
        <Input
          placeholder="Detalhes importantes sobre o andamento ou particularidades do processo"
          value={data.observacoes || ''}
          onChangeText={(value) => handleFieldUpdate({ observacoes: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Observações processuais"
        />
      </View>

      <View style={styles.checkboxGroup}>
        <CheckBox
          title="Requer presença obrigatória"
          checked={!!data.presencaObrigatoria}
          onPress={() => handleFieldUpdate({ presencaObrigatoria: !data.presencaObrigatoria })}
          containerStyle={styles.checkboxContainer}
          textStyle={[styles.checkboxText, { color: theme.colors.text }]}
          checkedColor={theme.colors.primary}
          accessibilityLabel="Marcar se requer presença obrigatória"
          iconType="material-community"
          checkedIcon="checkbox-marked-outline"
          uncheckedIcon="checkbox-blank-outline"
        />
      </View>

      <View style={styles.checkboxGroup}>
        <CheckBox
          title="Configurar lembretes para este evento"
          checked={!!data.lembretes} 
          onPress={() => handleFieldUpdate({ lembretes: data.lembretes ? undefined : [] })}
          containerStyle={styles.checkboxContainer}
          textStyle={[styles.checkboxText, { color: theme.colors.text }]}
          checkedColor={theme.colors.primary}
          accessibilityLabel="Configurar lembretes para o evento"
          iconType="material-community"
          checkedIcon="bell-check-outline"
          uncheckedIcon="bell-outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    backgroundColor: componentColors.transparent,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
  },
  checkboxGroup: {
    marginBottom: 10,
  },
  checkboxText: {
    marginLeft: 8,
  },
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
  },
});

export default ProcessDetailsStep;
