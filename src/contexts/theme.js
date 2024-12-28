import { darkTheme } from './colors';

/**
 * Retrieves the current fixed theme (dark).
 * @returns {Object} Fixed theme (darkTheme).
 */
export const getTheme = () => {
  return darkTheme; // Always returns the fixed dark theme
};

/**
 * Dynamically updates the theme color scheme.
 * @param {Object} customizations - Optional theme customizations.
 * @returns {Object} Updated theme with customizations applied.
 */
export const customizeTheme = (customizations = {}) => {
  const baseTheme = getTheme(); // Always uses the fixed dark theme as base
  return { ...baseTheme, ...customizations };
};
