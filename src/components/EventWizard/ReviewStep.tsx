import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import moment from 'moment';

interface ReviewStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
  isEditMode?: boolean;
}

/**
 * Quarto passo do wizard - Revisão final dos dados do evento
 */
const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  // Obter o item de revisão se tiver valor
  const getReviewItem = (label: string, value: any, icon: string) => {
    if (!value && value !== false) return null;
    
    let displayValue = value;
    
    // Formatação de valores específicos
    if (label === 'Data' && value) {
      displayValue = moment(value).format('DD/MM/YYYY');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Sim' : 'Não';
    }
    
    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Icon 
            name={icon} 
            type="material-community" 
            size={18} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.reviewLabel, { color: theme.colors.text }]}>
            {label}:
          </Text>
        </View>
        <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
          {displayValue}
        </Text>
      </View>
    );
  };

  // Verificar se todos os campos obrigatórios foram preenchidos
  const hasRequiredFields = data.titulo && data.data && data.tipo;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Revisão do Evento
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey1 || '#999' }]}>
        Revise todas as informações antes de {isEditMode ? 'salvar' : 'criar'} o evento.
      </Text>

      {!hasRequiredFields && (
        <Card containerStyle={[styles.warningCard, { backgroundColor: theme.colors.error, opacity: 0.8 }]}>
          <Card.Title style={{ color: 'white' }}>Informações Incompletas</Card.Title>
          <Text style={{ color: 'white' }}>
            Preencha todos os campos obrigatórios (Título, Data e Tipo) antes de continuar.
          </Text>
        </Card>
      )}

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.grey5 || '#e0e0e0' }]}>
        <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}>
          <Icon 
            name="information-outline" 
            type="material-community" 
            size={18} 
            color={theme.colors.primary}
            style={styles.titleIcon}
          />
          Informações Básicas
        </Card.Title>
        <Card.Divider />
        
        {getReviewItem('Título', data.titulo, 'format-title')}
        {getReviewItem('Tipo', data.tipo, 'tag')}
        {getReviewItem('Data', data.data, 'calendar')}
        {getReviewItem('Descrição', data.descricao, 'text')}
        {getReviewItem('Local', data.local, 'map-marker')}
      </Card>

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.grey5 || '#e0e0e0' }]}>
        <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}>
          <Icon 
            name="file-document-outline" 
            type="material-community" 
            size={18} 
            color={theme.colors.primary}
            style={styles.titleIcon}
          />
          Detalhes Processuais
        </Card.Title>
        <Card.Divider />
        
        {getReviewItem('Número do Processo', data.numeroProcesso, 'numeric')}
        {getReviewItem('Vara/Tribunal', data.vara, 'gavel')}
        {getReviewItem('Prioridade', data.prioridade, 'alert-circle-outline')}
        {getReviewItem('Presença Obrigatória', data.presencaObrigatoria, 'account-check')}
        {getReviewItem('Lembretes Configurados', data.lembretes, 'bell-outline')}
        {getReviewItem('Observações', data.observacoes, 'note-text')}
      </Card>

      <Card containerStyle={[styles.sectionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.grey5 || '#e0e0e0' }]}>
        <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}>
          <Icon 
            name="account-group" 
            type="material-community" 
            size={18} 
            color={theme.colors.primary}
            style={styles.titleIcon}
          />
          Contatos ({data.contatos?.length || 0})
        </Card.Title>
        <Card.Divider />
        
        {data.contatos && data.contatos.length > 0 ? (
          data.contatos.map((contact, index) => (
            <View key={contact.id}>
              <View style={styles.contactContainer}>
                <Text style={[styles.contactName, { color: theme.colors.text }]}>
                  {contact.nome}
                </Text>
                <View style={styles.contactDetails}>
                  {contact.telefone && (
                    <Text style={[styles.contactInfo, { color: theme.colors.grey1 || '#999' }]}>
                      <Icon 
                        name="phone" 
                        type="material-community" 
                        size={14} 
                        color={theme.colors.grey1 || '#999'} 
                      /> {contact.telefone}
                    </Text>
                  )}
                  {contact.email && (
                    <Text style={[styles.contactInfo, { color: theme.colors.grey1 || '#999' }]}>
                      <Icon 
                        name="email" 
                        type="material-community" 
                        size={14} 
                        color={theme.colors.grey1 || '#999'} 
                      /> {contact.email}
                    </Text>
                  )}
                </View>
              </View>
              {index < data.contatos.length - 1 && <Divider style={styles.contactDivider} />}
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.grey1 || '#999' }]}>
            Nenhum contato adicionado
          </Text>
        )}
      </Card>
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
  warningCard: {
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 0,
  },
  sectionCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    textAlign: 'left',
    marginLeft: 5,
  },
  titleIcon: {
    marginRight: 8,
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  reviewValue: {
    fontSize: 16,
    marginLeft: 26,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  contactContainer: {
    marginVertical: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactDetails: {
    marginLeft: 10,
  },
  contactInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactDivider: {
    marginVertical: 8,
  },
});

export default ReviewStep;
