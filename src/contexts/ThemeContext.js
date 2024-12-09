import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [theme, setTheme] = useState('dark'); // Inicializa no modo escuro

  /**
   * Carrega o tema armazenado localmente ao inicializar o aplicativo.
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Erro ao carregar tema armazenado:', error);
      }
    };
    loadTheme();
  }, []);

  /**
   * Alterna entre temas claro e escuro e salva no armazenamento local.
   */
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Erro ao alternar tema:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de tema.
 * @returns {Object} Contexto de tema.
 */
export const useTheme = () => useContext(ThemeContext);
