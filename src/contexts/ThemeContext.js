import React, { createContext, useState, useContext } from 'react';

/**
 * Context for managing theme settings.
 */
const ThemeContext = createContext();

/**
 * Provides the theme context to child components.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const ThemeProvider = ({ children }) => {
  // Fixed theme set to 'dark'
  const [theme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access the theme context.
 * @returns {Object} Theme context value.
 */
export const useTheme = () => useContext(ThemeContext);