// src/components/EventWizard/ProcessDetailsStep.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Input } from '../ui';
import { EventWizardFormData } from './index';
import { Theme } from '../../contexts/ThemeContext';
import { PRIORIDADES, PrioridadeValue, REMINDER_OPTIONS } from '../../constants';

interface ProcessDetailsStepProps {
  formData: EventWizardFormData;
  updateField: (field: keyof EventWizardFormData, value: any) => void;
  errors: Partial<Record<keyof EventWizardFormData, string>>;
  isReadOnly: boolean;
  theme: Theme;
  prioridades: Record<PrioridadeValue, string>; // Labels das prioridades
}

const ProcessDetailsStep: React.FC<ProcessDetailsStepProps> = ({
  formData,
  updateField,
  errors,
  isReadOnly,
  theme,
  prioridades,
}) => {

  const handleReminderToggle = (reminderValue: number) => {
    const currentReminders = formData.reminders || [];
    const newReminders = currentReminders.includes(reminderValue)
      ? currentReminders.filter(r => r !== reminderValue)
      : [...currentReminders, reminderValue];
    updateField('reminders', newReminders.sort((a, b) => a - b)); // Mantém ordenado
  };

  // Estilos para o Picker de Prioridade
  const pickerContainerStyle = {
    borderColor: errors.prioridade ? theme.colors.error : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    marginBottom: errors.prioridade ? 0 : theme.spacing.md,
    minHeight: Platform.OS === 'ios' ? undefined : 50,
    justifyContent: 'center',
  };

  const pickerStyle = {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
      <Input
        label="Número do Processo"
        placeholder="Ex: 0012345-67.2024.8.26.0001"
        value={formData.numeroProcesso || ''}
        onChangeText={(text) => updateField('numeroProcesso', text)}
        error={errors.numeroProcesso}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
        keyboardType="numeric" // Ou default, dependendo do formato
      />

      <Input
        label="Vara / Tribunal"
        placeholder="Ex: 1ª Vara Cível, TJSP"
        value={formData.vara || ''}
        onChangeText={(text) => updateField('vara', text)}
        error={errors.vara}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Comarca"
        placeholder="Ex: São Paulo, Campinas"
        value={formData.comarca || ''}
        onChangeText={(text) => updateField('comarca', text)}
        error={errors.comarca}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Instância"
        placeholder="Ex: 1ª Instância, Recursal"
        value={formData.instancia || ''}
        onChangeText={(text) => updateField('instancia', text)}
        error={errors.instancia}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Natureza da Ação"
        placeholder="Ex: Cível, Criminal, Trabalhista"
        value={formData.naturezaAcao || ''}
        onChangeText={(text) => updateField('naturezaAcao', text)}
        error={errors.naturezaAcao}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Fase Processual"
        placeholder="Ex: Inicial, Instrutória, Recursal"
        value={formData.faseProcessual || ''}
        onChangeText={(text) => updateField('faseProcessual', text)}
        error={errors.faseProcessual}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Link do Processo (PJe, eSAJ, etc.)"
        placeholder="https://..."
        value={formData.linkProcesso || ''}
        onChangeText={(text) => updateField('linkProcesso', text)}
        error={errors.linkProcesso}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
        keyboardType="url"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        Prioridade
      </Text>
      <View style={pickerContainerStyle}>
        <Picker
          selectedValue={formData.prioridade}
          onValueChange={(itemValue) => updateField('prioridade', itemValue)}
          enabled={!isReadOnly}
          style={pickerStyle}
          dropdownIconColor={theme.colors.placeholder}
          prompt="Selecione a prioridade"
        >
          {Object.entries(prioridades).map(([key, label]) => (
            <Picker.Item key={key} label={label} value={key as PrioridadeValue} />
          ))}
        </Picker>
      </View>
      {errors.prioridade && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.prioridade}</Text>}

      <View style={[styles.switchRow, { marginBottom: theme.spacing.md }]}>
        <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, flex: 1 }]}>
          Presença Obrigatória?
        </Text>
        <Switch
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={formData.presencaObrigatoria ? theme.colors.surface : theme.colors.surface}
          ios_backgroundColor={theme.colors.disabled}
          onValueChange={(value) => updateField('presencaObrigatoria', value)}
          value={!!formData.presencaObrigatoria}
          disabled={isReadOnly}
        />
      </View>

      <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, marginBottom: theme.spacing.sm }]}>
        Lembretes
      </Text>
      {REMINDER_OPTIONS.map(option => (
        <View key={option.value} style={[styles.switchRow, { marginBottom: theme.spacing.sm, paddingVertical: theme.spacing.xs/2 }]}>
          <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, flex: 1, marginBottom: 0 }]}>
            {option.label}
          </Text>
          <Switch
            trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
            thumbColor={(formData.reminders || []).includes(option.value) ? theme.colors.surface : theme.colors.surface}
            ios_backgroundColor={theme.colors.disabled}
            onValueChange={() => handleReminderToggle(option.value)}
            value={(formData.reminders || []).includes(option.value)}
            disabled={isReadOnly}
          />
        </View>
      ))}
      {errors.reminders && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.reminders}</Text>}


      <Input
        label="Outras Observações"
        placeholder="Notas adicionais sobre o processo ou detalhes do evento..."
        value={formData.observacoes || ''}
        onChangeText={(text) => updateField('observacoes', text)}
        error={errors.observacoes}
        editable={!isReadOnly}
        multiline
        numberOfLines={3}
        inputStyle={{ height: 80, textAlignVertical: 'top' }}
        containerStyle={styles.inputSpacing}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Para o ScrollView ocupar espaço
  },
  scrollContentContainer: {
    paddingVertical: 8,
  },
  inputSpacing: {
    // marginBottom: 16, // O Input já tem marginBottom
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    // Cor e fontFamily são dinâmicas
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8, // Espaço extra após erro do picker
    // Cor é dinâmica
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom e paddingVertical são dinâmicos ou fixos
  },
});

export default ProcessDetailsStep;
