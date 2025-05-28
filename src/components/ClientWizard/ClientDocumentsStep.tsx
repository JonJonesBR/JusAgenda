// src/components/ClientWizard/ClientDocumentsStep.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Input } from '../ui';
import { ClientWizardFormData } from '../../screens/ClientWizardScreen'; // Tipo dos dados do formulário
import { Theme } from '../../contexts/ThemeContext'; // Tipo do tema
import MaskInput from 'react-native-mask-input'; // Para máscaras de CPF/CNPJ
import { REGEX_PATTERNS } from '../../constants'; // Para as máscaras e validações

interface ClientDocumentsStepProps {
  formData: ClientWizardFormData;
  updateField: (field: keyof ClientWizardFormData, value: any) => void;
  errors: Partial<Record<keyof ClientWizardFormData, string>>;
  isReadOnly: boolean;
  theme: Theme;
}

const ClientDocumentsStep: React.FC<ClientDocumentsStepProps> = ({
  formData,
  updateField,
  errors,
  isReadOnly,
  theme,
}) => {

  // Máscaras para CPF e CNPJ
  const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]; // 000.000.000-00
  const cnpjMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]; // 00.000.000/0000-00

  // Estilos para os MaskInput containers, para que se assemelhem ao Input
  const maskedInputContainerStyle = (hasError?: boolean) => ({
    borderColor: hasError ? theme.colors.error : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    minHeight: Platform.OS === 'ios' ? 48 : 50, // Altura consistente com Input
    justifyContent: 'center',
    marginBottom: hasError ? 0 : theme.spacing.md,
  });

  const maskedInputStyle = {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
    paddingVertical: Platform.OS === 'ios' ? (theme.spacing.sm + 2) : 0, // Ajuste para iOS
  };


  return (
    <View style={styles.container}>
      {formData.tipo === 'pessoaFisica' && (
        <>
          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            CPF *
          </Text>
          <View style={maskedInputContainerStyle(!!errors.cpf)}>
            <MaskInput
              value={formData.cpf || ''}
              onChangeText={(masked, unmasked) => updateField('cpf', unmasked)} // Salva o valor não mascarado para validação
              mask={cpfMask}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              editable={!isReadOnly}
              style={maskedInputStyle}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          {errors.cpf && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.cpf}</Text>}

          <Input
            label="RG"
            placeholder="Número do RG"
            value={formData.rg || ''}
            onChangeText={(text) => updateField('rg', text)}
            error={errors.rg}
            editable={!isReadOnly}
            keyboardType="numeric" // Ou default, dependendo do formato do RG
            containerStyle={styles.inputSpacing}
          />
          {/* Adicionar outros campos de Pessoa Física se necessário, como Órgão Emissor, Data de Emissão */}
        </>
      )}

      {formData.tipo === 'pessoaJuridica' && (
        <>
          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            CNPJ *
          </Text>
          <View style={maskedInputContainerStyle(!!errors.cnpj)}>
            <MaskInput
              value={formData.cnpj || ''}
              onChangeText={(masked, unmasked) => updateField('cnpj', unmasked)} // Salva o valor não mascarado
              mask={cnpjMask}
              placeholder="00.000.000/0000-00"
              keyboardType="numeric"
              editable={!isReadOnly}
              style={maskedInputStyle}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          {errors.cnpj && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.cnpj}</Text>}

          <Input
            label="Inscrição Estadual"
            placeholder="Número da Inscrição Estadual"
            value={formData.inscricaoEstadual || ''}
            // @ts-ignore // formData pode não ter inscricaoEstadual se tipo for PF, mas aqui é PJ
            onChangeText={(text) => updateField('inscricaoEstadual', text)}
            // @ts-ignore
            error={errors.inscricaoEstadual}
            editable={!isReadOnly}
            keyboardType="numeric" // Ou default
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Inscrição Municipal"
            placeholder="Número da Inscrição Municipal"
            // @ts-ignore
            value={formData.inscricaoMunicipal || ''}
            // @ts-ignore
            onChangeText={(text) => updateField('inscricaoMunicipal', text)}
            // @ts-ignore
            error={errors.inscricaoMunicipal}
            editable={!isReadOnly}
            keyboardType="numeric" // Ou default
            containerStyle={styles.inputSpacing}
          />
        </>
      )}
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
  // Estilos para MaskInput são aplicados inline
});

export default ClientDocumentsStep;
