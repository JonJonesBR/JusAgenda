import React, { useEffect } from 'react';
import { EventProvider } from './src/contexts/EventContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import Toast from 'react-native-toast-message';
import { initErrorTracking } from './src/utils/errorTracking';

// Initialize error tracking
initErrorTracking({
  dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN in production
  enableInDev: false,
});

const App = () => (
  <ErrorBoundary testID="app-root">
    <LanguageProvider>
      <ThemeProvider>
        <EventProvider>
          <AppNavigator />
        </EventProvider>
      </ThemeProvider>
    </LanguageProvider>
    <Toast />
  </ErrorBoundary>
);

export default App;
