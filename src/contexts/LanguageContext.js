import React, { createContext, useContext, useState, useEffect } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { storage } from '../services/storage';
import enTranslations from '../translations/en';
import ptTranslations from '../translations/pt';

// Initialize i18next with translations
i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: enTranslations },
      pt: { translation: ptTranslations }
    },
    lng: 'pt', // Default language
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

// Create language context
const LanguageContext = createContext();

/**
 * Provider for language settings and translations
 * Manages language state and provides translation functions
 */
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('pt');
  const { t, i18n } = useTranslation();

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const settings = await storage.getItem('settings') || {};
        const savedLanguage = settings.language || 'pt';
        
        if (savedLanguage !== currentLanguage) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  // Change language and save preference
  const changeLanguage = async (language) => {
    try {
      setCurrentLanguage(language);
      await i18n.changeLanguage(language);
      
      // Save language preference
      const settings = await storage.getItem('settings') || {};
      settings.language = language;
      await storage.setItem('settings', settings);
      
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  // Available languages
  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' }
  ];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};