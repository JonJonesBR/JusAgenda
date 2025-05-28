// src/utils/dateUtils.ts
import {
  format,
  parse,
  getDaysInMonth as dfGetDaysInMonth, // Renomeado para evitar conflito de nome se houver
  addDays as dfAddDays,               // Renomeado
  isSameDay as dfIsSameDay,           // Renomeado
  startOfDay as dfStartOfDay,         // Renomeado
  endOfDay as dfEndOfDay,             // Renomeado
  isValid,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatação em Português do Brasil

// Função auxiliar para garantir que estamos lidando com um objeto Date
const ensureDateObject = (date: string | number | Date): Date => {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    // Tenta parseISO primeiro, que é mais robusto para formatos padrão
    const parsedISO = parseISO(date);
    if (isValid(parsedISO)) {
      return parsedISO;
    }
    // Fallback para formatos comuns se parseISO falhar ou para formatos específicos
    // Ex: se você sabe que a string é 'dd/MM/yyyy', use parse(date, 'dd/MM/yyyy', new Date(), { locale: ptBR })
    // Por enquanto, vamos assumir que strings de data são compatíveis com new Date() ou parseISO
    console.warn(`dateUtils: A string de data "${date}" está sendo passada para new Date(). Considere usar parseISO ou parse com formato específico.`);
  }
  return new Date(date);
};

/**
 * Formata uma data para uma string.
 * @param date A data a ser formatada (Date, string ou número).
 * @param formatString O formato desejado (padrão date-fns, ex: 'dd/MM/yyyy').
 * @returns A data formatada como string.
 */
export const formatDate = (
  date: string | number | Date,
  formatString: string = 'yyyy-MM-dd' // Padrão para YYYY-MM-DD
): string => {
  try {
    const dateObj = ensureDateObject(date);
    if (!isValid(dateObj)) {
      console.warn(`formatDate: Data inválida fornecida - ${date}`);
      return 'Data inválida';
    }
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error(`Erro ao formatar data "${date}" com formato "${formatString}":`, error);
    return 'Erro na data';
  }
};

/**
 * Formata uma data e hora para uma string.
 * @param date A data e hora a ser formatada (Date, string ou número).
 * @param formatString O formato desejado (padrão date-fns, ex: 'dd/MM/yyyy HH:mm').
 * @returns A data e hora formatada como string.
 */
export const formatDateTime = (
  date: string | number | Date,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatDate(date, formatString); // Reutiliza formatDate
};

/**
 * Obtém o número de dias em um determinado mês de uma data.
 * @param date A data (Date, string ou número).
 * @returns O número de dias no mês.
 */
export const getDaysInMonth = (date: string | number | Date): number => {
  try {
    const dateObj = ensureDateObject(date);
     if (!isValid(dateObj)) return 30; // Fallback
    return dfGetDaysInMonth(dateObj);
  } catch (error) {
    console.error(`Erro em getDaysInMonth para data "${date}":`, error);
    return 30; // Fallback
  }
};

/**
 * Adiciona um número de dias a uma data.
 * @param date A data inicial (Date, string ou número).
 * @param days O número de dias a adicionar.
 * @returns Um novo objeto Date com os dias adicionados.
 */
export const addDays = (date: string | number | Date, days: number): Date => {
  try {
    const dateObj = ensureDateObject(date);
    if (!isValid(dateObj)) return new Date(); // Fallback
    return dfAddDays(dateObj, days);
  } catch (error) {
    console.error(`Erro em addDays para data "${date}":`, error);
    return new Date(); // Fallback
  }
};

/**
 * Verifica se duas datas são o mesmo dia (ignorando a hora).
 * @param date1 A primeira data (Date, string ou número).
 * @param date2 A segunda data (Date, string ou número).
 * @returns true se for o mesmo dia, false caso contrário.
 */
export const isSameDay = (
  date1: string | number | Date,
  date2: string | number | Date
): boolean => {
  try {
    const dateObj1 = ensureDateObject(date1);
    const dateObj2 = ensureDateObject(date2);
    if (!isValid(dateObj1) || !isValid(dateObj2)) return false;
    return dfIsSameDay(dateObj1, dateObj2);
  } catch (error) {
    console.error(`Erro em isSameDay para datas "${date1}", "${date2}":`, error);
    return false;
  }
};

/**
 * Converte uma string de data para um objeto Date, usando um formato específico.
 * @param dateString A string da data.
 * @param formatString O formato da string (padrão date-fns).
 * @returns Um objeto Date ou null se a string for inválida.
 */
export const parseDate = (
  dateString: string,
  formatString: string = 'yyyy-MM-dd' // Padrão para YYYY-MM-DD
): Date | null => {
  try {
    const parsed = parse(dateString, formatString, new Date(), { locale: ptBR });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error(`Erro ao parsear data "${dateString}" com formato "${formatString}":`, error);
    return null;
  }
};

/**
 * Retorna o início do dia para uma data.
 * @param date A data (Date, string ou número).
 * @returns Um novo objeto Date representando o início do dia.
 */
export const startOfDay = (date: string | number | Date): Date => {
  try {
    const dateObj = ensureDateObject(date);
    if (!isValid(dateObj)) return new Date(NaN); // Retorna Data Inválida
    return dfStartOfDay(dateObj);
  } catch (error) {
    console.error(`Erro em startOfDay para data "${date}":`, error);
    return new Date(NaN);
  }
};

/**
 * Retorna o fim do dia para uma data.
 * @param date A data (Date, string ou número).
 * @returns Um novo objeto Date representando o fim do dia.
 */
export const endOfDay = (date: string | number | Date): Date => {
  try {
    const dateObj = ensureDateObject(date);
    if (!isValid(dateObj)) return new Date(NaN); // Retorna Data Inválida
    return dfEndOfDay(dateObj);
  } catch (error) {
    console.error(`Erro em endOfDay para data "${date}":`, error);
    return new Date(NaN);
  }
};

/**
 * Formata uma string de data (presumivelmente 'yyyy-MM-dd') para 'dd/MM/yyyy'.
 * Útil para exibição.
 */
export const formatDisplayDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  // Se for uma string, precisa ser no formato que ensureDateObject/parseISO entenda
  // ou um formato que new Date() entenda. 'yyyy-MM-dd' é seguro.
  return formatDate(dateString, 'dd/MM/yyyy');
};

/**
 * Formata uma string de hora (presumivelmente 'HH:mm') para exibição.
 * Se a entrada for um objeto Date, extrai e formata a hora.
 */
export const formatDisplayTime = (timeInput: string | Date): string => {
    if (!timeInput) return '';
    if (timeInput instanceof Date) {
        return format(timeInput, 'HH:mm', { locale: ptBR });
    }
    // Se for uma string 'HH:mm', pode retornar diretamente ou re-parsear para garantir
    // Aqui, vamos assumir que se for string, já está no formato desejado.
    // Para mais robustez, poderia parsear: parse(timeInput, 'HH:mm', new Date())
    return timeInput;
};

/**
 * Combina uma data (Date ou string 'yyyy-MM-dd') e uma hora (string 'HH:mm') em um objeto Date.
 */
export const combineDateTime = (dateInput: Date | string, timeString: string): Date | null => {
  try {
    const datePart = ensureDateObject(dateInput);
    if (!isValid(datePart)) return null;

    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const combined = new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      hours,
      minutes
    );
    return isValid(combined) ? combined : null;
  } catch (error) {
    console.error("Erro ao combinar data e hora:", dateInput, timeString, error);
    return null;
  }
};
