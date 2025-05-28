// src/components/ClientWizard/ClientBasicInfoStep.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Usando o Picker da comunidade
import { Input, Section } from '../ui';
import CustomDateTimePicker, { CustomDateTimePickerEvent } from '../CustomDateTimePicker';
import { ClientWizardFormData } from '../../screens/ClientWizardScreen'; // Tipo dos dados do formulário
import { Theme } from '../../contexts/ThemeContext'; // Tipo do tema
import MaskInput from 'react-native-mask-input'; // Para máscara de telefone

interface ClientBasicInfoStepProps {
  formData: ClientWizardFormData;
  updateField: (field: keyof ClientWizardFormData, value: any) => void;
  errors: Partial<Record<keyof ClientWizardFormData, string>>;
  isReadOnly: boolean;
  theme: Theme;
}

const ClientBasicInfoStep: React.FC<ClientBasicInfoStepProps> = ({
  formData,
  updateField,
  errors,
  isReadOnly,
  theme,
}) => {

  const handleDateChange = (field: 'dataNascimento' | 'dataFundacao', event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      updateField(field, selectedDate);
    } else if (event.type === 'dismissed') {
      // Opcional: limpar o campo se o picker for cancelado e não houver data anterior
      // updateField(field, null);
    }
  };

  const tipoClienteOptions = [
    { label: 'Pessoa Física', value: 'pessoaFisica' },
    { label: 'Pessoa Jurídica', value: 'pessoaJuridica' },
  ];

  // Estilos para o Picker
  const pickerContainerStyle = (hasError?: boolean) => ({
    borderColor: hasError ? theme.colors.error : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    marginBottom: hasError ? 0 : theme.spacing.md,
    minHeight: Platform.OS === 'ios' ? undefined : 50,
    justifyContent: 'center',
  });

  const pickerStyle = {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        Tipo de Cliente *
      </Text>
      <View style={pickerContainerStyle(!!errors.tipo)}>
        <Picker
          selectedValue={formData.tipo}
          onValueChange={(itemValue) => updateField('tipo', itemValue as 'pessoaFisica' | 'pessoaJuridica')}
          enabled={!isReadOnly}
          style={pickerStyle}
          dropdownIconColor={theme.colors.placeholder}
          prompt="Selecione o tipo de cliente"
        >
          {tipoClienteOptions.map(option => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {errors.tipo && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.tipo}</Text>}

      <Input
        label={formData.tipo === 'pessoaFisica' ? 'Nome Completo *' : 'Razão Social *'}
        placeholder={formData.tipo === 'pessoaFisica' ? 'Nome completo do cliente' : 'Razão social da empresa'}
        value={formData.nome || ''}
        onChangeText={(text) => updateField('nome', text)}
        error={errors.nome}
        editable={!isReadOnly}
        containerStyle={styles.inputSpacing}
      />

      {formData.tipo === 'pessoaJuridica' && (
        <Input
          label="Nome Fantasia"
          placeholder="Nome fantasia da empresa"
          value={formData.nomeFantasia || ''}
          onChangeText={(text) => updateField('nomeFantasia', text)}
          error={errors.nomeFantasia}
          editable={!isReadOnly}
          containerStyle={styles.inputSpacing}
        />
      )}

      <Input
        label="Email Principal"
        placeholder="email@exemplo.com"
        value={formData.email || ''}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        editable={!isReadOnly}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.inputSpacing}
      />

      {/* Telefone com Máscara */}
      <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        Telefone Principal
      </Text>
      <View style={[
          styles.maskedInputContainer,
          {
            borderColor: errors.telefonePrincipal ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.md,
          }
      ]}>
        <MaskInput
          value={formData.telefonePrincipal || ''}
          onChangeText={(masked, unmasked) => updateField('telefonePrincipal', masked)} // Salva o valor mascarado
          mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} // (99) 99999-9999
          placeholder="(XX) XXXXX-XXXX"
          keyboardType="phone-pad"
          editable={!isReadOnly}
          style={[styles.maskedInput, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      {errors.telefonePrincipal && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.telefonePrincipal}</Text>}


      {formData.tipo === 'pessoaFisica' && (
        <>
          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, marginTop: theme.spacing.md }]}>
            Data de Nascimento
          </Text>
          <CustomDateTimePicker
            value={formData.dataNascimento || new Date()} // Garante que não seja null para o picker
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={(event, date) => handleDateChange('dataNascimento', event, date)}
            disabled={isReadOnly}
            maximumDate={new Date()} // Não pode nascer no futuro
          />
          {errors.dataNascimento && <Text style={[styles.errorText, { color: theme.colors.error, marginTop: theme.spacing.xs }]}>{errors.dataNascimento}</Text>}
           <View style={{ marginBottom: (errors.dataNascimento) ? 0 : theme.spacing.md }} />


          <Input
            label="Profissão"
            placeholder="Profissão do cliente"
            value={formData.profissao || ''}
            onChangeText={(text) => updateField('profissao', text)}
            error={errors.profissao}
            editable={!isReadOnly}
            containerStyle={styles.inputSpacing}
          />
          {/* Poderia adicionar Estado Civil como Picker aqui */}
        </>
      )}

      {formData.tipo === 'pessoaJuridica' && (
        <>
          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, marginTop: theme.spacing.md }]}>
            Data de Fundação
          </Text>
          <CustomDateTimePicker
            value={formData.dataFundacao || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={(event, date) => handleDateChange('dataFundacao', event, date)}
            disabled={isReadOnly}
            maximumDate={new Date()}
          />
          {errors.dataFundacao && <Text style={[styles.errorText, { color: theme.colors.error, marginTop: theme.spacing.xs }]}>{errors.dataFundacao}</Text>}
          <View style={{ marginBottom: (errors.dataFundacao) ? 0 : theme.spacing.md }} />

          <Input
            label="Ramo de Atividade"
            placeholder="Ramo de atividade da empresa"
            value={(formData as ClientWizardFormData & { ramoAtividade?: string }).ramoAtividade || ''} // Type assertion para campo não obrigatório
            onChangeText={(text) => updateField('ramoAtividade' as any, text)} // 'as any' para campos não estritamente em ClientWizardFormData
            error={errors.ramoAtividade}
            editable={!isReadOnly}
            containerStyle={styles.inputSpacing}
          />
        </>
      )}

        <View style={[styles.switchRow, { marginVertical: theme.spacing.md }]}>
            <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, flex:1, marginBottom: 0 }]}>
            Cliente Ativo?
            </Text>
            <Switch
            trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
            thumbColor={formData.ativo ? theme.colors.surface : theme.colors.surface}
            ios_backgroundColor={theme.colors.disabled}
            onValueChange={(value) => updateField('ativo', value)}
            value={!!formData.ativo}
            disabled={isReadOnly}
            />
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 8, // Espaço extra após erro
    // Cor é dinâmica
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maskedInputContainer: {
    borderWidth: 1,
    // borderColor, backgroundColor, borderRadius são dinâmicos
    paddingHorizontal: 12, // theme.spacing.sm
    minHeight: Platform.OS === 'ios' ? 48 : 50, // Altura consistente com Input
    justifyContent: 'center',
    marginBottom: 16, // theme.spacing.md
  },
  maskedInput: {
    fontSize: 16, // theme.typography.fontSize.md
    // color, fontFamily são dinâmicos
    paddingVertical: Platform.OS === 'ios' ? 12 : 0, // Ajuste para iOS
  },
});

export default ClientBasicInfoStep;
