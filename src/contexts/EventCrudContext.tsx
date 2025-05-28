import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Event as EventType } from '../types/event'; // Importando o tipo Event de src/types/event
import { parseISO, isSameDay, isValid } from 'date-fns'; // Para manipulação de datas
import { scheduleRemindersForEvent } from '../services/notifications'; // Import for scheduling reminders

// Interface para os props do Contexto
interface EventCrudContextProps {
  events: EventType[];
  addEvent: (event: Omit<EventType, 'id'>) => EventType; // Retorna o evento adicionado com ID
  updateEvent: (event: EventType) => EventType | undefined; // Retorna o evento atualizado ou undefined se não encontrado
  deleteEvent: (eventId: string) => boolean; // Retorna true se deletado com sucesso
  getEventById: (eventId: string) => EventType | undefined;
  getEventsByDate: (date: Date) => EventType[];
  isLoading: boolean; // Adicionado para feedback de carregamento, se necessário
}

// Valor padrão para o contexto
const defaultEventCrudContextValue: EventCrudContextProps = {
  events: [],
  addEvent: () => {
    throw new Error('addEvent function not implemented');
  },
  updateEvent: () => {
    throw new Error('updateEvent function not implemented');
  },
  deleteEvent: () => {
    throw new Error('deleteEvent function not implemented');
  },
  getEventById: () => undefined,
  getEventsByDate: () => [],
  isLoading: false,
};

export const EventCrudContext = createContext<EventCrudContextProps>(defaultEventCrudContextValue);

interface EventCrudProviderProps {
  children: ReactNode;
  initialEvents?: EventType[]; // Para testes ou inicialização com dados pré-existentes
}

export const EventCrudProvider: React.FC<EventCrudProviderProps> = ({ children, initialEvents = [] }) => {
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Exemplo de estado de carregamento

  // Adicionar um novo evento
  const addEvent = useCallback((eventData: Omit<EventType, 'id'>): EventType => {
    // Validação da data e hora (devem ser strings no formato esperado)
    if (typeof eventData.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventData.data)) {
      console.warn(`EventCrudContext: addEvent - Formato de data inválido: ${eventData.data}. Esperado YYYY-MM-DD.`);
      // Poderia lançar um erro ou retornar um evento inválido, dependendo da política de erro.
      // Por agora, vamos permitir, mas o ideal é que a validação ocorra antes.
    }
    if (eventData.hora && (typeof eventData.hora !== 'string' || !/^\d{2}:\d{2}$/.test(eventData.hora))) {
      console.warn(`EventCrudContext: addEvent - Formato de hora inválido: ${eventData.hora}. Esperado HH:MM.`);
    }

    const newEvent: EventType = {
      ...eventData,
      id: uuidv4(), // Gerar ID único
      // Garanta que outros campos obrigatórios (se houver) tenham valores padrão aqui, se não vierem em eventData
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
    console.log('EventCrudContext: Evento adicionado:', newEvent);
    if (newEvent.reminders && newEvent.reminders.length > 0) {
      scheduleRemindersForEvent(newEvent); // Schedule reminders for the new event
    }
    return newEvent;
  }, []);

  // Atualizar um evento existente
  const updateEvent = useCallback((updatedEventData: EventType): EventType | undefined => {
    if (typeof updatedEventData.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(updatedEventData.data)) {
      console.warn(`EventCrudContext: updateEvent - Formato de data inválido: ${updatedEventData.data}. Esperado YYYY-MM-DD.`);
    }
    if (updatedEventData.hora && (typeof updatedEventData.hora !== 'string' || !/^\d{2}:\d{2}$/.test(updatedEventData.hora))) {
      console.warn(`EventCrudContext: updateEvent - Formato de hora inválido: ${updatedEventData.hora}. Esperado HH:MM.`);
    }

    let foundEvent: EventType | undefined;
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === updatedEventData.id) {
          foundEvent = { ...event, ...updatedEventData };
          return foundEvent;
        }
        return event;
      })
    );
    if (foundEvent) {
      console.log('EventCrudContext: Evento atualizado:', foundEvent);
      // Re-schedule reminders for the updated event
      // This doesn't cancel old reminders if event time changed, a known simplification for now.
      if (foundEvent.reminders && foundEvent.reminders.length > 0) {
        scheduleRemindersForEvent(foundEvent);
      }
    } else {
      console.warn('EventCrudContext: updateEvent - Evento não encontrado para atualização, ID:', updatedEventData.id);
    }
    return foundEvent;
  }, []);

  // Deletar um evento
  // Note: Does not cancel scheduled notifications for the deleted event due to complexity
  // without storing notification IDs. This is a simplification.
  const deleteEvent = useCallback((eventId: string): boolean => {
    let deleted = false;
    setEvents(prevEvents =>
      prevEvents.filter(event => {
        if (event.id === eventId) {
          deleted = true;
          return false; // Não incluir o evento a ser deletado
        }
        return true;
      })
    );
    if (deleted) {
      console.log('EventCrudContext: Evento deletado, ID:', eventId);
    } else {
      console.warn('EventCrudContext: deleteEvent - Evento não encontrado para deleção, ID:', eventId);
    }
    return deleted;
  }, []);

  // Obter um evento pelo ID
  const getEventById = useCallback(
    (eventId: string): EventType | undefined => {
      return events.find(event => event.id === eventId);
    },
    [events]
  );

  // Obter eventos por data
  // Esta função agora usa date-fns para uma comparação de datas mais robusta
  const getEventsByDate = useCallback(
    (date: Date): EventType[] => {
      if (!isValid(date)) {
        console.warn('EventCrudContext: getEventsByDate - Data fornecida é inválida.');
        return [];
      }
      return events.filter(event => {
        try {
          // Assume que event.data é uma string 'YYYY-MM-DD'
          const eventDate = parseISO(event.data);
          return isValid(eventDate) && isSameDay(eventDate, date);
        } catch (error) {
          console.error(`EventCrudContext: Erro ao parsear data do evento "${event.title || event.id}": ${event.data}`, error);
          return false;
        }
      });
    },
    [events]
  );

  // O valor do contexto que será fornecido aos componentes filhos
  const contextValue = useMemo(() => ({
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByDate,
    isLoading, // Incluído no valor do contexto
  }), [events, addEvent, updateEvent, deleteEvent, getEventById, getEventsByDate, isLoading]);


  // Simulação de carregamento inicial (remover ou adaptar conforme necessário)
  // useEffect(() => {
  //   setIsLoading(true);
  //   // Simular busca de dados
  //   setTimeout(() => {
  //     // setEvents(dadosCarregados); // Se você carregar eventos de uma API ou AsyncStorage
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  return (
    <EventCrudContext.Provider value={contextValue}>
      {children}
    </EventCrudContext.Provider>
  );
};

// Hook customizado para usar o contexto de eventos
export const useEvents = (): EventCrudContextProps => {
  const context = useContext(EventCrudContext);
  if (context === undefined) {
    throw new Error('useEvents deve ser usado dentro de um EventCrudProvider');
  }
  return context;
};
