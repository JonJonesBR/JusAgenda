import { saveCompromisso, getAllCompromissos, deleteCompromisso } from '../EventService';
import { storage } from '../storage';
import { captureException } from '../../utils/errorTracking';

jest.mock('../storage');
jest.mock('../../utils/errorTracking');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue([]);
  });

  describe('saveCompromisso', () => {
    it('deve lançar erro se título estiver faltando', async () => {
      await expect(saveCompromisso({ type: 'audiencia' }))
        .rejects
        .toThrow('Título do evento é obrigatório');
    });

    it('deve lançar erro para tipo de evento inválido', async () => {
      await expect(saveCompromisso({ title: 'Teste', type: 'invalid' }))
        .rejects
        .toThrow('Tipo de evento inválido');
    });

    it('deve adicionar novo evento com ID válido', async () => {
      const novoEvento = { title: 'Teste', type: 'audiencia' };
      await saveCompromisso(novoEvento);
      
      expect(storage.setItem).toHaveBeenCalled();
      const savedEvents = storage.setItem.mock.calls[0][1];
      expect(savedEvents[0].id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
    });
  });

  describe('getAllCompromissos', () => {
    it('deve corrigir datas inválidas automaticamente', async () => {
      storage.getItem.mockResolvedValue([{ id: '1', date: 'invalid' }]);
      const result = await getAllCompromissos();
      
      expect(result[0].date).toBeInstanceOf(Date);
      expect(storage.setItem).toHaveBeenCalled();
    });
  });

  describe('deleteCompromisso', () => {
    it('deve capturar exceção no Sentry ao falhar', async () => {
      storage.getItem.mockRejectedValue(new Error('DB error'));
      
      await expect(deleteCompromisso('123'))
        .rejects
        .toThrow();
      
      expect(captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ operation: 'delete_event' })
      );
    });
  });
});