import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Input, Text, Button, CheckBox } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Client } from '../../screens/ClientWizardScreen';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';

const componentColors = {
  transparent: 'transparent',
  defaultTextGrey: '#86939e', // Fallback for grey2
  defaultBorderGrey: '#D3D3D3', // Fallback for grey5 (light grey)
};

interface ClientBasicInfoStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
}

const ClientBasicInfoStep: React.FC<ClientBasicInfoStepProps> = ({
  data,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    if (selectedDate) {
      onUpdate({ ...data, dataNascimento: moment(selectedDate).format('YYYY-MM-DD') });
    }
    if (event.type === "dismissed" && Platform.OS === 'ios') {
        setShowDatePicker(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Informações Básicas do Cliente
      </Text>
      <Text style={[styles.sectionDescription, { color: componentColors.defaultTextGrey }]}>
        Preencha os dados básicos do cliente para começar o cadastro.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Tipo de Cliente *
        </Text>
        <View style={styles.radioGroup}>
          <CheckBox
            title="Pessoa Física"
            checked={data.tipo === 'pessoaFisica'}
            onPress={() => onUpdate({ ...data, tipo: 'pessoaFisica' })}
            containerStyle={[
              styles.radioButton,
              styles.transparentRadioButton
            ]}
            textStyle={{ color: theme.colors.text }}
            checkedColor={theme.colors.primary}
            accessibilityLabel="Selecionar pessoa física"
          />
          <CheckBox
            title="Pessoa Jurídica"
            checked={data.tipo === 'pessoaJuridica'}
            onPress={() => onUpdate({ ...data, tipo: 'pessoaJuridica' })}
            containerStyle={[
              styles.radioButton,
              styles.transparentRadioButton
            ]}
            textStyle={{ color: theme.colors.text }}
            checkedColor={theme.colors.primary}
            accessibilityLabel="Selecionar pessoa jurídica"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {data.tipo === 'pessoaJuridica' ? 'Razão Social *' : 'Nome Completo *'}
        </Text>
        <Input
          placeholder={data.tipo === 'pessoaJuridica' ? "Digite a razão social" : "Digite o nome completo"}
          value={data.nome || ''}
          onChangeText={(value) => onUpdate({ ...data, nome: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel={data.tipo === 'pessoaJuridica' ? "Razão social da empresa" : "Nome completo do cliente"}
          returnKeyType="next"
        />
      </View>

      {data.tipo === 'pessoaJuridica' && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Nome Fantasia
          </Text>
          <Input
            placeholder="Digite o nome fantasia"
            value={data.nomeFantasia || ''}
            onChangeText={(value) => onUpdate({ ...data, nomeFantasia: value })}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.text }}
            autoCapitalize="words"
            accessibilityLabel="Nome fantasia da empresa"
            returnKeyType="next"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
        <Input
          placeholder="Digite o email"
          value={data.email || ''}
          onChangeText={(value) => onUpdate({ ...data, email: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email do cliente"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Telefone</Text>
        <Input
          placeholder="Digite o telefone"
          value={data.telefone || ''}
          onChangeText={(value) => onUpdate({ ...data, telefone: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="phone-pad"
          accessibilityLabel="Telefone do cliente"
          returnKeyType="next"
        />
      </View>

      {data.tipo === 'pessoaFisica' && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Data de Nascimento
          </Text>
          <Button
            title={data.dataNascimento ? moment(data.dataNascimento, "YYYY-MM-DD").format('DD/MM/YYYY') : 'Selecionar data'}
            type="outline"
            buttonStyle={[styles.dateButton, { borderColor: componentColors.defaultBorderGrey }]}
            titleStyle={{ color: theme.colors.text }}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Selecionar data de nascimento"
            icon={{
              name: 'calendar',
              type: 'material-community',
              color: theme.colors.text,
            }}
            iconPosition="left"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Observações</Text>
        <Input
          placeholder="Observações sobre o cliente"
          value={data.observacoes || ''}
          onChangeText={(value) => onUpdate({ ...data, observacoes: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          accessibilityLabel="Observações sobre o cliente"
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={data.dataNascimento ? moment(data.dataNascimento, "YYYY-MM-DD").toDate() : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  dateButton: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioButton: {
    margin: 0,
    marginLeft: 0,
    marginRight: 20,
    padding: 0,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transparentRadioButton: {
    backgroundColor: componentColors.transparent,
    borderWidth: 0,
  },
});

export default ClientBasicInfoStep;
