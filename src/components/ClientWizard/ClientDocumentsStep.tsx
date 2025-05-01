import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Text } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
// Removed unused Client import; using any for data prop

// @ts-ignore: no type declarations for react-native-masked-text
import { TextInputMask } from 'react-native-masked-text';

interface ClientDocumentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  isEditMode?: boolean;
}

/**
 * Segundo passo do wizard de cliente - Documentos
 */
const ClientDocumentsStep: React.FC<ClientDocumentsStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Documentos
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey2 }]}>
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
              onChangeText={(value) => onUpdate({ cpf: value })}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="CPF do cliente"
              returnKeyType="next"
              InputComponent={(props: any) => (
                <TextInputMask
                  {...props}
                  type={'cpf'}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>RG</Text>
            <Input
              placeholder="00.000.000-0"
              value={data.rg || ''}
              onChangeText={(value) => onUpdate({ rg: value })}
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
              onChangeText={(value) => onUpdate({ orgaoEmissor: value })}
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
              onChangeText={(value) => onUpdate({ profissao: value })}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              autoCapitalize="words"
              accessibilityLabel="Profissão do cliente"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Estado Civil</Text>
            <Input
              placeholder="Estado civil do cliente"
              value={data.estadoCivil || ''}
              onChangeText={(value) => onUpdate({ estadoCivil: value })}
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
              onChangeText={(value) => onUpdate({ cnpj: value })}
              containerStyle={styles.inputContainer}
              inputStyle={{ color: theme.colors.text }}
              keyboardType="numeric"
              accessibilityLabel="CNPJ da empresa"
              returnKeyType="next"
              InputComponent={(props: any) => (
                <TextInputMask
                  {...props}
                  type={'cnpj'}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Inscrição Estadual</Text>
            <Input
              placeholder="Inscrição Estadual (se houver)"
              value={data.inscricaoEstadual || ''}
              onChangeText={(value) => onUpdate({ inscricaoEstadual: value })}
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
              onChangeText={(value) => onUpdate({ inscricaoMunicipal: value })}
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
              onChangeText={(value) => onUpdate({ ramoAtividade: value })}
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
              onChangeText={(value) => onUpdate({ responsavelLegal: value })}
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
          onChangeText={(value) => onUpdate({ documentosAdicionais: value })}
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
});

export default ClientDocumentsStep;
