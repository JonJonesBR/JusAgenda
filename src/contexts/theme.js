import { lightTheme, darkTheme } from './colors';

/**
 * Obtém o tema atual com base na preferência do usuário.
 * @param {string} theme - Tema atual ('light' ou 'dark').
 * @returns {Object} Tema correspondente.
 */
export const getTheme = (theme) => {
  if (theme === 'dark') {
    return darkTheme;
  }
  return lightTheme;
};

/**
 * Alterna entre temas claro e escuro.
 * @param {string} currentTheme - Tema atual ('light' ou 'dark').
 * @returns {string} Tema alternado ('light' ou 'dark').
 */
export const toggleTheme = (currentTheme) => {
  return currentTheme === 'light' ? 'dark' : 'light';
};

/**
 * Atualiza dinamicamente o esquema de cores do tema.
 * @param {string} theme - Tema atual ('light' ou 'dark').
 * @param {Object} customizations - Personalizações do tema (opcional).
 * @returns {Object} Tema atualizado com personalizações aplicadas.
 */
export const customizeTheme = (theme, customizations = {}) => {
  const baseTheme = getTheme(theme);
  return { ...baseTheme, ...customizations };
};
