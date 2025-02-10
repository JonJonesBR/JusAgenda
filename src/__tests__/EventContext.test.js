import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { EventProvider, useEvents } from '../contexts/EventContext';

describe('EventContext', () => {
  // Wrapper para prover o contexto de eventos
  const wrapper = ({ children }) => <EventProvider>{children}</EventProvider>;

  it('should add an event successfully', async () => {
    const { result } = renderHook(() => useEvents(), { wrapper });

    await act(async () => {
      await result.current.addEvent({
        title: 'Test Event',
        date: new Date().toISOString(),
        type: 'reuniao',
        location: 'Test Location',
        client: 'Test Client',
      });
    });

    // Validação do incremento no array de eventos e verificação dos dados inseridos
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      title: 'Test Event',
      type: 'reuniao',
      location: 'Test Location',
      client: 'Test Client',
    });
  });
});
