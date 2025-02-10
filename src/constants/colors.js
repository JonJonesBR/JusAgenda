/**
 * @typedef {Object} Theme
 * @property {string} background - Background color.
 * @property {string} primary - Primary color.
 * @property {string} secondary - Secondary color.
 * @property {string} text - Text color.
 * @property {string} card - Card background color.
 */

/**
 * Cria um objeto de tema com as cores especificadas e o torna imutável.
 *
 * @param {string} background - Cor de fundo.
 * @param {string} primary - Cor primária.
 * @param {string} secondary - Cor secundária.
 * @param {string} text - Cor do texto.
 * @param {string} card - Cor de fundo do cartão.
 * @returns {Theme} Objeto do tema.
 */
export function createTheme(background, primary, secondary, text, card) {
  return Object.freeze({
    background,
    primary,
    secondary,
    text,
    card,
  });
}

// Definição do tema claro
export const lightTheme = createTheme(
  '#F4F7F9', // background
  '#1A5F7A', // primary
  '#134B6A', // secondary
  '#333333', // text
  '#FFFFFF'  // card
);

// Definição do tema escuro
export const darkTheme = createTheme(
  '#121212', // background
  '#2C8CB4', // primary
  '#1F6E9C', // secondary
  '#E0E0E0', // text
  '#1E1E1E'  // card
);
