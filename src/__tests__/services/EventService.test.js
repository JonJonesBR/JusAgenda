import { storage } from '../../services/storage';
import * as EventService from '../../services/EventService';
import { generateId } from '../../utils/common';

// Mock the storage module
jest.mock('../../services/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock generateId
jest.mock('../../utils/common', () => ({
  generateId: jest.fn(() => 'mock-id'),
}));

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to their default behavior
    storage.getItem.mockReset();
    storage.setItem.mockReset();
    storage.removeItem.mockReset();
  });

  describe('getAllCompromissos', () => {
    it('should return empty array when no events exist', async () => {
      storage.getItem.mockResolvedValue(null);
      const result = await EventService.getAllCompromissos();
      expect(result).toEqual([]);
      expect(storage.getItem).toHaveBeenCalledWith('@jusagenda_events');
    });

    it('should return sorted events when events exist', async () => {
      const mockEvents = [
        { id: '1', date: '2024-03-02' },
        { id: '2', date: '2024-03-01' },
      ];
      storage.getItem.mockResolvedValue(mockEvents);
      
      const result = await EventService.getAllCompromissos();
      
      expect(result).toEqual([
        { id: '2', date: '2024-03-01' },
        { id: '1', date: '2024-03-02' },
      ]);
    });

    it('should handle errors gracefully', async () => {
      storage.getItem.mockRejectedValue(new Error('Storage error'));
      await expect(EventService.getAllCompromissos()).rejects.toThrow();
    });
  });

  describe('getUpcomingCompromissos', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return only future events', async () => {
      const mockEvents = [
        { id: '1', date: '2024-02-29' }, // Past
        { id: '2', date: '2024-03-01' }, // Today
        { id: '3', date: '2024-03-02' }, // Future
      ];
      storage.getItem.mockResolvedValue(mockEvents);

      const result = await EventService.getUpcomingCompromissos();

      expect(result).toEqual([
        { id: '2', date: '2024-03-01' },
        { id: '3', date: '2024-03-02' },
      ]);
    });
  });

  describe('addCompromisso', () => {
    it('should add a new event successfully', async () => {
      const mockEvent = { title: 'Test Event', date: '2024-03-01' };
      storage.getItem.mockResolvedValue([]);
      storage.setItem.mockResolvedValue(undefined);

      const result = await EventService.addCompromisso(mockEvent);

      expect(result).toEqual({
        ...mockEvent,
        id: 'mock-id',
        notificationId: null,
        calendarEventId: null,
      });
      expect(storage.setItem).toHaveBeenCalledWith('@jusagenda_events', [result]);
    });

    it('should handle errors when adding event', async () => {
      storage.getItem.mockResolvedValue([]);
      storage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      await expect(EventService.addCompromisso({})).rejects.toThrow('Não foi possível adicionar o compromisso');
    });
  });

  describe('updateCompromisso', () => {
    it('should update an existing event', async () => {
      const existingEvents = [{ id: '1', title: 'Old Title' }];
      storage.getItem.mockResolvedValue(existingEvents);
      storage.setItem.mockResolvedValue(undefined);

      const updatedEvent = { title: 'New Title' };
      const result = await EventService.updateCompromisso('1', updatedEvent);

      expect(result).toEqual({ id: '1', title: 'New Title' });
      expect(storage.setItem).toHaveBeenCalledWith('@jusagenda_events', [result]);
    });

    it('should return null when event not found', async () => {
      storage.getItem.mockResolvedValue([]);
      const result = await EventService.updateCompromisso('1', {});
      expect(result).toBeNull();
    });
  });

  describe('deleteCompromisso', () => {
    it('should delete an existing event', async () => {
      const existingEvents = [{ id: '1' }, { id: '2' }];
      storage.getItem.mockResolvedValue(existingEvents);
      storage.setItem.mockResolvedValue(undefined);

      const result = await EventService.deleteCompromisso('1');

      expect(result).toBe(true);
      expect(storage.setItem).toHaveBeenCalledWith('@jusagenda_events', [{ id: '2' }]);
    });

    it('should return false when event not found', async () => {
      storage.getItem.mockResolvedValue([{ id: '1' }]);
      const result = await EventService.deleteCompromisso('2');
      expect(result).toBe(false);
    });
  });

  describe('searchCompromissos', () => {
    it('should find events matching the query', async () => {
      const mockEvents = [
        { id: '1', title: 'Test Event', client: 'John' },
        { id: '2', title: 'Another Event', client: 'Jane' },
      ];
      storage.getItem.mockResolvedValue(mockEvents);

      const result = await EventService.searchCompromissos('test');
      expect(result).toEqual([mockEvents[0]]);
    });

    it('should handle case-insensitive search', async () => {
      const mockEvents = [{ id: '1', title: 'TEST Event' }];
      storage.getItem.mockResolvedValue(mockEvents);

      const result = await EventService.searchCompromissos('test');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getCompromissoById', () => {
    it('should return event by id', async () => {
      const mockEvent = { id: '1', title: 'Test Event' };
      storage.getItem.mockResolvedValue([mockEvent]);

      const result = await EventService.getCompromissoById('1');
      expect(result).toEqual(mockEvent);
    });

    it('should return undefined when event not found', async () => {
      storage.getItem.mockResolvedValue([]);
      const result = await EventService.getCompromissoById('1');
      expect(result).toBeUndefined();
    });
  });

  describe('updateCompromissoNotifications', () => {
    it('should update notification IDs', async () => {
      const existingEvent = { id: '1', notificationId: null, calendarEventId: null };
      storage.getItem.mockResolvedValue([existingEvent]);
      storage.setItem.mockResolvedValue(undefined);

      const result = await EventService.updateCompromissoNotifications('1', {
        notificationId: 'notif-1',
        calendarEventId: 'cal-1',
      });

      expect(result).toEqual({
        id: '1',
        notificationId: 'notif-1',
        calendarEventId: 'cal-1',
      });
    });

    it('should handle partial updates', async () => {
      const existingEvent = { id: '1', notificationId: 'old-notif', calendarEventId: 'old-cal' };
      storage.getItem.mockResolvedValue([existingEvent]);
      storage.setItem.mockResolvedValue(undefined);

      const result = await EventService.updateCompromissoNotifications('1', {
        notificationId: 'new-notif',
      });

      expect(result).toEqual({
        id: '1',
        notificationId: 'new-notif',
        calendarEventId: 'old-cal',
      });
    });
  });
});