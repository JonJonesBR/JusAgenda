import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Divider, Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event, Contact } from '../../types/event';
import moment from 'moment';
import * as Haptics from 'expo-haptics';

const componentColors = {
  white: 'white',
  shadowBlack: '#000',
  defaultGrey: '#A9A9A9', // Fallback for various grey shades
  lightGrey: '#D3D3D3', // Lighter fallback
  defaultSurface: '#FFFFFF', // Fallback for surface
};

interface ReviewStepProps {
  data: Partial<Event>;
  onEditStep: (stepIndex: number) => void;
  isEditMode?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onEditStep,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  const EditSectionButton: React.FC<{ stepIndex: number, accessibilityLabel: string }> = ({ stepIndex, accessibilityLabel }) => (
    <TouchableOpacity
        style={styles.editButtonTouchable}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onEditStep(stepIndex);
        }}
        accessibilityLabel={accessibilityLabel}
    >
        <Icon
            name="pencil-outline"
            type="material-community"
            size={22}
            color={theme.colors.primary}
        />
    </TouchableOpacity>
  );

  const getReviewItem = (label: string, value: string | number | boolean | Date | string[] | undefined | null, iconName: string, iconType: string = "material-community") => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        if (typeof value !== 'boolean' && !Array.isArray(value)) return null; // Allow empty arrays to be shown as "Não" or empty string
        if (Array.isArray(value) && value.length === 0) return null;
    }

    let displayValue: string | number | boolean = value as string | number | boolean; // Initial cast

    if (value instanceof Date) {
      displayValue = moment(value).format('DD/MM/YYYY');
    } else if (label === 'Data' && typeof value === 'string') { // Ensure it's a string before moment parsing
      displayValue = moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Sim' : 'Não';
    } else if (Array.isArray(value)) {
      displayValue = value.join(', ');
      if (displayValue === '') displayValue = 'Nenhum'; // Or some other placeholder for empty array
    } else if (label === 'Tipo' && data.tipo) {
        const typeMap: {[key: string]: string} = { audiencia: 'Audiência', prazo: 'Prazo', reuniao: 'Reunião', despacho: 'Despacho', outro: 'Outro' };
        displayValue = typeMap[data.tipo] || data.tipo;
    } else if (label === 'Prioridade' && data.prioridade) {
        const priorityMap: {[key: string]: string} = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };
        displayValue = priorityMap[data.prioridade] || data.prioridade;
    }


    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Icon
            name={iconName}
            type={iconType}
            size={20}
            color={theme.colors.primary}
            style={styles.reviewItemIcon}
          />
          <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary || componentColors.defaultGrey }]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
          {String(displayValue)}
        </Text>
      </View>
    );
  };

  const hasRequiredFields = data.title && data.data && data.tipo;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Revisão do Evento
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || componentColors.defaultGrey }]}>
        Revise todas as informações antes de {isEditMode ? 'salvar as alterações' : 'finalizar o cadastro'} do evento.
      </Text>

      {!hasRequiredFields && (
        <Card containerStyle={[styles.warningCard, { backgroundColor: theme.colors.error }]}>
          <View style={styles.warningCardContent}>
            <Icon name="alert-circle-outline" type="material-community" color={componentColors.white} size={24} />
            <View style={styles.warningTextContainer}>
                <Card.Title style={[styles.warningTitle, { color: componentColors.white }]}><Text>Informações Incompletas</Text></Card.Title>
                <Text style={[styles.warningText, { color: componentColors.white }]}>
                    Por favor, preencha todos os campos obrigatórios (Título, Data e Tipo) nos passos anteriores.
                </Text>
            </View>
          </View>
        </Card>
      )}

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background || componentColors.defaultSurface, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeaderContainer}>
            <Icon name="information-outline" type="material-community" size={24} color={theme.colors.primary} style={styles.cardHeaderIcon} />
            <Card.Title style={[styles.cardTitleText, { color: theme.colors.text }]}><Text>Informações Básicas</Text></Card.Title>
            <EditSectionButton stepIndex={0} accessibilityLabel="Editar informações básicas" />
        </View>
        <Card.Divider style={{backgroundColor: theme.colors.border}}/>
        {getReviewItem('Título', data.title, 'format-title')}
        {getReviewItem('Tipo', data.tipo, 'tag-outline')}
        {getReviewItem('Data', data.data, 'calendar-month-outline')}
        {getReviewItem('Descrição', data.descricao, 'text-long')}
        {getReviewItem('Local', data.local, 'map-marker-outline')}
      </Card>

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background || componentColors.defaultSurface, borderColor: theme.colors.border }]}>
         <View style={styles.cardHeaderContainer}>
            <Icon name="file-document-outline" type="material-community" size={24} color={theme.colors.primary} style={styles.cardHeaderIcon} />
            <Card.Title style={[styles.cardTitleText, { color: theme.colors.text }]}><Text>Detalhes Processuais</Text></Card.Title>
            <EditSectionButton stepIndex={1} accessibilityLabel="Editar detalhes processuais" />
        </View>
        <Card.Divider style={{backgroundColor: theme.colors.border}}/>
        {getReviewItem('Número do Processo', data.numeroProcesso, 'pound-box-outline')}
        {getReviewItem('Vara/Tribunal', data.vara, 'gavel')}
        {getReviewItem('Prioridade', data.prioridade, 'priority-high')}
        {getReviewItem('Presença Obrigatória', data.presencaObrigatoria, 'account-check-outline')}
        {getReviewItem('Lembretes', data.lembretes, 'bell-ring-outline')}
        {getReviewItem('Observações Processuais', data.observacoes, 'comment-text-outline')}
      </Card>

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background || componentColors.defaultSurface, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeaderContainer}>
            <Icon name="account-group-outline" type="material-community" size={24} color={theme.colors.primary} style={styles.cardHeaderIcon} />
            <Card.Title style={[styles.cardTitleText, { color: theme.colors.text }]}><Text>Contatos ({data.contatos?.length || 0})</Text></Card.Title>
            <EditSectionButton stepIndex={2} accessibilityLabel="Editar contatos" />
        </View>
        <Card.Divider style={{backgroundColor: theme.colors.border}}/>
        {data.contatos && data.contatos.length > 0 ? (
          data.contatos.map((contact: Contact, index: number) => (
            <View key={contact.id ? contact.id.toString() : `${contact.nome || 'contact'}-${index}`}>
              <View style={styles.contactItemContainer}>
                <Icon name="account-circle-outline" type="material-community" size={28} color={theme.colors.text} style={styles.contactItemIcon} />
                <View style={styles.contactTextContainer}>
                    <Text style={[styles.contactName, { color: theme.colors.text }]}>{contact.nome}</Text>
                    {contact.telefone && (
                        <Text style={[styles.contactDetailText, { color: theme.colors.textSecondary || componentColors.defaultGrey }]}>
                            <Icon name="phone-outline" type="material-community" size={14} color={theme.colors.textSecondary || componentColors.defaultGrey} /> {contact.telefone}
                        </Text>
                    )}
                    {contact.email && (
                        <Text style={[styles.contactDetailText, { color: theme.colors.textSecondary || componentColors.defaultGrey }]}>
                            <Icon name="email-outline" type="material-community" size={14} color={theme.colors.textSecondary || componentColors.defaultGrey} /> {contact.email}
                        </Text>
                    )}
                </View>
              </View>
              {index < data.contatos.length - 1 && <Divider style={[styles.contactItemDivider, {backgroundColor: theme.colors.border}]} />}
            </View>
          ))
        ) : (
          <View style={styles.emptyListCentered}>
            <Icon name="account-multiple-outline" type="material-community" size={32} color={theme.colors.textSecondary || componentColors.lightGrey}/>
            <Text style={[styles.emptyListText, { color: theme.colors.textSecondary || componentColors.lightGrey }]}>
                Nenhum contato adicionado.
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardHeaderContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardTitleText: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  contactDetailText: {
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: 14,
    marginBottom: 1,
  },
  contactItemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactItemDivider: {
    marginHorizontal: 16,
  },
  contactItemIcon: {
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactTextContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  editButtonTouchable: {
    padding: 8,
  },
  emptyListCentered: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyListText: {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reviewItemIcon: {
    marginRight: 10,
  },
  reviewLabel: {
    fontSize: 13,
  },
  reviewValue: {
    flexWrap: 'wrap',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 30,
  },
  sectionCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
    padding: 0,
    shadowColor: componentColors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  sectionDescription: {
    fontSize: 15,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningCard: {
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 20,
    padding: 12,
  },
  warningCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  warningText: {
    fontSize: 14,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});

export default ReviewStep;
