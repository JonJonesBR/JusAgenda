import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { Input, Button, CheckBox } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Client } from '../../types/client';
import CustomDateTimePicker, { CustomDateTimePickerEvent } from '../CustomDateTimePicker';
import { format, parse, isValid as isDateValid } from 'date-fns';
import { formatDate as formatDateUtil } from '../../utils/dateUtils';
import MaskInput from 'react-native-mask-input';

interface ClientBasicInfoStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
  readOnly?: boolean;
}

const ClientBasicInfoStep: React.FC<ClientBasicInfoStepProps> = ({
  data,
  onUpdate,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate && isDateValid(selectedDate)) {
      onUpdate({ ...data, dataNascimento: format(selectedDate, 'yyyy-MM-dd') });
    }
    setShowDatePicker(false);
  };

  let initialDateForPicker: Date | undefined = undefined;
  if (data.dataNascimento) {
    const parsedDate = parse(data.dataNascimento, 'yyyy-MM-dd', new Date());
    if (isDateValid(parsedDate)) {
      initialDateForPicker = parsedDate;
    }
  }
  if (!initialDateForPicker) {
    const fallbackDate = new Date();
    fallbackDate.setFullYear(fallbackDate.getFullYear() - 18);
    initialDateForPicker = fallbackDate;
  }

  return (
    <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Informações Básicas
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || '#86939e' }]}>
        Preencha os dados principais do cliente.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de Cliente</Text>
        <View style={styles.radioContainer}>
          <CheckBox
            title="Pessoa Física"
            checked={data.tipo === 'pessoaFisica'}
            onPress={() => !readOnly && onUpdate({ ...data, tipo: 'pessoaFisica', cnpj: undefined, nomeFantasia: undefined })}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            containerStyle={[styles.checkboxContainer, { backgroundColor: theme.colors.transparent }]} // Aplicando via tema
            textStyle={{ color: theme.colors.text }}
            disabled={readOnly}
          />
          <CheckBox
            title="Pessoa Jurídica"
            checked={data.tipo === 'pessoaJuridica'}
            onPress={() => !readOnly && onUpdate({ ...data, tipo: 'pessoaJuridica', cpf: undefined, dataNascimento: undefined })}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            containerStyle={[styles.checkboxContainer, { backgroundColor: theme.colors.transparent }]} // Aplicando via tema
            textStyle={{ color: theme.colors.text }}
            disabled={readOnly}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {data.tipo === 'pessoaFisica' ? 'Nome Completo' : 'Razão Social'}
        </Text>
        <Input
          placeholder={data.tipo === 'pessoaFisica' ? 'Nome completo do cliente' : 'Razão Social da empresa'}
          value={data.nome}
          onChangeText={(value) => onUpdate({ ...data, nome: value })}
          inputStyle={{ color: theme.colors.text }}
          containerStyle={styles.inputContainer}
          inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
          autoCapitalize="words"
          editable={!readOnly}
        />
      </View>

      {data.tipo === 'pessoaJuridica' && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nome Fantasia</Text>
          <Input
            placeholder="Nome fantasia da empresa"
            value={data.nomeFantasia || ''}
            onChangeText={(value) => onUpdate({ ...data, nomeFantasia: value })}
            inputStyle={{ color: theme.colors.text }}
            containerStyle={styles.inputContainer}
            inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
            autoCapitalize="words"
            editable={!readOnly}
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>E-mail (Opcional)</Text>
        <Input
          placeholder="email@example.com"
          value={data.email || ''}
          onChangeText={(value) => onUpdate({ ...data, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
          inputStyle={{ color: theme.colors.text }}
          containerStyle={styles.inputContainer}
          inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
          editable={!readOnly}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Telefone (Opcional)</Text>
         <Input
            placeholder="(00) 00000-0000"
            containerStyle={styles.inputContainer}
            inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="phone-pad"
            accessibilityLabel="Telefone"
            editable={!readOnly}
            InputComponent={(props: any) => (
                <MaskInput
                    {...props}
                    value={data.telefone || ''}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onChangeText={(masked, _unmasked) => {
                        onUpdate({ ...data, telefone: masked });
                    }}
                    mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                />
            )}
        />
      </View>

      {data.tipo === 'pessoaFisica' && (
        <>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Data de Nascimento (Opcional)</Text>
            <Button
              title={data.dataNascimento ? formatDateUtil(data.dataNascimento, 'dd/MM/yyyy') : 'Selecionar Data'}
              onPress={() => !readOnly && setShowDatePicker(true)}
              icon={{ name: 'calendar', type: 'font-awesome', color: theme.colors.onPrimary }}
              buttonStyle={[styles.dateButton, { backgroundColor: theme.colors.primary }]}
              titleStyle={{color: theme.colors.onPrimary}}
              disabled={readOnly}
            />
          </View>

          {showDatePicker && (
            <CustomDateTimePicker
              value={initialDateForPicker || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              onClose={() => setShowDatePicker(false)}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Profissão (Opcional)</Text>
            <Input
              placeholder="Profissão do cliente"
              value={data.profissao || ''}
              onChangeText={(value) => onUpdate({ ...data, profissao: value })}
              inputStyle={{ color: theme.colors.text }}
              containerStyle={styles.inputContainer}
              inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
              autoCapitalize="words"
              editable={!readOnly}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Estado Civil (Opcional)</Text>
            <Input
              placeholder="Ex: Solteiro(a), Casado(a)"
              value={data.estadoCivil || ''}
              onChangeText={(value) => onUpdate({ ...data, estadoCivil: value })}
              inputStyle={{ color: theme.colors.text }}
              containerStyle={styles.inputContainer}
              inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
              autoCapitalize="words"
              editable={!readOnly}
            />
          </View>
        </>
      )}
       {data.tipo === 'pessoaJuridica' && (
        <>
            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Ramo de Atividade (Opcional)</Text>
                <Input
                    placeholder="Ex: Comércio, Serviços, Indústria"
                    value={data.ramoAtividade || ''}
                    onChangeText={(value) => onUpdate({ ...data, ramoAtividade: value })}
                    inputStyle={{ color: theme.colors.text }}
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
                    autoCapitalize="words"
                    editable={!readOnly}
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Responsável Legal (Opcional)</Text>
                <Input
                    placeholder="Nome do responsável pela empresa"
                    value={data.responsavelLegal || ''}
                    onChangeText={(value) => onUpdate({ ...data, responsavelLegal: value })}
                    inputStyle={{ color: theme.colors.text }}
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={[styles.inputSubContainer, {borderColor: theme.colors.border}]}
                    autoCapitalize="words"
                    editable={!readOnly}
                />
            </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    // Removido backgroundColor: 'transparent' daqui
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
  },
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  dateButton: {
    alignSelf: 'flex-start',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  inputSubContainer: {
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ClientBasicInfoStep;
