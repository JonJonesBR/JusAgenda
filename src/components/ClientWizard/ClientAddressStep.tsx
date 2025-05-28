import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Client, ClientAddress } from '../../types/client';
import MaskInput from 'react-native-mask-input';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ClientAddressStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
  readOnly?: boolean;
}

const ClientAddressStep: React.FC<ClientAddressStepProps> = ({
  data,
  onUpdate,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const [loadingCep, setLoadingCep] = useState(false);

  const buscarCep = async () => {
    const cepInput = data.endereco?.cep;
    if (!cepInput) {
        Toast.show({ type: 'info', text1: 'CEP não informado' });
        return;
    }
    const cep = cepInput.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
      Toast.show({
        type: 'error',
        text1: 'CEP inválido',
        text2: 'Digite um CEP válido com 8 dígitos.',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const enderecoData = await response.json();

      if (enderecoData.erro) {
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Verifique o CEP digitado.',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        onUpdate({
          ...data,
          endereco: {
            ...(data.endereco || {}),
            logradouro: enderecoData.logradouro || data.endereco?.logradouro || '',
            bairro: enderecoData.bairro || data.endereco?.bairro || '',
            cidade: enderecoData.localidade || data.endereco?.cidade || '',
            estado: enderecoData.uf || data.endereco?.estado || '',
            cep: cepInput,
            numero: data.endereco?.numero || '',
            complemento: data.endereco?.complemento || '',
          } as ClientAddress,
        });
        Toast.show({
          type: 'success',
          text1: 'CEP Encontrado!',
          text2: 'Endereço preenchido automaticamente.',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar CEP',
        text2: 'Verifique sua conexão com a internet.',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setLoadingCep(false);
    }
  };

  const updateAddressField = (field: keyof ClientAddress, value: string) => {
    if (readOnly) return;
    onUpdate({
      ...data,
      endereco: {
        ...(data.endereco || {}),
        [field]: value,
      } as ClientAddress,
    });
  };

  const currentAddress: ClientAddress = data.endereco || {
    logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Endereço
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || '#86939e' }]}>
        {data.tipo === 'pessoaFisica'
          ? 'Informe o endereço residencial do cliente.'
          : 'Informe o endereço da empresa.'}
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>CEP</Text>
        <View style={styles.cepContainer}>
          <Input
            placeholder="00000-000"
            containerStyle={styles.cepInputContainer}
            inputContainerStyle={styles.inputSubContainer}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="numeric"
            accessibilityLabel="CEP"
            returnKeyType={readOnly ? "done" : "search"}
            editable={!readOnly}
            InputComponent={(props: any) => (
              <MaskInput
                {...props}
                value={currentAddress.cep}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onChangeText={(masked, _unmasked) => { // Adicionado comentário para desabilitar a regra nesta linha
                  updateAddressField('cep', masked);
                }}
                mask={'[0-9]{5}-[0-9]{3}'}
              />
            )}
          />
          {!readOnly && (
            <Button
              title="Buscar"
              onPress={buscarCep}
              buttonStyle={[styles.cepButton, { backgroundColor: theme.colors.primary }]}
              titleStyle={{color: theme.colors.onPrimary}}
              loading={loadingCep}
              disabled={loadingCep || readOnly}
              accessibilityLabel="Buscar endereço pelo CEP"
            />
          )}
        </View>
      </View>

      {/* Restante dos campos de Input como antes */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Logradouro</Text>
        <Input
          placeholder="Rua, Avenida, etc."
          value={currentAddress.logradouro}
          onChangeText={(value) => updateAddressField('logradouro', value)}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputSubContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Logradouro"
          returnKeyType="next"
          editable={!readOnly}
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.formGroup, styles.smallInput]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Número</Text>
          <Input
            placeholder="Nº"
            value={currentAddress.numero}
            onChangeText={(value) => updateAddressField('numero', value)}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputSubContainer}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="numeric"
            accessibilityLabel="Número"
            returnKeyType="next"
            editable={!readOnly}
          />
        </View>

        <View style={[styles.formGroup, styles.largeInput]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Complemento</Text>
          <Input
            placeholder="Apto, Bloco, etc."
            value={currentAddress.complemento}
            onChangeText={(value) => updateAddressField('complemento', value)}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputSubContainer}
            inputStyle={{ color: theme.colors.text }}
            accessibilityLabel="Complemento"
            returnKeyType="next"
            editable={!readOnly}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Bairro</Text>
        <Input
          placeholder="Bairro"
          value={currentAddress.bairro}
          onChangeText={(value) => updateAddressField('bairro', value)}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputSubContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Bairro"
          returnKeyType="next"
          editable={!readOnly}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Cidade</Text>
        <Input
          placeholder="Cidade"
          value={currentAddress.cidade}
          onChangeText={(value) => updateAddressField('cidade', value)}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputSubContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Cidade"
          returnKeyType="next"
          editable={!readOnly}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Estado (UF)</Text>
        <Input
          placeholder="UF"
          value={currentAddress.estado}
          onChangeText={(value) => updateAddressField('estado', value.toUpperCase())}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputSubContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="characters"
          maxLength={2}
          accessibilityLabel="Estado (UF)"
          returnKeyType="done"
          editable={!readOnly}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Ponto de Referência</Text>
        <Input
          placeholder="Ponto de referência (opcional)"
          value={data.pontoReferencia || ''}
          onChangeText={(value) => onUpdate({ ...data, pontoReferencia: value })}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputSubContainerMultiline}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          accessibilityLabel="Ponto de referência"
          editable={!readOnly}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cepButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cepContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cepInputContainer: {
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 5,
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
  inputSubContainerMultiline: {
    borderBottomWidth: 1,
    minHeight: 60,
    paddingBottom: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  largeInput: {
    flex: 2,
  },
  rowContainer: {
    flexDirection: 'row',
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
  smallInput: {
    flex: 1,
    marginRight: 10,
  },
});

export default ClientAddressStep;
