import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Input, Text, Button } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Client } from '../../screens/ClientWizardScreen';
import { TextInputMask } from 'react-native-masked-text';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ClientAddressStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
  isEditMode?: boolean;
}

/**
 * Terceiro passo do wizard de cliente - Endereço
 */
const ClientAddressStep: React.FC<ClientAddressStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Inicializar os dados de endereço se não existirem
  if (!data.endereco) {
    onUpdate({
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      }
    });
  }

  // Buscar endereço pelo CEP
  const buscarCep = async () => {
    const cep = data.endereco?.cep?.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
      Toast.show({
        type: 'error',
        text1: 'CEP inválido',
        text2: 'Digite um CEP válido com 8 dígitos',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const endereco = await response.json();
      
      if (endereco.erro) {
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Verifique o CEP digitado',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        onUpdate({
          endereco: {
            ...data.endereco,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf,
          }
        });
        
        Toast.show({
          type: 'success',
          text1: 'CEP encontrado',
          text2: 'Endereço preenchido automaticamente',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar CEP',
        text2: 'Verifique sua conexão com a internet',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo específico do endereço
  const updateAddressField = (field: string, value: string) => {
    onUpdate({
      endereco: {
        ...data.endereco,
        [field]: value
      }
    });
  };
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Endereço
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey2 }]}>
        {data.tipo === 'pessoaFisica' 
          ? 'Informe o endereço residencial do cliente.'
          : 'Informe o endereço da empresa.'}
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>CEP</Text>
        <View style={styles.cepContainer}>
          <Input
            placeholder="00000-000"
            value={data.endereco?.cep || ''}
            onChangeText={(value) => updateAddressField('cep', value)}
            containerStyle={styles.cepInput}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="numeric"
            accessibilityLabel="CEP"
            returnKeyType="search"
            InputComponent={(props) => (
              <TextInputMask
                {...props}
                type={'zip-code'}
              />
            )}
          />
          <Button
            title="Buscar"
            onPress={buscarCep}
            buttonStyle={[styles.cepButton, { backgroundColor: theme.colors.primary }]}
            loading={loading}
            disabled={loading}
            accessibilityLabel="Buscar endereço pelo CEP"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Logradouro</Text>
        <Input
          placeholder="Rua, Avenida, etc."
          value={data.endereco?.logradouro || ''}
          onChangeText={(value) => updateAddressField('logradouro', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Logradouro"
          returnKeyType="next"
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.formGroup, styles.smallInput]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Número</Text>
          <Input
            placeholder="Nº"
            value={data.endereco?.numero || ''}
            onChangeText={(value) => updateAddressField('numero', value)}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="numeric"
            accessibilityLabel="Número"
            returnKeyType="next"
          />
        </View>

        <View style={[styles.formGroup, styles.largeInput]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Complemento</Text>
          <Input
            placeholder="Apto, Bloco, etc."
            value={data.endereco?.complemento || ''}
            onChangeText={(value) => updateAddressField('complemento', value)}
            containerStyle={styles.inputContainer}
            inputStyle={{ color: theme.colors.text }}
            accessibilityLabel="Complemento"
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Bairro</Text>
        <Input
          placeholder="Bairro"
          value={data.endereco?.bairro || ''}
          onChangeText={(value) => updateAddressField('bairro', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Bairro"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Cidade</Text>
        <Input
          placeholder="Cidade"
          value={data.endereco?.cidade || ''}
          onChangeText={(value) => updateAddressField('cidade', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="words"
          accessibilityLabel="Cidade"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Estado</Text>
        <Input
          placeholder="UF"
          value={data.endereco?.estado || ''}
          onChangeText={(value) => updateAddressField('estado', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="characters"
          maxLength={2}
          accessibilityLabel="Estado (UF)"
          returnKeyType="done"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Ponto de Referência</Text>
        <Input
          placeholder="Ponto de referência (opcional)"
          value={data.pontoReferencia || ''}
          onChangeText={(value) => onUpdate({ pontoReferencia: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          accessibilityLabel="Ponto de referência"
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
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 3,
    paddingHorizontal: 0,
  },
  cepButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginRight: 10,
  },
  largeInput: {
    flex: 2,
  },
});

export default ClientAddressStep;
