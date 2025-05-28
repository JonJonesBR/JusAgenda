// src/utils/dateUtils.ts

import {
  format as dfFormat,
  parseISO as dfParseISO,
  parse as dfParse,
  isValid as dfIsValid,
  getDaysInMonth as dfGetDaysInMonth,
  addDays as dfAddDays,
  isSameDay as dfIsSameDay,
  startOfDay as dfStartOfDay,
  endOfDay as dfEndOfDay,
  setHours as dfSetHours,
  setMinutes as dfSetMinutes,
  setSeconds as dfSetSeconds,
  setMilliseconds as dfSetMilliseconds,
} from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importando locale pt-BR

import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT, DISPLAY_DATE_FORMAT, DISPLAY_DATETIME_FORMAT } from '../constants'; // Assumindo que estes estão em constants.ts

/**
 * Tenta converter uma entrada (string, número ou Date) para um objeto Date.
 * Prioriza parseISO para strings, depois parse com formato 'yyyy-MM-dd',
 * depois 'dd/MM/yyyy' e, por fim, o construtor Date como fallback.
 * Retorna null se a conversão falhar e a data resultante for inválida.
 * @param value - O valor a ser convertido.
 * @returns Um objeto Date ou null se a conversão falhar.
 */
export function ensureDateObject(value: string | number | Date | undefined | null): Date | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (value instanceof Date) {
    return dfIsValid(value) ? value : null;
  }

  let date: Date | null = null;

  if (typeof value === 'string') {
    // Tenta parsear como ISO 8601 completo (inclui hora e timezone)
    date = dfParseISO(value);
    if (dfIsValid(date)) return date;

    // Tenta parsear como YYYY-MM-DD (comum para apenas data)
    // O parse do date-fns para 'yyyy-MM-dd' é mais robusto que new Date('YYYY-MM-DD')
    date = dfParse(value, DEFAULT_DATE_FORMAT, new Date());
    if (dfIsValid(date)) return date;

    // Tenta parsear como DD/MM/YYYY (comum em formatos de display)
    date = dfParse(value, DISPLAY_DATE_FORMAT, new Date());
    if (dfIsValid(date)) return date;

    // Última tentativa com o construtor Date (menos confiável para formatos ambíguos)
    // console.warn(`dateUtils: Usando 'new Date("${value}")' como fallback. Considere formatos explícitos.`);
    date = new Date(value);
    if (dfIsValid(date)) return date;

  } else if (typeof value === 'number') {
    // Assume que é um timestamp
    date = new Date(value);
    if (dfIsValid(date)) return date;
  }

  // console.warn(`dateUtils: Não foi possível converter '${value}' para um objeto Date válido.`);
  return null;
}

/**
 * Formata uma data para uma string.
 * @param dateInput - A data a ser formatada (string, número ou Date).
 * @param formatString - O formato desejado (padrão: YYYY-MM-DD).
 * @returns A string formatada ou 'Data inválida' se a entrada não for uma data válida.
 */
export function formatDate(
  dateInput: string | number | Date | undefined | null,
  formatString: string = DEFAULT_DATE_FORMAT
): string {
  const date = ensureDateObject(dateInput);
  if (!date) {
    return 'Data inválida';
  }
  try {
    return dfFormat(date, formatString, { locale: ptBR });
  } catch (error) {
    // console.error('dateUtils: Erro ao formatar data:', error);
    return 'Erro na formatação';
  }
}

/**
 * Formata uma data e hora para uma string.
 * @param dateTimeInput - A data e hora a ser formatada (string, número ou Date).
 * @param formatString - O formato desejado (padrão: DD/MM/YYYY HH:mm).
 * @returns A string formatada ou 'Data/hora inválida'.
 */
export function formatDateTime(
  dateTimeInput: string | number | Date | undefined | null,
  formatString: string = DISPLAY_DATETIME_FORMAT
): string {
  return formatDate(dateTimeInput, formatString); // Reutiliza formatDate, que já usa ensureDateObject
}

/**
 * Formata uma data para exibição (DD/MM/YYYY).
 */
