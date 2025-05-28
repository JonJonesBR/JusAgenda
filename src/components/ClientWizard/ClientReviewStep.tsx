// src/components/ClientWizard/ClientReviewStep.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../ui'; // Seu componente Section
import { Theme } from '../../contexts/ThemeContext'; // Tipo do tema
import { ClientAddress, PessoaFisica, PessoaJuridica } from '../../types/client'; // Tipos de Cliente

// Este formData será uma versão formatada para exibição vinda do ClientWizardScreen
interface ReviewClientFormData {
  tipo?: 'Pessoa Física' | 'Pessoa Jurídica' | string; // Tipo já como label
  nome?: string; // Nome ou Razão Social
  email?: string;
  telefonePrincipal?: string;
  ativo?: boolean;

  // PF
  cpf?: string;
  rg?: string;
  dataNascimento?: string; // Já formatada como DD/MM/YYYY
  profissao?: string;
  estadoCivil?: string;

  // PJ
  cnpj?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string; // Adicionado, se existir no seu form
  dataFundacao?: string; // Já formatada como DD/MM/YYYY
  ramoAtividade?: string;

  enderecos?: ClientAddress[];
  observacoes?: string;
  [key: string]: any; // Para outros campos que possam existir
}

interface ClientReviewStepProps {
  formData: ReviewClientFormData;
  onEditStep: (stepIndex: number) => void;
  isReadOnly: boolean;
  theme: Theme;
}

// Componente auxiliar para renderizar cada item de detalhe (similar ao de EventViewScreen)
const DetailReviewItem: React.FC<{
  label: string;
  value?: string | number | boolean | React.ReactNode;
  theme: Theme;
  isReadOnly?: boolean;
  onEditPress?: () => void;
  fullWidthValue?: boolean;
  valueStyle?: object;
}> = ({ label, value, theme, isReadOnly, onEditPress, fullWidthValue = false, valueStyle }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  let displayValue: React.ReactNode;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  } else {
    displayValue = value;
  }

  return (
    <View style={styles.detailItemContainer}>
      <View style={styles.detailTextContainer}>
        <Text style={[styles.detailLabel, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
          {label}:
        </Text>
        <View style={fullWidthValue ? styles.detailValueFullWidth : styles.detailValue}>
            {typeof displayValue === 'string' || typeof displayValue === 'number' ? (
                 <Text style={[styles.detailValueText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }, valueStyle]}>
                    {displayValue}
                 </Text>
            ) : (
                displayValue
            )}
        </View>
      </View>
      {!isReadOnly && onEditPress && (
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <MaterialCommunityIcons name="pencil-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};


const ClientReviewStep: React.FC<ClientReviewStepProps> = ({
  formData,
  onEditStep,
  isReadOnly,
  theme,
}) => {

  const renderAddresses = (enderecos?: ClientAddress[]) => {
    if (!enderecos || enderecos.length === 0) {
      return <Text style={{ color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }}>Nenhum endereço informado.</Text>;
    }
    return enderecos.map((end, index) => (
      <View key={end.id || `addr-${index}`} style={[styles.addressReviewItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm }]}>
        <Text style={[styles.addressReviewTitle, {color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold}]}>
          Endereço {enderecos.length > 1 ? index + 1 : ''} {end.isPrincipal ? '(Principal)' : ''}
        </Text>
        <Text style={styles.addressDetailReview}>{`${end.logradouro || ''}, ${end.numero || ''}${end.complemento ? ` - ${end.complemento}` : ''}`}</Text>
        <Text style={styles.addressDetailReview}>{`${end.bairro || ''} - ${end.cidade || ''}/${end.estado || ''}`}</Text>
        <Text style={styles.addressDetailReview}>CEP: {end.cep || ''}</Text>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailReviewItem label="Tipo de Cliente" value={formData.tipo} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailReviewItem label={formData.tipo === 'Pessoa Física' ? "Nome Completo" : "Razão Social"} value={formData.nome} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        {formData.tipo === 'Pessoa Jurídica' && (
          <DetailReviewItem label="Nome Fantasia" value={formData.nomeFantasia} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        )}
        <DetailReviewItem label="Email" value={formData.email} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailReviewItem label="Telefone Principal" value={formData.telefonePrincipal} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
         {formData.tipo === 'Pessoa Física' && (
            <>
                <DetailReviewItem label="Data de Nascimento" value={formData.dataNascimento} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
                <DetailReviewItem label="Profissão" value={formData.profissao} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
                <DetailReviewItem label="Estado Civil" value={formData.estadoCivil} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
            </>
         )}
         {formData.tipo === 'Pessoa Jurídica' && (
            <>
                <DetailReviewItem label="Data de Fundação" value={formData.dataFundacao} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
                <DetailReviewItem label="Ramo de Atividade" value={formData.ramoAtividade} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
            </>
         )}
        <DetailReviewItem label="Cliente Ativo" value={formData.ativo} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
      </Section>

      <Section title="Documentos" theme={theme} style={styles.sectionSpacing} showSeparator>
        {formData.tipo === 'Pessoa Física' ? (
          <>
            <DetailReviewItem label="CPF" value={formData.cpf} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
            <DetailReviewItem label="RG" value={formData.rg} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
          </>
        ) : (
          <>
            <DetailReviewItem label="CNPJ" value={formData.cnpj} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
            <DetailReviewItem label="Inscrição Estadual" value={formData.inscricaoEstadual} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
            <DetailReviewItem label="Inscrição Municipal" value={formData.inscricaoMunicipal} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
          </>
        )}
      </Section>

      <Section title="Endereços" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailReviewItem
            // label="Lista de Endereços" // O label pode ser implícito pelo título da seção
            value={renderAddresses(formData.enderecos)}
            theme={theme}
            onEditPress={() => onEditStep(2)}
            isReadOnly={isReadOnly}
            fullWidthValue
        />
      </Section>

      <Section title="Outras Informações" theme={theme} style={styles.sectionSpacing}>
        <DetailReviewItem label="Observações" value={formData.observacoes} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} fullWidthValue />
        {/* O passo para observações pode variar, ajuste o onEditStep se for de outro passo */}
      </Section>

      {isReadOnly && (
        <Text style={[styles.readOnlyMessage, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.italic }]}>
          Este é um modo de visualização. Nenhuma alteração pode ser feita.
        </Text>
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
  sectionSpacing: {
    marginBottom: 16,
  },
  detailItemContainer: { // Duplicado de EventViewScreen, pode ser globalizado
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0', // Usar theme.colors.border
  },
  detailTextContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
    minWidth: Platform.OS === 'ios' ? 110 : 120, // Largura mínima para rótulos
    // Cor e fontFamily são dinâmicas
  },
  detailValue: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  detailValueFullWidth: {
    flex: 1,
    alignItems: 'flex-start',
  },
  detailValueText: {
    fontSize: 14,
    textAlign: 'left',
    // Cor e fontFamily são dinâmicas
  },
  editButton: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressReviewItem: {
    padding: 10,
    marginBottom: 8,
    // backgroundColor, borderColor, borderRadius são dinâmicos
  },
  addressReviewTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  addressDetailReview: {
    fontSize: 13,
    color: '#555', // Usar theme.colors.text ou placeholder
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Usar theme.typography.fontFamily.regular
  },
  readOnlyMessage: {
    textAlign: 'center',
    padding: 16,
    fontSize: 13,
  },
});

export default ClientReviewStep;
