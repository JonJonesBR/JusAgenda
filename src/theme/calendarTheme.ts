// src/theme/calendarTheme.ts
import { Theme as AppThemeType, useTheme } from '../contexts/ThemeContext'; // Importa o tipo do seu tema e o hook
import { Theme as CalendarRNTheme } from 'react-native-calendars/src/types'; // Importa o tipo de tema do react-native-calendars

// Função para gerar o tema do calendário com base no tema da aplicação
const getCalendarTheme = (appTheme: AppThemeType): CalendarRNTheme => {
  const { colors, typography, isDark } = appTheme;

  // Define cores base para o calendário
  const calendarColors = {
    calendarBackground: colors.background,
    textSectionTitleColor: colors.text, // Cor dos títulos da seção (dias da semana)
    textSectionTitleDisabledColor: colors.disabled,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.white || '#ffffff', // Cor do texto no dia selecionado (geralmente branco sobre cor primária)
    todayTextColor: colors.primary, // Cor do texto para o dia atual
    dayTextColor: colors.text, // Cor do texto para os dias normais
    textDisabledColor: colors.disabled, // Cor do texto para dias desabilitados (fora do mês)
    dotColor: colors.primary, // Cor dos pontos/marcadores de evento
    selectedDotColor: colors.white || '#ffffff', // Cor dos pontos no dia selecionado
    arrowColor: colors.primary, // Cor das setas de navegação do mês
    disabledArrowColor: colors.disabled,
    monthTextColor: colors.text, // Cor do texto do nome do mês
    indicatorColor: colors.primary, // Cor do indicador (ex: today)
    // textDayFontFamily: typography.fontFamily.regular, // Removido, react-native-calendars não parece suportar diretamente via theme object
    // textMonthFontFamily: typography.fontFamily.bold, // Removido
    // textDayHeaderFontFamily: typography.fontFamily.regular, // Removido
    textDayFontWeight: '400' as const, // Pesos de fonte precisam ser strings literais específicas
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '500' as const, // Um pouco mais de peso para os cabeçalhos dos dias

    // Cores específicas para o tema escuro, se necessário um ajuste fino além do que já vem de `colors`
    ...(isDark && {
      textSectionTitleColor: colors.text, // Geralmente o mesmo que colors.text
      todayTextColor: colors.primary, // Pode precisar de um tom mais vibrante no escuro
      arrowColor: colors.primary,
      // Adicione outros overrides específicos para o tema escuro se necessário
    }),

    // Agenda theme
    agendaDayTextColor: colors.primary,
    agendaDayNumColor: colors.primary,
    agendaTodayColor: colors.appAccent || colors.secondary, // Cor para "Hoje" na agenda
    agendaKnobColor: colors.primary,
    reservationsBackgroundColor: colors.surface, // Cor de fundo para a lista de itens da agenda
  };

  // Adicionando estilos de texto que o react-native-calendars aceita
  // A biblioteca não aceita todas as propriedades de fontFamily diretamente no objeto de tema principal,
  // mas algumas podem ser passadas para componentes específicos ou são inferidas.
  // Os pesos de fonte são mais consistentemente suportados.

  return calendarColors;
};

/**
 * Hook para obter o tema do calendário dinamicamente com base no tema atual da aplicação.
 * @returns CalendarRNTheme - O objeto de tema para react-native-calendars.
 */
export const useCalendarTheme = (): CalendarRNTheme => {
  const { theme } = useTheme(); // Obtém o tema atual da aplicação (light ou dark)
  return getCalendarTheme(theme);
};


// Você também pode exportar os temas gerados diretamente se precisar deles fora de um hook,
// mas isso não seria dinâmico se o tema do app mudar em tempo de execução sem recarregar o componente.
// Para uso estático ou inicialização:
// import { lightTheme as appLightTheme, darkTheme as appDarkTheme } from '../contexts/ThemeContext';
// export const staticLightCalendarTheme = getCalendarTheme(appLightTheme);
// export const staticDarkCalendarTheme = getCalendarTheme(appDarkTheme);

export default useCalendarTheme; // Exporta o hook como padrão
