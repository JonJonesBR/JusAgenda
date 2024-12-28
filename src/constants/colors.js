/**
 * @typedef {Object} Theme
 * @property {string} background Background color.
 * @property {string} primary Primary color.
 * @property {string} secondary Secondary color.
 * @property {string} text Text color.
 * @property {string} card Card background color.
 */

/**
 * Creates a theme object with specified colors.
 * @param {string} background Background color.
 * @param {string} primary Primary color.
 * @param {string} secondary Secondary color.
 * @param {string} text Text color.
 * @param {string} card Card background color.
 * @returns {Theme} A theme object.
 */
export function createTheme(background, primary, secondary, text, card) {
  return {
    background,
    primary,
    secondary,
    text,
    card,
  };
}

// Light theme definition
export const lightTheme = createTheme(
  '#F4F7F9', // background
  '#1A5F7A', // primary
  '#134B6A', // secondary
  '#333333', // text
  '#FFFFFF' // card
);

// Dark theme definition
export const darkTheme = createTheme(
  '#121212', // background
  '#2C8CB4', // primary
  '#1F6E9C', // secondary
  '#E0E0E0', // text
  '#1E1E1E' // card
);