export function formatDisplayDate(dateInput: string | number | Date | undefined | null): string {
  return formatDate(dateInput, DISPLAY_DATE_FORMAT);
}

/**
 * Formata uma hora de um objeto Date para HH:mm.
 */
export function formatTime(timeInput: string | number | Date | undefined | null): string {
  const date = ensureDateObject(timeInput);
  if (!date) {
    return 'Hora inválida';
  }
  try {
    return dfFormat(date, DEFAULT_TIME_FORMAT, { locale: ptBR });
  } catch (error) {
    // console.error('dateUtils: Erro ao formatar hora:', error);
    return 'Erro na formatação';
  }
}


/**
 * Obtém o número de dias em um mês específico de um ano.
 * @param dateInput - Uma data dentro do mês/ano desejado.
 * @returns O número de dias no mês ou 30 como fallback em caso de erro.
 */
export function getDaysInMonth(dateInput: string | number | Date | undefined | null): number {
  const date = ensureDateObject(dateInput);
  if (!date) {
    return 30; // Fallback
  }
  try {
    return dfGetDaysInMonth(date);
  } catch (error) {
    // console.error('dateUtils: Erro ao obter dias no mês:', error);
    return 30; // Fallback
  }
}

/**
 * Adiciona um número de dias a uma data.
 * @param dateInput - A data inicial.
 * @param amount - O número de dias a adicionar (pode ser negativo).
 * @returns Um novo objeto Date com os dias adicionados, ou a data atual em caso de erro.
 */
export function addDays(dateInput: string | number | Date | undefined | null, amount: number): Date {
  const date = ensureDateObject(dateInput);
  if (!date) {
    // console.warn('dateUtils: addDays recebeu data inválida, retornando new Date().');
    return new Date(); // Retorna data atual como fallback, ou poderia ser null/lançar erro
  }
  try {
    return dfAddDays(date, amount);
  } catch (error) {
    // console.error('dateUtils: Erro ao adicionar dias:', error);
    return new Date(); // Fallback
  }
}

/**
 * Verifica se duas datas são o mesmo dia (ignorando a hora).
 * @param dateLeftInput - A primeira data.
 * @param dateRightInput - A segunda data.
 * @returns True se forem o mesmo dia, false caso contrário ou em caso de erro.
 */
export function isSameDate(
  dateLeftInput: string | number | Date | undefined | null,
  dateRightInput: string | number | Date | undefined | null
): boolean {
  const dateLeft = ensureDateObject(dateLeftInput);
  const dateRight = ensureDateObject(dateRightInput);

  if (!dateLeft || !dateRight) {
    return false;
  }
  try {
    return dfIsSameDay(dateLeft, dateRight);
  } catch (error) {
    // console.error('dateUtils: Erro ao comparar datas (isSameDay):', error);
    return false;
  }
}

/**
 * Converte uma string de data (YYYY-MM-DD ou DD/MM/YYYY) para um objeto Date.
 * Retorna null se a string não puder ser parseada.
 */
export function parseDateString(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  // Tenta parsear com o formato padrão YYYY-MM-DD primeiro
  let date = dfParse(dateString, DEFAULT_DATE_FORMAT, new Date());
  if (dfIsValid(date)) {
    return date;
  }
  // Tenta parsear com o formato de display DD/MM/YYYY
  date = dfParse(dateString, DISPLAY_DATE_FORMAT, new Date());
  if (dfIsValid(date)) {
    return date;
  }
  // Tenta parsear como ISO (pode já ter sido coberto por ensureDateObject, mas é uma boa garantia)
  date = dfParseISO(dateString);
  if (dfIsValid(date)) {
    return date;
  }
  // console.warn(`dateUtils: Não foi possível parsear a string de data: "${dateString}"`);
  return null;
}

/**
 * Retorna o início do dia para uma data fornecida.
 * @param dateInput - A data.
 * @returns Um novo objeto Date representando o início do dia, ou new Date(NaN) em caso de erro.
 */
