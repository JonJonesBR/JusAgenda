import { moment } from './common';

/**
 * Formata uma data conforme o padrão especificado (padrão: DD/MM/YYYY).
 * @param {Date|string} date - Data a ser formatada.
 * @param {string} format - Formato desejado.
 * @returns {string} Data formatada.
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => moment(date).format(format);

/**
 * Formata uma data com hora no padrão DD/MM/YYYY HH:mm.
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Data e hora formatadas.
 */
export const formatDateTime = (date) => moment(date).format('DD/MM/YYYY HH:mm');

/**
 * Formata uma data por extenso, como "quarta-feira, 15 de janeiro de 2025".
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Data por extenso.
 */
export const formatFullDate = (date) =>
  moment(date).format('dddd, DD [de] MMMM [de] YYYY');

/**
 * Formata uma hora no padrão HH:mm.
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Hora formatada.
 */
export const formatTime = (date) => moment(date).format('HH:mm');

/**
 * Verifica se a data informada é igual à data de hoje.
 * @param {Date|string} date - Data a ser verificada.
 * @returns {boolean} True se for hoje, caso contrário false.
 */
export const isToday = (date) => moment(date).isSame(moment(), 'day');

/**
 * Verifica se a data informada é futura.
 * @param {Date|string} date - Data a ser verificada.
 * @returns {boolean} True se a data for futura, caso contrário false.
 */
export const isFutureDate = (date) => moment(date).isAfter(moment());

// Exportação padrão para facilitar o uso do moment nos demais módulos
export default moment;
