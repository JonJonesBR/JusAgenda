import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, Icon, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import type { Event } from '../types/event';
import { PRIORIDADES } from '../constants';

interface FormData {
  id?: string;
  tipo: string;
  data: Date;
  local?: string;
  cliente: string;
  observacoes?: string;
  title?: string;
  descricao?: string;
  numeroProcesso?: string;
  competencia?: string;
  vara?: string;
  comarca?: string;
  estado?: string;
  reu?: string;
  telefoneCliente?: string;
  emailCliente?: string;
  telefoneReu?: string;
  emailReu?: string;
  juiz?: string;
  promotor?: string;
  perito?: string;
  prepostoCliente?: string;
  testemunhas?: string;
  documentosNecessarios?: string;
  valor?: string;
  honorarios?: string;
  prazoDias?: string;
  fase?: string;
  prioridade?: string;
}

type RootStackParamList = {
  EventDetails: { event?: FormData; editMode: boolean };
  Home: undefined;
};

interface EventDetailsScreenProps {
  route: {
    params: {
      event?: FormData;
      editMode: boolean;
    };
  };
}

const EventDetailsScreen = ({ route }: EventDetailsScreenProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { event, editMode } = route.params;
  const { deleteEvent, addEvent, updateEvent, refreshEvents } = useEvents();

  const [formData, setFormData] = useState<FormData>({
    id: event?.id,
    tipo: event?.tipo || '',
    data: event?.data ? new Date(event.data) : new Date(),
    local: event?.local || '',
    cliente: event?.cliente || '',
    observacoes: event?.observacoes || '',
    title: event?.title || '',
    descricao: event?.descricao || '',
    numeroProcesso: event?.numeroProcesso || '',
    competencia: event?.competencia || '',
    vara: event?.vara || '',
    comarca: event?.comarca || '',
    estado: event?.estado || '',
    reu: event?.reu || '',
    telefoneCliente: event?.telefoneCliente || '',
    emailCliente: event?.emailCliente || '',
    telefoneReu: event?.telefoneReu || '',
    emailReu: event?.emailReu || '',
    juiz: event?.juiz || '',
    promotor: event?.promotor || '',
    perito: event?.perito || '',
    prepostoCliente: event?.prepostoCliente || '',
    testemunhas: event?.testemunhas || '',
    documentosNecessarios: event?.documentosNecessarios || '',
    valor: event?.valor || '',
    honorarios: event?.honorarios || '',
    prazoDias: event?.prazoDias || '',
    fase: event?.fase || '',
    prioridade: event?.prioridade || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Se não houver evento e não estiver em modo de edição, retorna para a tela anterior
  React.useEffect(() => {
    if (!event && !editMode) {
      navigation.goBack();
    }
  }, [event, editMode]);

  const getEventTypeIcon = () => {
    switch (event?.tipo?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: theme.colors.primary };
      case 'reuniao':
        return { name: 'groups', color: '#03dac6' };
      case 'prazo':
        return { name: 'timer', color: '#ff0266' };
      default:
        return { name: 'event', color: '#018786' };
    }
  };

  const getStatusBadge = () => {
    if (!event?.data) {
      return { label: 'Novo', color: theme.colors.primary };
    }

    const now = new Date();
    const eventDate = new Date(event.data);
    
    if (eventDate < now) {
      return { label: 'Concluído', color: theme.colors.success };
    }
    if (eventDate.toDateString() === now.toDateString()) {
      return { label: 'Hoje', color: theme.colors.warning };
    }
    return { label: 'Agendado', color: theme.colors.primary };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradientHeader: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    badge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    badgeText: {
      color: 'white',
      fontWeight: '500',
      fontSize: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    typeIcon: {
      marginRight: 12,
      backgroundColor: theme.colors.background,
      padding: 8,
      borderRadius: 8,
    },
    screenTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: '600',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    typeBadge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    typeBadgeText: {
      fontWeight: '600',
      fontSize: 14,
    },
    detailSection: {
      borderLeftWidth: 2,
      borderLeftColor: getEventTypeIcon().color,
      paddingLeft: 12,
      marginLeft: 8,
    },
    iconContainer: {
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 8,
      padding: 8,
      marginRight: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      gap: 16,
    },
    mainCard: {
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    formContainer: {
      gap: 16,
    },
  });

  const handleSave = async () => {
    try {
      // Validações obrigatórias
      if (!formData.cliente?.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'O campo "Cliente" é obrigatório',
        });
        return;
      }

      if (!formData.tipo) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'O campo "Tipo de Compromisso" é obrigatório',
        });
        return;
      }

      if (!formData.data) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'A data do compromisso é obrigatória',
        });
        return;
      }

      // Construir o objeto de evento mantendo todos os campos existentes
      const eventData: Event = {
        ...formData, // Mantém todos os campos existentes
        id: event?.id || formData.id || String(Date.now()),
        title: formData.title || formData.cliente || formData.tipo,
        tipo: formData.tipo,
        data: formData.data instanceof Date ? formData.data : new Date(formData.data),
        local: formData.local || '',
        cliente: formData.cliente.trim(),
        descricao: formData.descricao || formData.observacoes || '',
        numeroProcesso: formData.numeroProcesso || '',
        competencia: formData.competencia || '',
        vara: formData.vara || '',
        comarca: formData.comarca || '',
        estado: formData.estado || '',
        reu: formData.reu || '',
        telefoneCliente: formData.telefoneCliente || '',
        emailCliente: formData.emailCliente || '',
        telefoneReu: formData.telefoneReu || '',
        emailReu: formData.emailReu || '',
        juiz: formData.juiz || '',
        promotor: formData.promotor || '',
        perito: formData.perito || '',
        prepostoCliente: formData.prepostoCliente || '',
        testemunhas: formData.testemunhas || '',
        documentosNecessarios: formData.documentosNecessarios || '',
        observacoes: formData.observacoes || formData.descricao || '',
        valor: formData.valor || '',
        honorarios: formData.honorarios || '',
        prazoDias: formData.prazoDias || '',
        fase: formData.fase || '',
        prioridade: (formData.prioridade as "alta" | "media" | "baixa") || PRIORIDADES.MEDIA,
      };

      setIsSaving(true);

      if (editMode && event?.id) {
        // Atualizando evento existente
        await updateEvent(eventData);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Compromisso atualizado com sucesso',
        });
      } else {
        // Criando novo evento
        await addEvent(eventData);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Compromisso criado com sucesso',
        });
      }

      // Atualiza a lista de eventos e retorna
      await refreshEvents();
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error instanceof Error ? error.message : 'Erro ao salvar compromisso',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!event?.id) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não é possível excluir um evento que ainda não foi salvo',
      });
      return;
    }

    const eventId = event.id;
    console.log('Iniciando exclusão do evento:', eventId);

    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este compromisso?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentando excluir evento:', eventId);
              const result = await deleteEvent(eventId);
              
              if (result) {
                Toast.show({
                  type: 'success',
                  text1: 'Sucesso',
                  text2: 'Compromisso excluído com sucesso',
                });
                navigation.goBack();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Não foi possível excluir o compromisso. Evento não encontrado.',
                });
              }
            } catch (error) {
              console.error('Erro ao excluir evento:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: error instanceof Error ? error.message : 'Erro ao excluir compromisso',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderForm = () => (
    <Card containerStyle={styles.mainCard}>
      <View style={styles.formContainer}>
        <Input
          label="Tipo de Compromisso"
          value={formData.tipo}
          onChangeText={(text) => setFormData({ ...formData, tipo: text })}
          placeholder="Ex: Audiência, Reunião, Prazo"
        />

        <Button
          title={formData.data ? new Date(formData.data).toLocaleString('pt-BR') : 'Selecionar Data'}
          onPress={() => setShowDatePicker(true)}
          type="outline"
          icon={{ name: 'calendar-today', color: theme.colors.primary }}
        />

        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.data)}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, data: selectedDate });
              }
            }}
          />
        )}

        <Input
          label="Local"
          value={formData.local}
          onChangeText={(text) => setFormData({ ...formData, local: text })}
          placeholder="Local do compromisso"
        />

        <Input
          label="Cliente"
          value={formData.cliente}
          onChangeText={(text) => setFormData({ ...formData, cliente: text })}
          placeholder="Nome do cliente"
        />

        <Input
          label="Observações"
          value={formData.observacoes}
          onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
          placeholder="Observações adicionais"
          multiline
          numberOfLines={4}
        />

        <View style={styles.actionButtons}>
          <Button
            title="Cancelar"
            type="outline"
            onPress={() => navigation.goBack()}
          />
          <Button
            title="Salvar"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
          />
        </View>
      </View>
    </Card>
  );

  // Se estiver em modo de edição ou criando novo evento, mostra o formulário
  if (editMode || !event) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, '#6F18FF']}
          style={styles.gradientHeader}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Icon 
                name={editMode ? "edit" : "add"} 
                size={28} 
                color={theme.colors.textPrimary} 
                style={styles.typeIcon} 
              />
              <Text h4 style={styles.screenTitle}>
                {editMode ? 'Editar Compromisso' : 'Novo Compromisso'}
              </Text>
            </View>
          </View>
        </LinearGradient>
        {renderForm()}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#6F18FF']}
        style={styles.gradientHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon {...getEventTypeIcon()} size={28} style={styles.typeIcon} />
            <Text h4 style={styles.screenTitle}>
              {editMode ? 'Editar Compromisso' : 'Detalhes do Compromisso'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusBadge().color }]}>
            <Text style={styles.badgeText}>{getStatusBadge().label}</Text>
          </View>
        </View>
      </LinearGradient>

      <Card containerStyle={styles.mainCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Informações Principais</Text>
          <View style={[styles.typeBadge, { backgroundColor: getEventTypeIcon().color + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: getEventTypeIcon().color }]}>
              {event.tipo ? event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1) : 'Evento'}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Icon name="calendar-today" color={theme.colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: theme.colors.textPrimary }}>
                {new Date(event.data).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            {event.local && (
              <View style={styles.detailRow}>
                <Icon name="place" color={theme.colors.textSecondary} />
                <Text style={{ marginLeft: 8, color: theme.colors.textPrimary }}>
                  {event.local}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      {event.cliente && (
        <Card containerStyle={{ borderRadius: 12, marginTop: 16, padding: 16 }}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.detailRow}>
            <Icon name="person" color={theme.colors.textSecondary} />
            <Text style={{ marginLeft: 8, color: theme.colors.textPrimary }}>
              {event.cliente}
            </Text>
          </View>
        </Card>
      )}

      {event.observacoes && (
        <Card containerStyle={{ borderRadius: 12, marginTop: 16, padding: 16 }}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={{ color: theme.colors.textPrimary }}>
            {event.observacoes}
          </Text>
        </Card>
      )}

      <View style={styles.actionButtons}>
        <Button
          title="Editar"
          icon={{ name: 'edit', color: 'white' }}
          buttonStyle={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24 }}
          onPress={() => navigation.navigate('EventDetails', { event, editMode: true })}
          accessibilityLabel="Editar compromisso"
          accessibilityRole="button"
        />
        <Button
          title="Excluir"
          icon={{ name: 'delete', color: 'white' }}
          buttonStyle={{ backgroundColor: theme.colors.error, paddingHorizontal: 24 }}
          onPress={handleDelete}
          accessibilityLabel="Excluir compromisso"
          accessibilityRole="button"
        />
      </View>
    </ScrollView>
  );
};

export default EventDetailsScreen;