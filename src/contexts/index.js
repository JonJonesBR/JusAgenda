import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { EventProvider } from './EventContext';

export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
          <EventProvider>
              {children}
          </EventProvider>
        </ThemeProvider>
  );
};

export { useTheme } from './ThemeContext';

export { useEvents } from './EventContext';