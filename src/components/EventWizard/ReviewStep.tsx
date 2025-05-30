// src/components/EventWizard/ReviewStep.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// MaterialCommunityIcons will be imported by DetailDisplayItem if needed, or pass icon names
import { Section, DetailDisplayItem } from '../ui'; // Seu componente Section e o novo DetailDisplayItem
// Theme prop is no longer needed for DetailDisplayItem
import { EventContact, Reminder } from '../../types/event'; // Tipos de Contact e Reminder
import { REMINDER_OPTIONS } from '../../constants'; // Labels e opções, EVENT_TYPE_LABELS, PRIORIDADE_LABELS might be passed in formData already formatted

// Este formData será uma versão formatada para exibição
interface ReviewStepFormData {
  title?: string;
  eventType?: string; // Já será o label
  data?: string; // Já formatada como DD/MM/YYYY
  hora?: string; // Já formatada como HH:MM ou "Dia Todo"
  isAllDay?: boolean;
  local?: string;
  description?: string;
  cor?: string;

  numeroProcesso?: string;
  vara?: string;
  comarca?: string;
  instancia?: string;
  naturezaAcao?: string;
  faseProcessual?: string;
  linkProcesso?: string;
  prioridade?: string; // Já será o label
  presencaObrigatoria?: boolean;
  observacoes?: string;

  clienteNome?: string;
  contacts?: EventContact[];
  reminders?: Reminder[];
  [key: string]: any; // Para outros campos que possam existir
}

interface ReviewStepProps {
  formData: ReviewStepFormData;
  onEditStep: (stepIndex: number) => void;
  isReadOnly: boolean;
  theme: Theme; // theme prop can be removed if Section also uses useTheme or if its styling is static here
}

