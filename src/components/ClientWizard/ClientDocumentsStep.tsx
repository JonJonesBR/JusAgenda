import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text } from '@rneui/themed'; // @rneui/base não é necessário aqui se não usar componentes específicos dele
import { useTheme } from '../../contexts/ThemeContext';
import { Client } from '../../screens/ClientWizardScreen'; // Reintroduzido Client para tipagem

// Tente instalar @types/react-native-masked-text
// Se instalado, o @ts-ignore pode não ser mais necessário.
// Se ainda der erro de tipo mesmo com @types, então o @ts-ignore pode permanecer.
import MaskInput from 'react-native-mask-input';

interface ClientDocumentsStepProps {
  data: Partial<Client>; // Usando Partial<Client>
  onUpdate: (data: Partial<Client>) => void;
  // isEditMode?: boolean; // Removido, pois não está sendo usado
}

/**
 * Segundo passo do wizard de cliente - Documentos
 */
const ClientDocumentsStep: React.FC<ClientDocumentsStepProps> = ({
  data,
  onUpdate,
  // isEditMode = false, // Removido, pois não está sendo usado
}) => {
  const { theme } = useTheme();

  // Função para simplificar a atualização, preservando 'data'
  const handleFieldUpdate = (field: keyof Client, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Documentos
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
        {data.tipo === 'pessoaFisica'
          ? 'Informe os documentos pessoais do cliente.'
          : 'Informe os documentos da empresa.'}
      </Text>

      {data.tipo === 'pessoaFisica' ? (
        // Campos para Pessoa Física
        <>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>CPF</Text>
            <Input
              placeholder="000.000.000-00"
              value={data.cpf || ''}
              onChangeText={(value) => handleFieldUpdate('cpf', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="CPF do cliente"
              returnKeyType="next"
              InputComponent={(props) => (
                <MaskInput
                  {...props}
                  mask={'[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}'}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>RG</Text>
            <Input
              placeholder="00.000.000-0" // Considere adicionar máscara para RG também se desejar
              value={data.rg || ''}
              onChangeText={(value) => handleFieldUpdate('rg', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="RG do cliente"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Órgão Emissor</Text>
            <Input
              placeholder="SSP/UF"
              value={data.orgaoEmissor || ''}
              onChangeText={(value) => handleFieldUpdate('orgaoEmissor', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="characters"
              accessibilityLabel="Órgão emissor do RG"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Profissão</Text>
            <Input
              placeholder="Profissão do cliente"
              value={data.profissao || ''}
              onChangeText={(value) => handleFieldUpdate('profissao', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="words"
              accessibilityLabel="Profissão do cliente"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Estado Civil</Text>
            <Input // Considere usar um Picker aqui para opções padronizadas
              placeholder="Estado civil do cliente"
              value={data.estadoCivil || ''}
              onChangeText={(value) => handleFieldUpdate('estadoCivil', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="words"
              accessibilityLabel="Estado civil do cliente"
              returnKeyType="next"
            />
          </View>
        </>
      ) : (
        // Campos para Pessoa Jurídica
        <>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>CNPJ</Text>
            <Input
              placeholder="00.000.000/0000-00"
              value={data.cnpj || ''}
              onChangeText={(value) => handleFieldUpdate('cnpj', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="CNPJ da empresa"
              returnKeyType="next"
              InputComponent={(props) => (
                <MaskInput
                  {...props}
                  mask={'[0-9]{2}.[0-9]{3}.[0-9]{3}/[0-9]{4}-[0-9]{2}'}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Inscrição Estadual</Text>
            <Input
              placeholder="Inscrição Estadual (se houver)"
              value={data.inscricaoEstadual || ''}
              onChangeText={(value) => handleFieldUpdate('inscricaoEstadual', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="Inscrição estadual da empresa"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Inscrição Municipal</Text>
            <Input
              placeholder="Inscrição Municipal (se houver)"
              value={data.inscricaoMunicipal || ''}
              onChangeText={(value) => handleFieldUpdate('inscricaoMunicipal', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="Inscrição municipal da empresa"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Ramo de Atividade</Text>
            <Input
              placeholder="Ramo de atividade da empresa"
              value={data.ramoAtividade || ''}
              onChangeText={(value) => handleFieldUpdate('ramoAtividade', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="sentences"
              accessibilityLabel="Ramo de atividade da empresa"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Responsável Legal</Text>
            <Input
              placeholder="Nome do responsável legal"
              value={data.responsavelLegal || ''}
              onChangeText={(value) => handleFieldUpdate('responsavelLegal', value)}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="words"
              accessibilityLabel="Nome do responsável legal"
              returnKeyType="next"
            />
          </View>
        </>
      )}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Documentos Adicionais</Text>
        <Input
          placeholder="Informações sobre documentos adicionais"
          value={data.documentosAdicionais || ''}
          onChangeText={(value) => handleFieldUpdate('documentosAdicionais', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          accessibilityLabel="Documentos adicionais"
        />
      </View>
    </ScrollView>
  );
};

// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
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
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ClientDocumentsStep;
