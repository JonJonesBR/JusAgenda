import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

/**
 * Contexto de tema.
 */
const ThemeContext = createContext();

/**
 * Provedor de tema.
 * @param {Object} props
 * @param {ReactNode} props.children
 */
export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');

  /**
   * Alterna entre temas.
   */
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para acessar contexto de tema.
 * @returns {Object} Contexto de tema.
 */
export const useTheme = () => useContext(ThemeContext);
