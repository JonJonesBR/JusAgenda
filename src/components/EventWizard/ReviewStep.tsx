// src/components/EventWizard/ReviewStep.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../ui'; // Seu componente Section
import { Theme } from '../../contexts/ThemeContext'; // Tipo do tema
import { EventContact, Reminder } from '../../types/event'; // Tipos de Contact e Reminder
import { EVENT_TYPE_LABELS, PRIORIDADE_LABELS, REMINDER_OPTIONS } from '../../constants'; // Labels e opções

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
  theme: Theme; // Recebe o tema como prop
}

// Componente auxiliar para renderizar cada item de detalhe
const DetailItem: React.FC<{
  label: string;
  value?: string | number | boolean | React.ReactNode;
  theme: Theme;
  isReadOnly?: boolean;
  onEditPress?: () => void;
  fullWidthValue?: boolean; // Se o valor deve ocupar mais espaço
}> = ({ label, value, theme, isReadOnly, onEditPress, fullWidthValue = false }) => {
  if (value === undefined || value === null || value === '') {
    // Não renderiza o item se o valor for nulo, indefinido ou string vazia
    // Pode querer mostrar "Não informado" dependendo do campo
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
                 <Text style={[styles.detailValueText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
                    {displayValue}
                 </Text>
            ) : (
                displayValue // Se for um ReactNode (ex: lista de contactos)
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


const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onEditStep,
  isReadOnly,
  theme,
}) => {

  const formatReminders = (reminders?: Reminder[]): string => {
    if (!reminders || reminders.length === 0) return 'Nenhum';
    return reminders
      .map(rValue => REMINDER_OPTIONS.find(opt => opt.value === rValue)?.label || `${rValue} min`)
      .join(', ');
  };

  const renderContacts = (contacts?: EventContact[]) => {
    if (!contacts || contacts.length === 0) {
      return <Text style={{ color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }}>Nenhum contacto adicional.</Text>;
    }
    return contacts.map((contact, index) => (
      <View key={contact.id || index} style={[styles.contactReviewItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm}]}>
        <Text style={[styles.contactNameReview, {color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold}]}>{contact.name}</Text>
        {contact.role && <Text style={styles.contactDetailReview}>Papel: {contact.role}</Text>}
        {contact.phone && <Text style={styles.contactDetailReview}>Telefone: {contact.phone}</Text>}
        {contact.email && <Text style={styles.contactDetailReview}>Email: {contact.email}</Text>}
      </View>
    ));
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailItem label="Título" value={formData.title} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailItem label="Tipo de Evento" value={formData.eventType} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailItem label="Data" value={formData.data} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        {!formData.isAllDay && formData.hora && (
            <DetailItem label="Hora" value={formData.hora} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        )}
        <DetailItem label="Dia Todo" value={formData.isAllDay} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailItem label="Local" value={formData.local} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailItem label="Cor (Hex)" value={formData.cor} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} />
        <DetailItem label="Descrição" value={formData.description} theme={theme} onEditPress={() => onEditStep(0)} isReadOnly={isReadOnly} fullWidthValue/>
      </Section>

      <Section title="Detalhes do Processo" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailItem label="Nº do Processo" value={formData.numeroProcesso} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Vara/Tribunal" value={formData.vara} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Comarca" value={formData.comarca} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Instância" value={formData.instancia} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Natureza da Ação" value={formData.naturezaAcao} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Fase Processual" value={formData.faseProcessual} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Link do Processo" value={formData.linkProcesso} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue/>
        <DetailItem label="Prioridade" value={formData.prioridade} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Presença Obrigatória" value={formData.presencaObrigatoria} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} />
        <DetailItem label="Lembretes" value={formatReminders(formData.reminders)} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue/>
        <DetailItem label="Observações (Processo)" value={formData.observacoes} theme={theme} onEditPress={() => onEditStep(1)} isReadOnly={isReadOnly} fullWidthValue/>
      </Section>

      <Section title="Contactos" theme={theme} style={styles.sectionSpacing} showSeparator>
        <DetailItem label="Cliente Principal" value={formData.clienteNome} theme={theme} onEditPress={() => onEditStep(2)} isReadOnly={isReadOnly} />
        <DetailItem
            label="Contactos Adicionais"
            value={renderContacts(formData.contacts)}
            theme={theme}
            onEditPress={() => onEditStep(2)}
            isReadOnly={isReadOnly}
            fullWidthValue
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
