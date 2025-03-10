import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { EventProvider } from './EventContext';
import { CloudSyncProvider } from './CloudSyncContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <CloudSyncProvider>
        <ThemeProvider>
          <LanguageProvider>
            <EventProvider>
              {children}
            </EventProvider>
          </LanguageProvider>
        </ThemeProvider>
      </CloudSyncProvider>
    </AuthProvider>
  );
};

export { useAuth } from './AuthContext';
export { useTheme } from './ThemeContext';
export { useLanguage } from './LanguageContext';
export { useEvents } from './EventContext';
export { useCloudSync } from './CloudSyncContext';