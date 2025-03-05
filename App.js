import React from 'react';
import { EventProvider } from './src/contexts/EventContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <EventProvider>
      <AppNavigator />
    </EventProvider>
  </ErrorBoundary>
);

export default App;
