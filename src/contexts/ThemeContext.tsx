import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, AppTheme } from "../theme/theme";

type ThemeContextType = {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(colorScheme === "dark");

  // Update theme based on system preference changes
  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setTheme = (theme: "light" | "dark") => {
    setIsDarkMode(theme === "dark");
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
