import moment from 'moment';
import 'moment/locale/pt-br';

// Configura o locale do moment para português do Brasil
moment.locale('pt-br');

/**
 * Formata uma data para exibição amigável no formato dd/mm/yyyy
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  return moment(date).format('DD/MM/YYYY');
};

/**
 * Formata um horário para exibição amigável no formato hh:mm
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatTime = (date: Date | string): string => {
  if (!date) return '';
  return moment(date).format('HH:mm');
};

/**
 * Formata uma data e horário para exibição amigável no formato dd/mm/yyyy hh:mm
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  return moment(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Formata uma data com o nome do mês por extenso
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatFullDate = (date: Date | string): string => {
  if (!date) return '';
  return moment(date).format('DD [de] MMMM [de] YYYY');
};

/**
 * Converte uma string de data para objeto Date
 * @param dateString String de data no formato DD/MM/YYYY
 * @returns Objeto Date
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  return moment(dateString, 'DD/MM/YYYY').toDate();
};

/**
 * Verifica se uma data é hoje
 * @param date Data a ser verificada
 * @returns true se for hoje, false caso contrário
 */
export const isToday = (date: Date | string): boolean => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Retorna uma string com o tempo relativo (ex: "há 2 dias", "em 3 horas")
 * @param date Data para calcular o tempo relativo
 * @returns String com o tempo relativo
 */
export const fromNow = (date: Date | string): string => {
  return moment(date).fromNow();
};

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Número de dias para adicionar
 * @returns Nova data
 */
export const addDays = (date: Date | string, days: number): Date => {
  return moment(date).add(days, 'days').toDate();
};

/**
 * Obtém o início do mês para uma data
 * @param date Data de referência
 * @returns Data no início do mês
 */
export const startOfMonth = (date: Date | string): Date => {
  return moment(date).startOf('month').toDate();
};

/**
 * Obtém o fim do mês para uma data
 * @param date Data de referência
 * @returns Data no fim do mês
 */
export const endOfMonth = (date: Date | string): Date => {
  return moment(date).endOf('month').toDate();
};

/**
 * Formata uma data no formato YYYY-MM-DD para uso com a API do calendário
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export const formatCalendarDate = (date: Date | string): string => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD');
};
