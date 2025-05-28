// src/screens/UnifiedCalendarScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Calendar, CalendarList, Agenda, DateData, LocaleConfig } from 'react-native-calendars';
import { AgendaEntry, AgendaSchedule } from 'react-native-calendars/src/types'; // Tipos para Agenda
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType } from '../types/event';
import { useCalendarTheme } from '../theme/calendarTheme'; // Hook para o tema do calendário
import { formatDate, parseISO, formatTime, isSameDate, startOfDay, isDateValid } from '../utils/dateUtils';
import { Header, Card, Button, List } from '../components/ui'; // Usando List em vez de DraggableFlatList por simplicidade inicial
import { ROUTES, getEventTypeLabel } from '../constants';
// Se a sua stack de calendário for diferente da HomeStack, ajuste a importação e o tipo
import { HomeStackParamList } from '../navigation/stacks/HomeStack';
import { Toast } from '../components/ui/Toast';

// Configuração de locale para react-native-calendars (Português)
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
  today: "Hoje",
};
LocaleConfig.defaultLocale = 'pt-br';

// Tipagem para a prop de navegação
type UnifiedCalendarScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.UNIFIED_CALENDAR>;


const UnifiedCalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const calendarAppTheme = useCalendarTheme(); // Tema dinâmico para o calendário
  const { events: allEvents, deleteEvent } = useEvents();
  const navigation = useNavigation<UnifiedCalendarScreenNavigationProp>();

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date(), 'yyyy-MM-dd')); // Data selecionada no formato YYYY-MM-DD
  const [agendaItems, setAgendaItems] = useState<AgendaSchedule>({});
  // const [showAgenda, setShowAgenda] = useState(true); // Para alternar entre CalendarList e Agenda, se desejado

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    // Se estiver a usar o componente Agenda, ele lida com o carregamento de itens para o dia.
    // Se estiver a usar Calendar + FlatList separada, atualize a lista de eventos para o dia aqui.
  }, []);

  // Memoiza os markedDates para performance
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    allEvents.forEach(event => {
      if (event.data && isDateValid(parseISO(event.data))) {
        const dateStr = event.data; // Deve estar em YYYY-MM-DD
        if (!marks[dateStr]) {
          marks[dateStr] = { dots: [], marked: true };
        }
        // Adiciona um ponto para cada evento, limitado para não poluir
        if (marks[dateStr].dots.length < 3) {
          marks[dateStr].dots.push({
            key: event.id,
            color: event.cor || theme.colors.primary, // Usa a cor do evento ou a primária do tema
            // selectedDotColor: theme.colors.white, // Opcional
          });
        }
      }
    });

    // Marca a data selecionada
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: theme.colors.primary, selectedTextColor: theme.colors.white };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: theme.colors.primary, selectedTextColor: theme.colors.white, disableTouchEvent: false };
    }
    return marks;
  }, [allEvents, selectedDate, theme.colors.primary, theme.colors.white]);


  // Carrega itens para o componente Agenda
  // O componente Agenda chama esta função quando precisa carregar mais itens.
  const loadItemsForAgenda = useCallback((day: DateData) => {
    // console.log(`loadItemsForAgenda: Carregando itens para o dia ${day.dateString}`);
    const newItems = { ...agendaItems };

    // Adiciona um array vazio para os próximos 15 dias se ainda não estiverem carregados
    // para permitir o scroll infinito da Agenda.
    for (let i = -15; i < 15; i++) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      const strTime = formatDate(new Date(time), 'yyyy-MM-dd');
      if (!newItems[strTime]) {
        newItems[strTime] = [];
      }
    }

    // Preenche os eventos para as datas visíveis ou recém-carregadas
    // Esta lógica pode ser otimizada para carregar apenas os dias necessários.
    Object.keys(newItems).forEach(dateStr => {
        // Se já tem itens (e não é um array vazio placeholder), não recarrega a menos que queira
        // if (newItems[dateStr].length > 0 && !forceReload) continue;

        newItems[dateStr] = allEvents
            .filter(event => event.data === dateStr)
            .map(event => ({
                ...event, // Espalha todas as propriedades do evento
                name: event.title, // Propriedade 'name' é esperada por renderItem da Agenda
                height: Math.max(70, Math.floor(Math.random() * 150)), // Altura aleatória para exemplo
                day: dateStr, // Necessário para o componente Agenda
            }))
            .sort((a, b) => { // Ordena por hora
                const timeA = a.hora ? a.hora.replace(':', '') : (a.isAllDay ? '0000' : '2359'); // Dia todo primeiro
                const timeB = b.hora ? b.hora.replace(':', '') : (b.isAllDay ? '0000' : '2359');
                return timeA.localeCompare(timeB);
            });
    });

    setAgendaItems(newItems);
  }, [allEvents, agendaItems]); // agendaItems como dependência pode causar re-cálculos, otimizar se necessário

  // Recarrega os itens da agenda quando os eventos do contexto mudam ou a tela foca
  useFocusEffect(
    useCallback(() => {
      // console.log("UnifiedCalendarScreen: Tela focada, recarregando itens da agenda.");
      // Força o recarregamento para a data selecionada atualmente
      // É importante resetar agendaItems para forçar o Agenda a chamar loadItems
      setAgendaItems({}); // Reseta para forçar o loadItems
      // A chamada inicial de loadItems será feita pelo componente Agenda ao montar
      // ou quando selectedDate mudar se o componente Agenda estiver visível.
      // Se não estiver a usar o componente Agenda, esta lógica pode ser diferente.
    }, [allEvents]) // Depende de allEvents para recarregar se eles mudarem
  );


  const navigateToEventDetails = (dateString?: string) => {
    navigation.navigate(ROUTES.EVENT_DETAILS, { initialDateString: dateString || selectedDate });
  };

  const navigateToEventView = (event: EventType) => {
    navigation.navigate(ROUTES.EVENT_VIEW, { eventId: event.id, eventTitle: event.title, event });
  };

  const renderAgendaItem = (reservation: AgendaEntry, isFirst: boolean) => {
    const item = reservation as EventType & { name: string; height: number; day: string }; // Cast para o tipo esperado

    return (
      <TouchableOpacity
        style={[styles.agendaItem, { height: item.height, backgroundColor: item.cor || theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => navigateToEventView(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.agendaItemText, { color: item.cor ? theme.colors.white : theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {item.name}
        </Text>
        <Text style={[styles.agendaItemDetail, { color: item.cor ? theme.colors.white : theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
          {item.hora ? formatTime(combineDateTime(item.day, item.hora)) : (item.isAllDay ? 'Dia Todo' : '')}
        </Text>
        {item.local && (
          <Text style={[styles.agendaItemDetail, { color: item.cor ? theme.colors.white : theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            {item.local}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyAgendaData = () => {
    return (
      <View style={styles.emptyAgendaContainer}>
        <MaterialCommunityIcons name="calendar-remove-outline" size={48} color={theme.colors.placeholder} />
        <Text style={[styles.emptyAgendaText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
          Nenhum evento para este dia.
        </Text>
        <Button
            title="Adicionar Evento"
            onPress={() => navigateToEventDetails(selectedDate)}
            type="outline"
            size="sm"
            icon="plus"
            buttonStyle={{marginTop: theme.spacing.md}}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* O Header é agora fornecido pelo BottomTabNavigator para esta tela, conforme configurado lá */}
      {/* <Header title="Calendário Unificado" /> */}

      <Agenda
        // Test ID para facilitar testes
        testID="agenda"
        items={agendaItems}
        loadItemsForMonth={loadItemsForAgenda} // Usar loadItemsForMonth que é chamado para cada mês visível
        selected={selectedDate} // Data selecionada inicialmente
        onDayPress={onDayPress} // Quando um dia é pressionado no calendário
        renderItem={renderAgendaItem}
        renderEmptyData={renderEmptyAgendaData}
        // rowHasChanged={(r1, r2) => r1.name !== r2.name} // Otimização se os itens mudarem
        showClosingKnob={true} // Para fechar a parte do calendário e mostrar mais da agenda
        // markingType={'multi-dot'} // Se estiver a usar múltiplos pontos
        markedDates={markedDates} // Datas marcadas
        monthFormat={'MMMM yyyy'}
        theme={{
          ...calendarAppTheme, // Aplica o tema base do calendário
          agendaDayTextColor: theme.colors.primary,
          agendaDayNumColor: theme.colors.primary,
          agendaTodayColor: theme.colors.appAccent || theme.colors.secondary,
          agendaKnobColor: theme.colors.primary,
          reservationsBackgroundColor: theme.colors.background, // Fundo da lista de itens da agenda
          // Outras personalizações de tema específicas da Agenda
          // calendarBackground: theme.colors.card, // Fundo do calendário em si
          // textSectionTitleColor: theme.colors.text,
          // selectedDayBackgroundColor: theme.colors.primary,
          // todayTextColor: theme.colors.primary,
          // dayTextColor: theme.colors.text,
          // textDisabledColor: theme.colors.disabled,
        }}
        // renderDay={(day, item) => (<Text>{day ? day.day : 'item'}</Text>)} // Para renderização customizada do dia
        // hideExtraDays={false} // Mostrar dias do mês anterior/seguinte
        // showOnlySelectedDayItems // Mostra itens apenas para o dia selecionado (se não usar a parte do calendário)
        // firstDay={1} // Começar a semana na Segunda (1) ou Domingo (0)
      />

      {/* Botão Flutuante para Adicionar Evento */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigateToEventDetails(selectedDate)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color={theme.colors.white || '#ffffff'} />
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  agendaItem: {
    // backgroundColor: // definido dinamicamente
    borderRadius: 8, // Usar theme.radii.md
    padding: 12, // Usar theme.spacing.sm ou md
    marginRight: 10,
    marginTop: 17, // Espaçamento padrão da Agenda
    borderWidth: 1,
  },
  agendaItemText: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    // fontWeight e fontFamily são dinâmicos
    // Cor é dinâmica
  },
  agendaItemDetail: {
    fontSize: 13, // Usar theme.typography.fontSize.xs
    marginTop: 3,
    // Cor e fontFamily são dinâmicos
  },
  emptyAgendaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Usar theme.spacing.lg
  },
  emptyAgendaText: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    marginTop: 16, // Usar theme.spacing.md
    textAlign: 'center',
  },
  fab: { // Duplicado de HomeScreen, pode ser um componente global
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default UnifiedCalendarScreen;
