import { lightTheme, darkTheme } from './colors';

/**
 * Obtém o tema com base na preferência do usuário.
 * @param {string} theme - Tema atual ('light' ou 'dark').
 * @returns {Object} Tema correspondente.
 */
export const getTheme = (theme) => {
  return theme === 'dark' ? darkTheme : lightTheme;
};

/**
 * Alterna entre temas.
 * @param {string} currentTheme - Tema atual ('light' ou 'dark').
 * @returns {string} Tema alternado ('light' ou 'dark').
 */
export const toggleTheme = (currentTheme) => {
  return currentTheme === 'light' ? 'dark' : 'light';
};