export function getStartOfDay(dateInput: string | number | Date | undefined | null): Date {
  const date = ensureDateObject(dateInput);
  if (!date) {
    // console.warn('dateUtils: getStartOfDay recebeu data inválida.');
    return new Date(NaN); // Retorna uma data inválida
  }
  try {
    return dfStartOfDay(date);
  } catch (error) {
    // console.error('dateUtils: Erro ao obter início do dia:', error);
    return new Date(NaN);
  }
}

/**
 * Retorna o fim do dia para uma data fornecida.
 * @param dateInput - A data.
 * @returns Um novo objeto Date representando o fim do dia, ou new Date(NaN) em caso de erro.
 */
export function getEndOfDay(dateInput: string | number | Date | undefined | null): Date {
  const date = ensureDateObject(dateInput);
  if (!date) {
    // console.warn('dateUtils: getEndOfDay recebeu data inválida.');
    return new Date(NaN); // Retorna uma data inválida
  }
  try {
    return dfEndOfDay(date);
  } catch (error) {
    // console.error('dateUtils: Erro ao obter fim do dia:', error);
    return new Date(NaN);
  }
}

/**
 * Combina uma data (objeto Date ou string YYYY-MM-DD) com uma hora (string HH:MM ou objeto Date).
 * Retorna um novo objeto Date com a data e hora combinadas, ou null se a entrada for inválida.
 */
export function combineDateTime(
  dateInput: string | Date | undefined | null,
  timeInput: string | Date | undefined | null
): Date | null {
  const baseDate = ensureDateObject(dateInput);
  if (!baseDate) {
    // console.warn('dateUtils: combineDateTime - Data base inválida.');
    return null;
  }

  let hours = 0;
  let minutes = 0;

  if (timeInput instanceof Date && dfIsValid(timeInput)) {
    hours = timeInput.getHours();
    minutes = timeInput.getMinutes();
  } else if (typeof timeInput === 'string') {
    const timeParts = timeInput.split(':');
    if (timeParts.length === 2) {
      const parsedHours = parseInt(timeParts[0], 10);
      const parsedMinutes = parseInt(timeParts[1], 10);
      if (!isNaN(parsedHours) && parsedHours >= 0 && parsedHours <= 23 &&
          !isNaN(parsedMinutes) && parsedMinutes >= 0 && parsedMinutes <= 59) {
        hours = parsedHours;
        minutes = parsedMinutes;
      } else {
        // console.warn(`dateUtils: combineDateTime - String de hora inválida: "${timeInput}"`);
        return null;
      }
    } else {
      // console.warn(`dateUtils: combineDateTime - String de hora mal formatada: "${timeInput}"`);
      return null;
    }
  } else if (timeInput !== undefined && timeInput !== null) {
    // Se timeInput for algo que não seja Date, string, undefined ou null
    // console.warn('dateUtils: combineDateTime - Tipo de entrada de hora não suportado.');
    return null;
  }
  // Se timeInput for undefined ou null, a hora será 00:00 por padrão (já definido em hours e minutes)

  try {
    let resultDate = dfSetHours(baseDate, hours);
    resultDate = dfSetMinutes(resultDate, minutes);
    resultDate = dfSetSeconds(resultDate, 0);
    resultDate = dfSetMilliseconds(resultDate, 0);
    return dfIsValid(resultDate) ? resultDate : null;
  } catch (error) {
    // console.error('dateUtils: Erro ao combinar data e hora:', error);
    return null;
  }
}

/**
 * Verifica se uma data é válida.
 * @param dateInput - A data a ser verificada.
 * @returns True se a data for válida, false caso contrário.
 */
export function isDateValid(dateInput: string | number | Date | undefined | null): boolean {
  const date = ensureDateObject(dateInput);
  return date !== null && dfIsValid(date);
}

// Renomeando algumas exportações para evitar conflitos e para uso mais direto, se desejado.
export {
  dfParseISO as parseISO,
  dfParse as parse,
  dfIsValid as isValid,
  // dfFormat, dfGetDaysInMonth, dfAddDays, dfIsSameDay, dfStartOfDay, dfEndOfDay // Já envolvidos ou exportados com nomes diferentes
};
