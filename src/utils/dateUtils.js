import { moment } from "./common";

/**
 * Valida se a data fornecida é válida.
 * @param {Date|string} date - Data a ser validada.
 * @returns {boolean} True se a data for válida, caso contrário false.
 */
export const isValidDate = (date) => {
  if (!date) {
    console.warn(`No date provided`);
    return false;
  }
  const momentDate = moment(date);
  return momentDate.isValid() && !isNaN(momentDate.valueOf());
};

/**
 * Formata uma data conforme o padrão especificado (padrão: DD/MM/YYYY).
 * @param {Date|string} date - Data a ser formatada.
 * @param {string} format - Formato desejado.
 * @returns {string} Data formatada ou string vazia se a data for inválida.
 */
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return "";
  }
  return moment(date).format(format);
};

/**
 * Formata uma data com hora no padrão DD/MM/YYYY HH:mm.
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Data e hora formatadas ou string vazia se a data for inválida.
 */
export const formatDateTime = (date) => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return "";
  }
  return moment(date).format("DD/MM/YYYY HH:mm");
};

/**
 * Formata uma data por extenso, como "quarta-feira, 15 de janeiro de 2025".
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Data por extenso ou string vazia se a data for inválida.
 */
export const formatFullDate = (date) => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return "";
  }
  return moment(date).format("dddd, DD [de] MMMM [de] YYYY");
};

/**
 * Formata uma hora no padrão HH:mm.
 * @param {Date|string} date - Data a ser formatada.
 * @returns {string} Hora formatada ou string vazia se a data for inválida.
 */
export const formatTime = (date) => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return "";
  }
  return moment(date).format("HH:mm");
};

/**
 * Verifica se a data informada é igual à data de hoje.
 * @param {Date|string} date - Data a ser verificada.
 * @returns {boolean} True se for hoje, caso contrário false.
 */
export const isToday = (date) => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return false;
  }
  return moment(date).isSame(moment(), "day");
};

/**
 * Verifica se a data informada é futura.
 * @param {Date|string} date - Data a ser verificada.
 * @returns {boolean} True se a data for futura, caso contrário false.
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) {
    console.warn(`Invalid date provided: ${date}`);
    return false;
  }
  return moment(date).isAfter(moment());
};

// Exportação padrão para facilitar o uso do moment nos demais módulos
export default moment;
