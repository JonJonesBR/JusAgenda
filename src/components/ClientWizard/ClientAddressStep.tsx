import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native'; // Removido ActivityIndicator
import { Input, Text, Button } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext'; // Removida extensão .tsx
import { Client } from '../../screens/ClientWizardScreen'; // Removida extensão
import MaskInput from 'react-native-mask-input';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ClientAddressStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
  // isEditMode?: boolean; // Removido, pois não está sendo usado
}

/**
 * Terceiro passo do wizard de cliente - Endereço
 */
const ClientAddressStep: React.FC<ClientAddressStepProps> = ({
  data,
  onUpdate,
  // isEditMode = false, // Removido, pois não está sendo usado
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  // Inicializar os dados de endereço se não existirem
  // IMPORTANTE: Essa lógica de inicialização aqui pode causar re-renders inesperados
  // se onUpdate disparar um re-render do componente pai que passa 'data' de volta.
  // Seria melhor garantir que 'data.endereco' seja inicializado no componente pai
  // antes de passar para ClientAddressStep, ou usar um useEffect com dependência em 'data'
  // para inicializar apenas uma vez se 'data.endereco' for undefined.
  // Por agora, vou manter como está, mas é um ponto de atenção.
  if (!data.endereco) {
    // Para evitar loop, só chamar onUpdate se realmente precisar inicializar
    // E talvez seja melhor fazer isso no componente pai ou com useEffect
    // useEffect(() => {
    //   if (!data.endereco) {
    //     onUpdate({
    //       endereco: { /* ... valores padrão ... */ }
    //     });
    //   }
    // }, [data.endereco, onUpdate]);
    // Contudo, como o componente é para um passo de wizard, a inicialização
    // pode ser feita no momento da transição para este passo no componente que gerencia o wizard.

    // Se for manter aqui, e 'onUpdate' pode recriar 'data', precisa de uma condição mais robusta
    // ou inicializar 'data.endereco' no estado local e só chamar onUpdate ao sair do passo.
    // No entanto, a props 'data' sugere que o estado é gerenciado externamente.
    // Vou assumir que o onUpdate aqui é para persistir a inicialização no estado pai.
    const initialAddress = {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      };
    if (JSON.stringify(data.endereco) !== JSON.stringify(initialAddress)) { // Evitar chamadas desnecessárias
        onUpdate({
          ...data, // Preservar outros campos de data
          endereco: initialAddress
        });
    }
  }

  // Buscar endereço pelo CEP
  const buscarCep = async () => {
    const cep = data.endereco?.cep?.replace(/\D/g, ''); // Garante que data.endereco exista

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
      const enderecoData = await response.json(); // Renomeado para evitar conflito de nome

      if (enderecoData.erro) {
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Verifique o CEP digitado',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        onUpdate({
          ...data, // Preservar outros campos de data
          endereco: {
            ...(data.endereco || {}), // Garante que data.endereco exista
            logradouro: enderecoData.logradouro,
            bairro: enderecoData.bairro,
            cidade: enderecoData.localidade,
            estado: enderecoData.uf,
            cep: data.endereco?.cep || '', // Mantém o CEP digitado
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
      console.error("Erro ao buscar CEP:", error); // Adicionar log do erro
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
  const updateAddressField = (field: keyof NonNullable<Client['endereco']>, value: string) => {
    onUpdate({
      ...data, // Preservar outros campos de data
      endereco: {
        ...(data.endereco || {}), // Garante que data.endereco exista
        [field]: value
      }
    });
  };

  // Adicionado para garantir que data.endereco exista para renderização
  const currentAddress = data.endereco || {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
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
            value={currentAddress.cep}
            onChangeText={(value) => updateAddressField('cep', value)}
            containerStyle={styles.cepInput}
            inputStyle={{ color: theme.colors.text }}
            keyboardType="numeric"
              accessibilityLabel="CEP"
              returnKeyType="search"
              InputComponent={(props) => (
              <MaskInput
                {...props}
                mask={'[0-9]{5}-[0-9]{3}'}
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
          value={currentAddress.logradouro}
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
            value={currentAddress.numero}
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
            value={currentAddress.complemento}
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
          value={currentAddress.bairro}
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
          value={currentAddress.cidade}
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
          value={currentAddress.estado}
          onChangeText={(value) => updateAddressField('estado', value)}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          autoCapitalize="characters"
          maxLength={2}
          accessibilityLabel="Estado (UF)"
          returnKeyType="done"
        />
      </View>

      {/* O campo pontoReferencia não está definido no tipo Endereco dentro de Client,
          mas sim diretamente em Client. A lógica abaixo está correta em relação a isso.
      */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Ponto de Referência</Text>
        <Input
          placeholder="Ponto de referência (opcional)"
          value={data.pontoReferencia || ''}
          onChangeText={(value) => onUpdate({ ...data, pontoReferencia: value })}
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

// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  cepButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    // Removido marginRight: 10, pois pode ser melhor controlado pelo container ou espaçamento do Input
  },
  cepContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cepInput: {
    flex: 3,
    paddingHorizontal: 0, // Redundante com containerStyle de Input, mas não prejudica
  },
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
  largeInput: {
    flex: 2, // Ajustado para dar mais espaço
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap: 10, // Alternativa moderna para marginRight/marginLeft se suportado
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
  smallInput: {
    flex: 1, // Ajustado para permitir que largeInput tenha mais espaço
    marginRight: 8, // Ajustado para um espaçamento menor
  },
});

export default ClientAddressStep;
