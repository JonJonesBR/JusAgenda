import { Theme as CalendarRNTheme } from 'react-native-calendars/src/types'; // Renomeado para evitar conflito com seu tipo Theme
import { Theme as AppTheme } from '../contexts/ThemeContext'; // Importar seu tipo de tema principal

/**
 * Gera um objeto de tema para react-native-calendars baseado no tema claro do aplicativo.
 * @param {AppTheme} appTheme - O objeto de tema principal do aplicativo (claro).
 * @returns {CalendarRNTheme} - O objeto de tema para react-native-calendars.
 */
export const getCalendarLightTheme = (appTheme: AppTheme): CalendarRNTheme => {
  // Usar cores do tema principal com fallbacks razoáveis
  const primaryColor = appTheme.colors.primary || '#6200ee';
  const textColor = appTheme.colors.text || '#2d4150';
  const textSecondaryColor = appTheme.colors.textSecondary || '#b6c1cd';
  const backgroundColor = appTheme.colors.background || '#ffffff';
  const surfaceColor = appTheme.colors.card || '#ffffff'; // Usar cor do card ou background
  const disabledColor = appTheme.colors.textSecondary || '#d9e1e8'; // Replaced disabled with textSecondary
  const onPrimaryColor = appTheme.colors.onPrimary || '#ffffff';

  // Usar fontes do tema principal se disponíveis
  // const textBase = { // Removido, pois não está sendo usado
  //   // fontFamily: appTheme.typography?.fontFamily?.regular || undefined, // Descomente se tiver fontes no tema
  // };
  // const textBold = { // Removido, pois não está sendo usado
  //   // fontFamily: appTheme.typography?.fontFamily?.bold || undefined, // Descomente se tiver fontes no tema
  //   fontWeight: 'bold' as const, // Manter bold explícito
  // };
  //  const textMedium = { // Removido, pois não está sendo usado
  //   // fontFamily: appTheme.typography?.fontFamily?.medium || undefined, // Descomente se tiver fontes no tema
  //   fontWeight: '300' as const, // Manter como no original
  // };
  const baseFontSize = appTheme.typography?.fontSize?.md || 16; // Usar tamanho médio como base

  return {
    // Cores
    backgroundColor: backgroundColor,
    calendarBackground: surfaceColor, // Fundo do calendário pode ser a cor do card/surface
    textSectionTitleColor: textSecondaryColor,
    textSectionTitleDisabledColor: disabledColor,
    selectedDayBackgroundColor: primaryColor,
    selectedDayTextColor: onPrimaryColor,
    todayTextColor: primaryColor,
    dayTextColor: textColor,
    textDisabledColor: disabledColor,
    dotColor: primaryColor,
    selectedDotColor: onPrimaryColor,
    arrowColor: primaryColor,
    disabledArrowColor: disabledColor,
    monthTextColor: textColor, // Pode querer uma cor diferente (ex: primaryColor)
    indicatorColor: primaryColor,

    // Fontes (baseado nos estilos originais)
    // textDayFontFamily: textBase.fontFamily, // Descomente se tiver fontes no tema
    textDayFontWeight: '300', // Mantido do original
    textDayFontSize: baseFontSize,

    // textMonthFontFamily: textBold.fontFamily, // Descomente se tiver fontes no tema
    textMonthFontWeight: 'bold',
    textMonthFontSize: baseFontSize,

    // textDayHeaderFontFamily: textBase.fontFamily, // Descomente se tiver fontes no tema
    textDayHeaderFontWeight: '300',
    textDayHeaderFontSize: baseFontSize * 0.85, // Header um pouco menor

    // agendaDayTextColor: // Para AgendaList
    // agendaDayNumColor: // Para AgendaList
    // agendaTodayColor: // Para AgendaList
    // agendaKnobColor: // Para AgendaList
    // todayBackgroundColor: // Fundo do dia atual (se diferente de apenas texto)
    //reservationsBackgroundColor // Cor de fundo para a lista de eventos em AgendaList
    // ... outras propriedades se necessário
  };
};

/**
 * Gera um objeto de tema para react-native-calendars baseado no tema escuro do aplicativo.
 * @param {AppTheme} appTheme - O objeto de tema principal do aplicativo (escuro).
 * @returns {CalendarRNTheme} - O objeto de tema para react-native-calendars.
 */
export const getCalendarDarkTheme = (appTheme: AppTheme): CalendarRNTheme => {
   // Usar cores do tema principal escuro com fallbacks
  const primaryColor = appTheme.colors.primary || '#BB86FC'; // Cor primária do tema escuro
  const textColor = appTheme.colors.text || '#ffffff';
  const textSecondaryColor = appTheme.colors.textSecondary || '#a0a0a0'; // Um cinza claro para secundário
  const backgroundColor = appTheme.colors.background || '#121212';
  const surfaceColor = appTheme.colors.card || '#1e1e1e'; // Cor de card/surface escura
  // Cor desabilitada precisa ser visível no fundo escuro
  const disabledColor = appTheme.colors.textSecondary || '#555555'; // Replaced disabled with textSecondary (darker fallback retained)
  const onPrimaryColor = appTheme.colors.onPrimary || '#000000'; // Texto sobre o primário (pode ser preto ou branco dependendo do primário)

  // Pegar o tema claro como base e sobrescrever
  const baseTheme = getCalendarLightTheme(appTheme); // Chama a função do tema claro para obter fontes/tamanhos base

  return {
    ...baseTheme, // Herda fontes, tamanhos e outras props não sobrescritas

    // Sobrescrever cores para modo escuro
    backgroundColor: backgroundColor,
    calendarBackground: surfaceColor,
    textSectionTitleColor: textSecondaryColor, // Título da seção pode ser secundário
    textSectionTitleDisabledColor: disabledColor,
    selectedDayBackgroundColor: primaryColor,
    selectedDayTextColor: onPrimaryColor, // Cor sobre o primário escuro
    todayTextColor: primaryColor,
    dayTextColor: textColor, // Cor de texto padrão escura
    textDisabledColor: disabledColor, // Cor desabilitada escura
    dotColor: primaryColor,
    selectedDotColor: onPrimaryColor, // Cor sobre o primário escuro
    arrowColor: primaryColor,
    disabledArrowColor: disabledColor, // Cor desabilitada escura
    monthTextColor: textColor, // Cor do mês escura
    indicatorColor: primaryColor,
    // Garantir que outras cores herdadas do lightTheme façam sentido ou sobrescrevê-las
  };
};

// Você também pode exportar um objeto que contém ambas as funções
export const calendarThemes = {
    light: getCalendarLightTheme,
    dark: getCalendarDarkTheme,
};
