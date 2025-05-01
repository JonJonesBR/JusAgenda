/**
 * Tema personalizado para o componente de Calendário
 * Baseado nas propriedades suportadas por react-native-calendars
 */
export const calendarTheme = {
  // Estilos gerais
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#b6c1cd',
  textSectionTitleDisabledColor: '#d9e1e8',
  selectedDayBackgroundColor: '#4a6da7',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#4a6da7',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  dotColor: '#4a6da7',
  selectedDotColor: '#ffffff',
  arrowColor: '#4a6da7',
  disabledArrowColor: '#d9e1e8',
  monthTextColor: '#2d4150',
  indicatorColor: '#4a6da7',
  
  // Estilo do texto do dia
  textDayFontWeight: '300',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '300',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 13,
  
  // Agenda específico
  agendaDayTextColor: '#2d4150',
  agendaDayNumColor: '#2d4150',
  agendaTodayColor: '#4a6da7',
  agendaKnobColor: '#4a6da7',
  
  // Dia
  'stylesheet.day.basic': {
    base: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    selected: {
      backgroundColor: '#4a6da7',
      borderRadius: 16,
    }
  },
  
  // Cabeçalho
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 8,
      alignItems: 'center',
    }
  }
};
