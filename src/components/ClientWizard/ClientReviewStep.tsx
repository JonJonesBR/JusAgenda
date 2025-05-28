import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, Button, Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import Client from '../../screens/ClientWizardScreen';
import moment from 'moment';
import * as Haptics from 'expo-haptics';

const componentColors = {
  black: '#000',
  defaultTextGrey: '#86939e', // General fallback for grey text
  defaultSurfaceColor: '#FFFFFF', // General fallback for surface/card backgrounds
};

interface ClientReviewStepProps {
  data: Partial<typeof Client>;
  onEditStep: (stepIndex: number) => void;
}

const ClientReviewStep: React.FC<ClientReviewStepProps> = ({
  data,
  onEditStep,
}) => {
  const { theme } = useTheme();

  const formatData = (value: string | number | undefined | null, placeholder: string = 'Não informado') => {
    if (value === null || value === undefined) return placeholder;
    const stringValue = String(value);
    return stringValue.trim() !== '' ? stringValue : placeholder;
  };

  const handleEditSection = (stepIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onEditStep(stepIndex);
  };

  const textSecondaryColor = theme.colors.textSecondary || componentColors.defaultTextGrey;
  const surfaceColor = theme.colors.background || componentColors.defaultSurfaceColor; // Use background as primary fallback for surface

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Revisão das Informações
      </Text>
      <Text style={[styles.sectionDescription, { color: textSecondaryColor }]}>
        Verifique se todas as informações estão corretas antes de finalizar o cadastro.
      </Text>

      <Card containerStyle={[styles.card, { backgroundColor: surfaceColor, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Informações Básicas
            </Text>
            <Text style={[styles.cardSubtitle, { color: textSecondaryColor }]}>
              Dados gerais do cliente
            </Text>
          </View>
          <Button
            type="clear"
            onPress={() => handleEditSection(0)}
            icon={
              <Icon
                name="edit"
                type="material"
                size={24}
                color={theme.colors.primary}
              />
            }
            buttonStyle={styles.editButton}
            accessibilityLabel="Editar informações básicas"
          />
        </View>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
            Tipo
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {data.tipo === 'pessoaFisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
            {data.tipo === 'pessoaJuridica' ? 'Razão Social' : 'Nome'}
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.nome)}
          </Text>
        </View>

        {data.tipo === 'pessoaJuridica' && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
              Nome Fantasia
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.nomeFantasia)}
            </Text>
          </View>
        )}

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
            Email
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.email)}
          </Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
            Telefone
          </Text>
          <Text style={[styles.dataValue, { color: theme.colors.text }]}>
            {formatData(data.telefone)}
          </Text>
        </View>

        {data.tipo === 'pessoaFisica' && (
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
              Data de Nascimento
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {data.dataNascimento ? formatData(moment(data.dataNascimento, 'YYYY-MM-DD').format('DD/MM/YYYY')) : 'Não informado'}
            </Text>
          </View>
        )}
        <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: textSecondaryColor }]}>
              Observações
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatData(data.observacoes)}
            </Text>
          </View>
      </Card>

      <Card containerStyle={[styles.card, { backgroundColor: surfaceColor, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Documentos
            </Text>
            <Text style={[styles.cardSubtitle, { color: textSecondaryColor }]}>
              {data.tipo === 'pessoaFisica' ? 'Documentos pessoais' : 'Documentos da empresa'}
            </Text>
          </View>
          <Button
            type="clear"
            onPress={() => handleEditSection(1)}
            icon={<Icon name="edit" type="material" size={24} color={theme.colors.primary}/>}
            buttonStyle={styles.editButton}
            accessibilityLabel="Editar documentos"
          />
        </View>
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        {data.tipo === 'pessoaFisica' ? (
          <>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>CPF</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.cpf)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>RG</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.rg)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Órgão Emissor</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.orgaoEmissor)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Profissão</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.profissao)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Estado Civil</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.estadoCivil)}</Text></View>
          </>
        ) : (
          <>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>CNPJ</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.cnpj)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Inscrição Estadual</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.inscricaoEstadual)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Inscrição Municipal</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.inscricaoMunicipal)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Ramo de Atividade</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.ramoAtividade)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Responsável Legal</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.responsavelLegal)}</Text></View>
          </>
        )}
        <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Documentos Adicionais</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.documentosAdicionais)}</Text></View>
      </Card>

      <Card containerStyle={[styles.card, { backgroundColor: surfaceColor, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Endereço</Text>
            <Text style={[styles.cardSubtitle, { color: textSecondaryColor }]}>{data.tipo === 'pessoaFisica' ? 'Endereço residencial' : 'Endereço comercial'}</Text>
          </View>
          <Button type="clear" onPress={() => handleEditSection(2)} icon={<Icon name="edit" type="material" size={24} color={theme.colors.primary}/>} buttonStyle={styles.editButton} accessibilityLabel="Editar endereço"/>
        </View>
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        {data.endereco ? (
          <>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>CEP</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.cep)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Logradouro</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.logradouro)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Número</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.numero)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Complemento</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.complemento)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Bairro</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.bairro)}</Text></View>
            <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Cidade/Estado</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.endereco.cidade)} - {formatData(data.endereco.estado)}</Text></View>
          </>
        ) : (
          <Text style={[styles.emptyMessage, { color: textSecondaryColor }]}>Nenhum endereço informado</Text>
        )}
         <View style={styles.dataRow}><Text style={[styles.dataLabel, { color: textSecondaryColor }]}>Ponto de Referência</Text><Text style={[styles.dataValue, { color: theme.colors.text }]}>{formatData(data.pontoReferencia)}</Text></View>
      </Card>

      <View style={styles.confirmationContainer}>
        <Text style={[styles.confirmationText, { color: textSecondaryColor }]}>
          Confirme os dados acima antes de finalizar o cadastro. Você pode editar qualquer seção clicando no ícone de edição.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    padding: 16,
    shadowColor: componentColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  confirmationContainer: {
    marginBottom: 24,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  confirmationText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  dataLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  dataRow: {
    marginBottom: 14,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  editButton: {
    padding: 4,
  },
  emptyMessage: {
    fontSize: 15,
    fontStyle: 'italic',
    paddingVertical: 20,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 15,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default ClientReviewStep;
