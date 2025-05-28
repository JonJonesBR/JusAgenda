import React, { ReactNode } from 'react';
import { useTheme as useAppTheme } from '../contexts/ThemeContext'; // Assuming useAppTheme is the alias used in App.tsx

interface ThemeGateProps {
  children: ReactNode;
}

const ThemeGate: React.FC<ThemeGateProps> = ({ children }) => {
  const { theme } = useAppTheme();

  if (!theme) {
    // If theme is not truthy (e.g., undefined, null), render nothing.
    // This could also be a good place to log a warning or render a fallback UI.
    console.warn('ThemeGate: Theme object is not available. Rendering null.');
    return null;
  }

  // If theme is available, render the children.
  return <>{children}</>;
};

export default ThemeGate;
