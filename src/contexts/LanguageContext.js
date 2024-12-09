import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Contexto de idioma.
 */
const LanguageContext = createContext();

/**
 * Provedor de idioma.
 * @param {Object} props
 * @param {ReactNode} props.children
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR'); // Idioma padrão

  /**
   * Carrega o idioma armazenado localmente.
   */
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('appLanguage');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (error) {
        console.error('Erro ao carregar idioma armazenado:', error);
      }
    };
    loadLanguage();
  }, []);

  /**
   * Alterna o idioma entre 'pt-BR' e 'en-US' e salva a escolha.
   */
  const toggleLanguage = async () => {
    try {
      const newLanguage = language === 'pt-BR' ? 'en-US' : 'pt-BR';
      setLanguage(newLanguage);
      await AsyncStorage.setItem('appLanguage', newLanguage);
    } catch (error) {
      console.error('Erro ao alternar idioma:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de idioma.
 * @returns {Object} Contexto de idioma.
 */
export const useLanguage = () => useContext(LanguageContext);
