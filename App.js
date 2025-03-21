import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EventProvider } from './src/contexts/EventContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
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
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ErrorBoundary testID="app-root">
      <ThemeProvider>
        <EventProvider>
          <AppNavigator />
        </EventProvider>
      </ThemeProvider>
      <Toast />
    </ErrorBoundary>
  </GestureHandlerRootView>
);

export default App;
