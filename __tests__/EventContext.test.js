import React from 'react'; 
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EventProvider, useEvents } from '../src/contexts/EventContext';

describe('EventContext', () => {
  it('should add event successfully', async () => {
    const TestComponent = () => {
      const { addEvent, events } = useEvents();
      
      React.useEffect(() => {
        addEvent({
          title: 'Test Event',
          date: new Date().toISOString(),
          type: 'reuniao',
          location: 'Test Location',
          client: 'Test Client',
        });
      }, []);

      // Expondo o tamanho do array de eventos para verificação
      return <Text testID="eventsCount">{events.length}</Text>;
    };

    const { getByTestId } = render(
      <EventProvider>
        <TestComponent />
      </EventProvider>
    );

    // Aguarda que o efeito seja executado e o estado seja atualizado
    await waitFor(() => expect(getByTestId('eventsCount').props.children).toBeGreaterThan(0));
  });
});
