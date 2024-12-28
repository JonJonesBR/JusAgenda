import React, { createContext, useState, useContext } from 'react';

/**
 * Context for managing language settings.
 */
const LanguageContext = createContext();

/**
 * Provides the language context to child components.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const LanguageProvider = ({ children }) => {
  // Fixed language set to 'pt-BR'
  const [language] = useState('pt-BR');

  return (
    <LanguageContext.Provider value={{ language }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook to access the language context.
 * @returns {Object} Language context value.
 */
export const useLanguage = () => useContext(LanguageContext);
