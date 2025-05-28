// src/components/ClientWizard/ClientAddressStep.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input, Button } from '../ui'; // Seus componentes de UI
import { ClientWizardFormData } from '../../screens/ClientWizardScreen';
import { Theme } from '../../contexts/ThemeContext';
import { ClientAddress } from '../../types/client';
import MaskInput from 'react-native-mask-input';
import { APP_CONFIG } from '../../constants';
import { Toast } from '../ui/Toast';

interface ClientAddressStepProps {
  formData: ClientWizardFormData;
  // updateField: (field: keyof ClientWizardFormData, value: any) => void; // Não usado diretamente para endereços aqui
  onAddressUpdate: (index: number, field: keyof ClientAddress, value: string) => void;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  errors: Partial<Record<string, string>>; // Erros podem ser 'enderecos.0.cep', etc.
  isReadOnly: boolean;
  theme: Theme;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string; // Estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}


const ClientAddressStep: React.FC<ClientAddressStepProps> = ({
  formData,
  onAddressUpdate,
  onAddAddress,
  onRemoveAddress,
  errors,
  isReadOnly,
  theme,
}) => {
  const [loadingCep, setLoadingCep] = useState<number | null>(null); // Armazena o índice do endereço com CEP a carregar

  const enderecos = formData.enderecos || [{ cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }];

  const buscarCep = async (cep: string, index: number) => {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove não dígitos
    if (cepLimpo.length !== 8) {
      Toast.show({ type: 'error', text1: 'CEP Inválido', text2: 'O CEP deve conter 8 dígitos.' });
      return;
    }

    setLoadingCep(index);
    try {
      const response = await fetch(APP_CONFIG.VIA_CEP_URL(cepLimpo));
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        Toast.show({ type: 'error', text1: 'CEP Não Encontrado', text2: 'Verifique o CEP digitado.' });
      } else {
        onAddressUpdate(index, 'logradouro', data.logradouro || '');
        onAddressUpdate(index, 'bairro', data.bairro || '');
        onAddressUpdate(index, 'cidade', data.localidade || '');
        onAddressUpdate(index, 'estado', data.uf || '');
        // Opcional: focar no campo 'numero' após preencher
        Toast.show({ type: 'success', text1: 'CEP Encontrado!', text2: 'Endereço preenchido.' });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      Toast.show({ type: 'error', text1: 'Erro de Rede', text2: 'Não foi possível buscar o CEP.' });
    } finally {
      setLoadingCep(null);
    }
  };

  const cepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]; // 00000-000

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
      {enderecos.map((endereco, index) => (
        <View key={`address-${index}`} style={[styles.addressBlock, { borderColor: theme.colors.border }]}>
          <View style={styles.addressHeader}>
            <Text style={[styles.addressTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              Endereço {enderecos.length > 1 ? index + 1 : ''}
            </Text>
            {enderecos.length > 1 && !isReadOnly && (
              <Button
                title="Remover"
                onPress={() => onRemoveAddress(index)}
                type="clear"
                size="sm"
                icon="delete-outline"
                titleStyle={{ color: theme.colors.error }}
                iconColor={theme.colors.error}
              />
            )}
          </View>

          <Text style={[styles.label, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            CEP *
          </Text>
          <View style={styles.cepRow}>
            <View style={[
                styles.maskedInputContainer,
                {
                    borderColor: errors[`enderecos.${index}.cep`] ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radii.md,
                    flex: 1,
                    marginBottom: errors[`enderecos.${index}.cep`] ? 0 : theme.spacing.md,
                }
            ]}>
                <MaskInput
                    value={endereco.cep || ''}
                    onChangeText={(masked, unmasked) => onAddressUpdate(index, 'cep', unmasked)}
                    mask={cepMask}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    editable={!isReadOnly}
                    style={[styles.maskedInput, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}
                    placeholderTextColor={theme.colors.placeholder}
                />
            </View>
            {!isReadOnly && (
                <Button
                    onPress={() => buscarCep(endereco.cep || '', index)}
                    disabled={loadingCep === index || !endereco.cep || (endereco.cep.replace(/\D/g, '').length !== 8)}
                    loading={loadingCep === index}
                    icon="magnify"
                    type="outline"
                    size="md" // Tamanho consistente com altura do input
                    buttonStyle={styles.cepButton}
                />
            )}
          </View>
          {errors[`enderecos.${index}.cep`] && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors[`enderecos.${index}.cep`]}</Text>}


          <Input
            label="Logradouro (Rua, Av.) *"
            value={endereco.logradouro || ''}
            onChangeText={(text) => onAddressUpdate(index, 'logradouro', text)}
            error={errors[`enderecos.${index}.logradouro`]}
            editable={!isReadOnly}
            placeholder="Ex: Avenida Paulista"
          />
          <View style={styles.row}>
            <Input
              label="Número *"
              value={endereco.numero || ''}
              onChangeText={(text) => onAddressUpdate(index, 'numero', text)}
              error={errors[`enderecos.${index}.numero`]}
              editable={!isReadOnly}
              keyboardType="numeric"
              containerStyle={styles.flexInputShort}
              placeholder="Ex: 123"
            />
            <Input
              label="Complemento"
              value={endereco.complemento || ''}
              onChangeText={(text) => onAddressUpdate(index, 'complemento', text)}
              error={errors[`enderecos.${index}.complemento`]}
              editable={!isReadOnly}
              containerStyle={styles.flexInputLong}
              placeholder="Ex: Apto 10, Bloco B"
            />
          </View>
          <Input
            label="Bairro *"
            value={endereco.bairro || ''}
            onChangeText={(text) => onAddressUpdate(index, 'bairro', text)}
            error={errors[`enderecos.${index}.bairro`]}
            editable={!isReadOnly}
            placeholder="Ex: Bela Vista"
          />
          <View style={styles.row}>
            <Input
              label="Cidade *"
              value={endereco.cidade || ''}
              onChangeText={(text) => onAddressUpdate(index, 'cidade', text)}
              error={errors[`enderecos.${index}.cidade`]}
              editable={!isReadOnly}
              containerStyle={styles.flexInputLong}
              placeholder="Ex: São Paulo"
            />
            <Input
              label="Estado (UF) *"
              value={endereco.estado || ''}
              onChangeText={(text) => onAddressUpdate(index, 'estado', text.toUpperCase())}
              error={errors[`enderecos.${index}.estado`]}
              editable={!isReadOnly}
              maxLength={2}
              autoCapitalize="characters"
              containerStyle={styles.flexInputShort}
              placeholder="Ex: SP"
            />
          </View>
           {/* Opcional: Switch para Endereço Principal */}
           {/* <View style={[styles.switchRow, { marginVertical: theme.spacing.md }]}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, flex:1, marginBottom: 0 }]}>
                    Endereço Principal?
                </Text>
                <Switch
                    trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                    thumbColor={endereco.isPrincipal ? theme.colors.surface : theme.colors.surface}
                    ios_backgroundColor={theme.colors.disabled}
                    onValueChange={(value) => onAddressUpdate(index, 'isPrincipal', value)}
                    value={!!endereco.isPrincipal}
                    disabled={isReadOnly}
                />
            </View> */}
        </View>
      ))}

      {!isReadOnly && (
        <Button
          title="Adicionar Outro Endereço"
          onPress={onAddAddress}
          type="outline"
          icon="plus-circle-outline"
          buttonStyle={styles.addAddressButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  addressBlock: {
    marginBottom: 24, // Usar theme.spacing.lg
    paddingBottom: 16, // Usar theme.spacing.md
    borderBottomWidth: 1,
    // borderColor é dinâmico
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Usar theme.spacing.sm ou md
  },
  addressTitle: {
    fontSize: 18, // Usar theme.typography.fontSize.lg
    // Cor e fontFamily são dinâmicas
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    // Cor e fontFamily são dinâmicas
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    // Cor é dinâmica
  },
  cepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Alinha o botão com o topo do input
    // marginBottom: 16, // Gerenciado pelo MaskInput ou erro
  },
  cepButton: {
    marginLeft: 8, // Usar theme.spacing.sm
    height: 50, // Altura consistente com o input de CEP
    paddingHorizontal: 12, // Ajuste para o ícone
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexInputShort: {
    flex: 1, // Ou um valor menor como 0.3
    marginRight: 4, // Usar theme.spacing.xs
  },
  flexInputLong: {
    flex: 2, // Ou um valor maior como 0.7
    marginLeft: 4, // Usar theme.spacing.xs
  },
  addAddressButton: {
    marginTop: 16, // Usar theme.spacing.md
  },
  maskedInputContainer: { // Duplicado de ClientDocumentsStep, pode ser globalizado
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: Platform.OS === 'ios' ? 48 : 50,
    justifyContent: 'center',
  },
  maskedInput: { // Duplicado de ClientDocumentsStep
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
  },
   switchRow: { // Duplicado de ClientBasicInfoStep
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default ClientAddressStep;