// DetailItem local component is removed.

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onEditStep,
  isReadOnly,
  theme, // This theme is for Section, DetailDisplayItem uses its own.
}) => {

  const formatReminders = (reminders?: Reminder[]): string => {
    if (!reminders || reminders.length === 0) return 'Nenhum';
    return reminders
      .map(rValue => REMINDER_OPTIONS.find(opt => opt.value === rValue)?.label || `${rValue} min`)
      .join(', ');
  };

  const renderContacts = (contacts?: EventContact[]) => { // This function returns ReactNode, suitable for DetailDisplayItem's value
    if (!contacts || contacts.length === 0) {
      return <Text style={{ color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, paddingVertical: 8 }}>Nenhum contacto adicional.</Text>;
    }
    return contacts.map((contact, index) => (
      <View key={contact.id || index} style={[styles.contactReviewItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm}]}>
        <Text style={[styles.contactNameReview, {color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold}]}>{contact.name}</Text>
        {contact.role && <Text style={[styles.contactDetailReview, {color: theme.colors.textMuted}]}>Papel: {contact.role}</Text>}
        {contact.phone && <Text style={[styles.contactDetailReview, {color: theme.colors.textMuted}]}>Telefone: {contact.phone}</Text>}
        {contact.email && <Text style={[styles.contactDetailReview, {color: theme.colors.textMuted}]}>Email: {contact.email}</Text>}
      </View>
    ));
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailDisplayItem label="Título" value={formData.title} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="format-title" />
        <DetailDisplayItem label="Tipo de Evento" value={formData.eventType} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="tag-outline" />
        <DetailDisplayItem label="Data" value={formData.data} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="calendar" />
        {!formData.isAllDay && formData.hora && (
            <DetailDisplayItem label="Hora" value={formData.hora} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="clock-outline" />
        )}
        <DetailDisplayItem label="Dia Todo" value={formData.isAllDay} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="calendar-check"/>
        <DetailDisplayItem label="Local" value={formData.local} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="map-marker-outline" />
        <DetailDisplayItem label="Cor (Hex)" value={formData.cor} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} iconName="palette-outline"/>
        <DetailDisplayItem label="Descrição" value={formData.description} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} fullWidthValue iconName="text-long"/>
      </Section>

      <Section title="Detalhes do Processo" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailDisplayItem label="Nº do Processo" value={formData.numeroProcesso} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="gavel"/>
        <DetailDisplayItem label="Vara/Tribunal" value={formData.vara} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="bank-outline"/>
        <DetailDisplayItem label="Comarca" value={formData.comarca} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="map-legend"/>
        <DetailDisplayItem label="Instância" value={formData.instancia} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="layers-outline"/>
        <DetailDisplayItem label="Natureza da Ação" value={formData.naturezaAcao} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="scale-balance"/>
        <DetailDisplayItem label="Fase Processual" value={formData.faseProcessual} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="progress-check"/>
        <DetailDisplayItem label="Link do Processo" value={formData.linkProcesso} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue iconName="link-variant"/>
        <DetailDisplayItem label="Prioridade" value={formData.prioridade} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="priority-high"/>
        <DetailDisplayItem label="Presença Obrigatória" value={formData.presencaObrigatoria} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} iconName="account-check-outline"/>
        <DetailDisplayItem label="Lembretes" value={formatReminders(formData.reminders)} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue iconName="bell-ring-outline"/>
        <DetailDisplayItem label="Observações (Processo)" value={formData.observacoes} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue iconName="text-box-outline"/>
      </Section>

      <Section title="Contactos" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailDisplayItem label="Cliente Principal" value={formData.clienteNome} onEditPress={() => onEditStep(2)} isReadOnly={isReadOnly} iconName="account-star-outline"/>
        <DetailDisplayItem
            label="Contactos Adicionais"
            value={renderContacts(formData.contacts)}
            onEditPress={() => onEditStep(2)}
            isReadOnly={isReadOnly}
            fullWidthValue
            // iconName="account-multiple-outline" // Icon for the "Contactos Adicionais" label itself
        />
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
    paddingBottom: 20, // Espaço extra no final
  },
  sectionSpacing: {
    marginBottom: 16, // Usar theme.spacing.lg
  },
  detailItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alinha no topo se o valor for multiline
    paddingVertical: 8, // Usar theme.spacing.xs ou sm
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor é definido dinamicamente ou removido se for o último item
  },
  detailTextContainer: {
    flex: 1, // Permite que o texto do valor quebre a linha
    flexDirection: 'row', // Para alinhar label e valor na mesma linha
    // Se fullWidthValue for true, o valor pode precisar de um wrapper View com flex:1
  },
  detailLabel: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    marginRight: 8, // Usar theme.spacing.sm
    // Cor e fontFamily são dinâmicas
  },
  detailValue: {
    flexShrink: 1, // Permite que o valor encolha se necessário
    alignItems: 'flex-start',
  },
  detailValueFullWidth: {
    flex: 1, // Ocupa o espaço restante
    alignItems: 'flex-start',
  },
  detailValueText: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    textAlign: 'left',
    // Cor e fontFamily são dinâmicas
  },
  editButton: {
    paddingLeft: 12, // Usar theme.spacing.sm
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactReviewItem: {
    padding: 10, // Usar theme.spacing.sm
    marginBottom: 8, // Usar theme.spacing.xs
    // backgroundColor, borderColor, borderRadius são dinâmicos
  },
  contactNameReview: {
    fontSize: 15, // Usar theme.typography.fontSize.sm ou md
    // fontWeight é dinâmico
    marginBottom: 3,
  },
  contactDetailReview: {
    fontSize: 13, // Usar theme.typography.fontSize.xs
    color: '#666', // Usar theme.colors.placeholder ou text secundário
  },
  readOnlyMessage: {
    textAlign: 'center',
    padding: 16, // Usar theme.spacing.md
    fontSize: 13, // Usar theme.typography.fontSize.xs
    // Cor e fontFamily são dinâmicas
  },
});

export default ReviewStep;
