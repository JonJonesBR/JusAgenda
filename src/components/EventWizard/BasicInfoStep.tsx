// src/components/EventWizard/BasicInfoStep.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Usando o Picker da comunidade
import { Input, Section } from '../ui'; // Assumindo que Section e Input estão em ui
import CustomDateTimePicker, { CustomDateTimePickerEvent } from '../CustomDateTimePicker';
import { EventWizardFormData } from './index'; // Tipo dos dados do formulário
import { Theme } from '../../contexts/ThemeContext'; // Tipo do tema
import { EVENT_TYPES, EventTypeValue } from '../../constants'; // Tipos de evento

interface BasicInfoStepProps {
  formData: EventWizardFormData;
  updateField: (field: keyof EventWizardFormData, value: any) => void;
  errors: Partial<Record<keyof EventWizardFormData, string>>;
  isReadOnly: boolean;
  theme: Theme; // Recebe o tema como prop
  eventTypes: Record<EventTypeValue, string>; // Labels dos tipos de evento
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  updateField,
  errors,
  isReadOnly,
  theme,
  eventTypes,
}) => {
  const handleDateChange = (event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      updateField('data', selectedDate);
      // Se 'isAllDay' for verdadeiro e a data mudar, talvez queira limpar a hora
      if (formData.isAllDay) {
        updateField('hora', null);
      }
    } else if (event.type === 'dismissed') {
      // O utilizador cancelou a seleção (Android)
      // Pode querer não fazer nada ou reverter para o valor anterior se necessário
    }
  };

  const handleTimeChange = (event: CustomDateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === 'set' && selectedTime) {
      updateField('hora', selectedTime);
    } else if (event.type === 'dismissed') {
      // O utilizador cancelou a seleção (Android)
    }
  };

  const handleIsAllDayChange = (value: boolean) => {
    updateField('isAllDay', value);
    if (value) {
      // Se for o dia todo, limpa a hora
      updateField('hora', null);
    }
  };

  // Estilos para o Picker, para que se assemelhe ao Input
  const pickerContainerStyle = {
    borderColor: errors.eventType ? theme.colors.error : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    marginBottom: errors.eventType ? 0 : theme.spacing.md, // Ajusta margem se houver erro
    minHeight: Platform.OS === 'ios' ? undefined : 50, // Altura mínima no Android para consistência
    justifyContent: 'center', // Centraliza o item do Picker no Android
  };

  const pickerStyle = {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
    // No iOS, o Picker pode precisar de mais estilização para o item em si,
    // o que pode ser feito com itemStyle, mas é limitado.
  };

  return (
    <View style={styles.container}>
      <Input
        label="Título do Evento *"
        placeholder="Ex: Reunião com cliente X"
        value={formData.title || ''}
        onChangeText={(text) => updateField('title', text)}
        error={errors.title}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        Tipo de Evento *
      </Text>
      <View style={pickerContainerStyle}>
        <Picker
          selectedValue={formData.eventType}
          onValueChange={(itemValue) => updateField('eventType', itemValue)}
          enabled={!isReadOnly}
          style={pickerStyle}
          dropdownIconColor={theme.colors.placeholder} // Cor do ícone do dropdown (Android)
          prompt="Selecione o tipo de evento" // Prompt para Android
        >
          {Object.entries(eventTypes).map(([key, label]) => (
            <Picker.Item key={key} label={label} value={key as EventTypeValue} />
          ))}
        </Picker>
      </View>
      {errors.eventType && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.eventType}</Text>}


      <View style={styles.dateTimeRow}>
        <View style={styles.datePickerContainer}>
          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            Data *
          </Text>
          <CustomDateTimePicker
            value={formData.data || new Date()} // Garante que value nunca seja null/undefined para o picker
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={handleDateChange}
            disabled={isReadOnly}
            // style={{ marginBottom: theme.spacing.md }} // Adicionado espaçamento
            // textStyle para o TouchableOpacity, se não usar customTrigger
          />
          {errors.data && <Text style={[styles.errorText, { color: theme.colors.error, marginTop: theme.spacing.xs }]}>{errors.data}</Text>}
        </View>

        {!formData.isAllDay && (
          <View style={styles.timePickerContainer}>
            <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
              Hora
            </Text>
            <CustomDateTimePicker
              value={formData.hora || new Date() } // Usa new Date() se hora for null para o picker não quebrar
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              disabled={isReadOnly || formData.isAllDay}
              // style={{ marginBottom: theme.spacing.md }}
            />
            {errors.hora && <Text style={[styles.errorText, { color: theme.colors.error, marginTop: theme.spacing.xs }]}>{errors.hora}</Text>}
          </View>
        )}
      </View>
      {/* Espaçamento após a linha de data/hora e antes do switch "Dia todo" */}
      <View style={{ marginBottom: (errors.data || errors.hora) ? 0 : theme.spacing.md }} />


      <View style={[styles.switchRow, { marginBottom: theme.spacing.md }]}>
        <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, flex:1 }]}>
          Dia Todo?
        </Text>
        <Switch
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={formData.isAllDay ? theme.colors.surface : theme.colors.surface}
          ios_backgroundColor={theme.colors.disabled}
          onValueChange={handleIsAllDayChange}
          value={!!formData.isAllDay} // Garante que é booleano
          disabled={isReadOnly}
        />
      </View>

      <Input
        label="Local"
        placeholder="Ex: Escritório, Fórum, Online"
        value={formData.local || ''}
        onChangeText={(text) => updateField('local', text)}
        error={errors.local}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      <Input
        label="Descrição / Observações"
        placeholder="Detalhes adicionais sobre o evento..."
        value={formData.description || ''}
        onChangeText={(text) => updateField('description', text)}
        error={errors.description}
        editable={!isReadOnly}
        multiline
        numberOfLines={3}
        inputStyle={{ height: 80, textAlignVertical: 'top' }} // Estilo para multiline
        containerStyle={styles.inputSpacing}
      />

      {/* Campo para cor do evento - poderia ser um color picker */}
      <Input
        label="Cor do Evento (Hex)"
        placeholder="Ex: #FF0000"
        value={formData.cor || ''}
        onChangeText={(text) => updateField('cor', text)}
        error={errors.cor}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8, // Pequeno padding vertical para o conteúdo do passo
  },
  inputSpacing: {
    // marginBottom: 16, // O Input já tem marginBottom, pode não ser necessário aqui
  },
  label: {
    fontSize: 14, // Ajustado via theme.typography
    marginBottom: 6, // Ajustado via theme.spacing
    // A cor e fontFamily são definidas dinamicamente
  },
  errorText: {
    fontSize: 12, // Ajustado via theme.typography
    marginTop: 4, // Ajustado via theme.spacing
    // A cor é definida dinamicamente
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 16, // Espaçamento gerenciado pelos inputs ou pelo View abaixo
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 8, // Usar theme.spacing.sm
  },
  timePickerContainer: {
    flex: 1,
    marginLeft: 8, // Usar theme.spacing.sm
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom é definido dinamicamente
    // paddingVertical: 8, // Usar theme.spacing.sm
  },
  // Estilos para o Picker são aplicados inline para usar o tema
});

export default BasicInfoStep;
