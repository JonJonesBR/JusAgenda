import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, Button, Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Client } from '../../screens/ClientWizardScreen';
import moment from 'moment';
import * as Haptics from 'expo-haptics';

interface ClientReviewStepProps {
  data: Partial<Client>;
  onUpdate: (data: Partial<Client>) => void;
  isEditMode?: boolean;
}

/**
 * Quarto passo do wizard de cliente - Revisão final
 */
const ClientReviewStep: React.FC<ClientReviewStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  
  // Função para formatar dados vazios
  const formatData = (value: string | undefined, placeholder: string = 'Não informado') => {
    return value && value.trim() !== '' ? value : placeholder;
  };
  
  // Função para retornar ao passo anterior para editar determinada seção
  const handleEditSection = (step: number) => {
    // Aqui implementaríamos a navegação para o passo específico
    // Esta funcionalidade depende da estrutura de navegação do aplicativo
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Revisão das Informações
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey2 }]}>
        Verifique se todas as informações estão corretas antes de finalizar o cadastro.
      </Text>
      
      {/* Seção Informações Básicas */}
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Informações Básicas
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.grey2 }]}>
              Dados gerais do cliente
            </Text>
          </View>
          <Button
            type="clear"
            onPress={() => handleEditSection(1)}
            icon={
              <Icon 
                name="edit" 
                type="material" 
                size={20}
                color={theme.colors.primary}
              />
            }
            buttonStyle={styles.editButton}
            accessibilityLabel="Editar informações básicas"
          />
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.grey5 }]} />
        
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
            Tipo
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {data.tipo === 'pessoaFisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
            {data.tipo === 'pessoaJuridica' ? 'Razão Social' : 'Nome'}
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.nome)}
          </Text>
        </View>
        
        {data.tipo === 'pessoaJuridica' && data.nomeFantasia && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
              Nome Fantasia
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.nomeFantasia)}
            </Text>
          </View>
        )}
        
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
            Email
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.email)}
          </Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
            Telefone
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.telefone)}
          </Text>
        </View>
        
        {data.tipo === 'pessoaFisica' && data.dataNascimento && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
              Data de Nascimento
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(moment(data.dataNascimento).format('DD/MM/YYYY'))}
            </Text>
          </View>
        )}
        
        {data.observacoes && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
              Observações
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.observacoes)}
            </Text>
          </View>
        )}
      </Card>
      
      {/* Seção Documentos */}
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Documentos
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.grey2 }]}>
              {data.tipo === 'pessoaFisica' ? 'Documentos pessoais' : 'Documentos da empresa'}
            </Text>
          </View>
          <Button
            type="clear"
            onPress={() => handleEditSection(2)}
            icon={
              <Icon 
                name="edit" 
                type="material" 
                size={20}
                color={theme.colors.primary}
              />
            }
            buttonStyle={styles.editButton}
            accessibilityLabel="Editar documentos"
          />
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.grey5 }]} />
        
        {data.tipo === 'pessoaFisica' ? (
          // Campos para Pessoa Física
          <>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                CPF
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.cpf)}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                RG
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.rg)}
              </Text>
            </View>
            
            {data.orgaoEmissor && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Órgão Emissor
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.orgaoEmissor)}
                </Text>
              </View>
            )}
            
            {data.profissao && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Profissão
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.profissao)}
                </Text>
              </View>
            )}
            
            {data.estadoCivil && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Estado Civil
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.estadoCivil)}
                </Text>
              </View>
            )}
          </>
        ) : (
          // Campos para Pessoa Jurídica
          <>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                CNPJ
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.cnpj)}
              </Text>
            </View>
            
            {data.inscricaoEstadual && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Inscrição Estadual
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.inscricaoEstadual)}
                </Text>
              </View>
            )}
            
            {data.inscricaoMunicipal && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Inscrição Municipal
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.inscricaoMunicipal)}
                </Text>
              </View>
            )}
            
            {data.ramoAtividade && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Ramo de Atividade
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.ramoAtividade)}
                </Text>
              </View>
            )}
            
            {data.responsavelLegal && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Responsável Legal
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.responsavelLegal)}
                </Text>
              </View>
            )}
          </>
        )}
        
        {data.documentosAdicionais && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
              Documentos Adicionais
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.documentosAdicionais)}
            </Text>
          </View>
        )}
      </Card>
      
      {/* Seção Endereço */}
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Endereço
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.grey2 }]}>
              {data.tipo === 'pessoaFisica' ? 'Endereço residencial' : 'Endereço comercial'}
            </Text>
          </View>
          <Button
            type="clear"
            onPress={() => handleEditSection(3)}
            icon={
              <Icon 
                name="edit" 
                type="material" 
                size={20}
                color={theme.colors.primary}
              />
            }
            buttonStyle={styles.editButton}
            accessibilityLabel="Editar endereço"
          />
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.grey5 }]} />
        
        {data.endereco ? (
          <>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                CEP
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.endereco.cep)}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                Logradouro
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.endereco.logradouro)}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                Número
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.endereco.numero)}
              </Text>
            </View>
            
            {data.endereco.complemento && (
              <View style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                  Complemento
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {formatData(data.endereco.complemento)}
                </Text>
              </View>
            )}
            
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                Bairro
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.endereco.bairro)}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
                Cidade/Estado
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {formatData(data.endereco.cidade)} - {formatData(data.endereco.estado)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.emptyMessage, { color: theme.colors.grey3 }]}>
            Nenhum endereço informado
          </Text>
        )}
        
        {data.pontoReferencia && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.grey2 }]}>
              Ponto de Referência
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.pontoReferencia)}
            </Text>
          </View>
        )}
      </Card>
      
      <View style={styles.confirmationContainer}>
        <Text style={[styles.confirmationText, { color: theme.colors.grey2 }]}>
          Confirme os dados acima antes de finalizar o cadastro. Você pode editar qualquer seção clicando no ícone de edição.
        </Text>
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
  card: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  editButton: {
    padding: 0,
  },
  divider: {
    marginVertical: 12,
  },
  dataRow: {
    marginBottom: 12,
  },
  dataLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  confirmationContainer: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  confirmationText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ClientReviewStep;
