// src/components/ClientWizard/ClientReviewStep.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
// MaterialCommunityIcons will be imported by DetailDisplayItem if needed
import { Section, DetailDisplayItem } from '../ui'; // Seu componente Section e o novo DetailDisplayItem
// Theme prop is no longer needed for DetailDisplayItem
import { ClientAddress } from '../../types/client'; // Tipos de Cliente
// Import useTheme if Section still needs the theme prop and doesn't use the hook itself.
import { useTheme } from '../../contexts/ThemeContext';

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
  // theme: Theme; // Theme prop no longer needed by DetailDisplayItem, can be removed if Section is also updated
  theme: Theme; // Keep for Section for now
}

// DetailReviewItem local component is removed.

const ClientReviewStep: React.FC<ClientReviewStepProps> = ({
  formData,
  onEditStep,
  isReadOnly,
  theme, // This theme is for Section
}) => {
  const { theme: internalTheme } = useTheme(); // For styling renderAddresses text if needed

  const renderAddresses = (enderecos?: ClientAddress[]) => {
    if (!enderecos || enderecos.length === 0) {
      return <Text style={{ color: internalTheme.colors.placeholder, fontFamily: internalTheme.typography.fontFamily.regular, paddingVertical: 8 }}>Nenhum endereço informado.</Text>;
    }
    return enderecos.map((end, index) => (
      <View key={end.id || `addr-${index}`} style={[styles.addressReviewItem, { backgroundColor: internalTheme.colors.surface, borderColor: internalTheme.colors.border, borderRadius: internalTheme.radii.sm }]}>
        <Text style={[styles.addressReviewTitle, {color: internalTheme.colors.text, fontFamily: internalTheme.typography.fontFamily.bold}]}>
          Endereço {enderecos.length > 1 ? index + 1 : ''} {end.isPrincipal ? '(Principal)' : ''}
        </Text>
        <Text style={[styles.addressDetailReview, {color: internalTheme.colors.textMuted}]}>{`${end.logradouro || ''}, ${end.numero || ''}${end.complemento ? ` - ${end.complemento}` : ''}`}</Text>
        <Text style={[styles.addressDetailReview, {color: internalTheme.colors.textMuted}]}>{`${end.bairro || ''} - ${end.cidade || ''}/${end.estado || ''}`}</Text>
        <Text style={[styles.addressDetailReview, {color: internalTheme.colors.textMuted}]}>CEP: {end.cep || ''}</Text>
      </View>
    ));
  };

  // Helper to determine which step to edit for document fields
  // Since documents are now in step 0 (Basic Info)
  const docEditStep = 0; 

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailDisplayItem label="Tipo de Cliente" value={formData.tipo} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="account-switch-outline" />
        <DetailDisplayItem label={formData.tipo === 'Pessoa Física' ? "Nome Completo" : "Razão Social"} value={formData.nome} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="account-outline" />
        {formData.tipo === 'Pessoa Jurídica' && (
          <DetailDisplayItem label="Nome Fantasia" value={formData.nomeFantasia} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="store-outline" />
        )}
        <DetailDisplayItem label="Email" value={formData.email} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="email-outline" />
        <DetailDisplayItem label="Telefone Principal" value={formData.telefonePrincipal} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="phone-outline" />
         {formData.tipo === 'Pessoa Física' && (
            <>
                <DetailDisplayItem label="Data de Nascimento" value={formData.dataNascimento} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="calendar-account" />
                <DetailDisplayItem label="Profissão" value={formData.profissao} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="briefcase-outline" />
                <DetailDisplayItem label="Estado Civil" value={formData.estadoCivil} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="account-heart-outline" />
            </>
         )}
         {formData.tipo === 'Pessoa Jurídica' && (
            <>
                <DetailDisplayItem label="Data de Fundação" value={formData.dataFundacao} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="calendar-star" />
                <DetailDisplayItem label="Ramo de Atividade" value={formData.ramoAtividade} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="domain" />
            </>
         )}
        <DetailDisplayItem label="Cliente Ativo" value={formData.ativo} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName={formData.ativo ? "check-circle-outline" : "close-circle-outline"} />
      </Section>

      {/* Documents are now part of Basic Info (Step 0), so onEditPress points to 0 */}
      <Section title="Documentos" theme={theme} style={styles.sectionSpacing} showSeparator>
        {formData.tipo === 'Pessoa Física' ? (
          <>
            <DetailDisplayItem label="CPF" value={formData.cpf} onEditPress={() => onEditStep(docEditStep)} isReadOnly={isReadOnly} iconName="card-account-details-outline"/>
            <DetailDisplayItem label="RG" value={formData.rg} onEditPress={() => onEditStep(docEditStep)} isReadOnly={isReadOnly} iconName="card-account-details-outline"/>
          </>
        ) : (
          <>
            <DetailDisplayItem label="CNPJ" value={formData.cnpj} onEditPress={() => onEditStep(docEditStep)} isReadOnly={isReadOnly} iconName="office-building-outline"/>
            <DetailDisplayItem label="Inscrição Estadual" value={formData.inscricaoEstadual} onEditPress={() => onEditStep(docEditStep)} isReadOnly={isReadOnly} iconName="file-document-outline"/>
            <DetailDisplayItem label="Inscrição Municipal" value={formData.inscricaoMunicipal} onEditPress={() => onEditStep(docEditStep)} isReadOnly={isReadOnly} iconName="file-document-outline"/>
          </>
        )}
      </Section>

      {/* Address step index is now 1 (previously 2) */}
      <Section title="Endereços" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailDisplayItem
            value={renderAddresses(formData.enderecos)}
            onEditPress={() => onEditStep(1)} // Updated step index for address
            isReadOnly={isReadOnly}
            fullWidthValue
            iconName="map-marker-multiple-outline"
        />
      </Section>

      <Section title="Outras Informações" theme={theme} style={styles.sectionSpacing}>
        <DetailDisplayItem label="Observações" value={formData.observacoes} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} fullWidthValue iconName="text-box-search-outline" />
        {/* Assuming observacoes are part of basic info (step 0) */}
      </Section>

      {isReadOnly && (
        <Text style={[styles.readOnlyMessage, { color: internalTheme.colors.placeholder, fontFamily: internalTheme.typography.fontFamily.italic }]}>
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
