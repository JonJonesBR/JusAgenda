import React from 'react';
import { EventProvider } from './src/contexts/EventContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <EventProvider>
      <AppNavigator />
    </EventProvider>
  );
};

export default App;
