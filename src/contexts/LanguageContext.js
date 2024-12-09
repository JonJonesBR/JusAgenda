import React, { createContext, useState, useContext } from 'react';

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
  const [language, setLanguage] = useState('pt-BR');

  /**
   * Alterna idioma.
   */
  const toggleLanguage = () => {
    setLanguage(language === 'pt-BR' ? 'en-US' : 'pt-BR');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook para acessar contexto de idioma.
 * @returns {Object} Contexto de idioma.
 */
export const useLanguage = () => useContext(LanguageContext);
