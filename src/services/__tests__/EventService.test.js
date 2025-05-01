import {
  saveCompromisso,
  getAllCompromissos,
  deleteCompromisso,
} from "../EventService";
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  withScope: jest.fn(fn => fn()),
}));
import Sentry from '@sentry/react-native';
import { captureException } from "../../utils/errorTracking";

const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
const logger = require('../../utils/loggerService');
jest.mock("../storage", () => mockStorage);
jest.mock("../../utils/errorTracking");


describe("EventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveCompromisso", () => {
    const invalidEvent = { type: "audiencia", date: new Date() }; 
    const invalidTypeEvent = { title: "Teste", type: "invalid", date: new Date() }; 

    test('Deve migrar IDs antigos para novo formato', async () => {
      mockStorage.getItem.mockResolvedValue([
        { id: '2020010112abcd' },
        { id: '20240101-abcd' }
      ]);

      await migrateEventIds();
      
      const migratedEvents = mockStorage.setItem.mock.calls[0][1];
      expect(migratedEvents[0].id).toMatch(/^\d{8}-[a-f0-9]{4}$/);
      expect(migratedEvents[1].id).toBe('20240101-abcd');
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('Deve logar erro na migração com dados inválidos', async () => {
      mockStorage.getItem.mockRejectedValue(new Error('Erro de armazenamento'));
      
      await expect(migrateEventIds())
        .rejects.toThrow('Erro durante migração de IDs');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Erro durante migração de IDs', 
        expect.any(Error)
      );
    });

    test('Deve falhar ao adicionar compromisso sem data', async () => {
      await expect(saveCompromisso({ title: 'Evento Inválido' }))
        .rejects.toThrow('A data do compromisso é obrigatória');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Erro ao adicionar compromisso',
        expect.any(Error),
        expect.objectContaining({ operation: 'add_compromisso' })
      );
    });

    test('Deve atualizar compromisso existente', async () => {
      const existingEvent = {
        id: '20240101-abcd',
        title: 'Evento Antigo',
        date: new Date('2024-01-01')
      };
      mockStorage.getItem.mockResolvedValue([existingEvent]);
      
      const updatedEvent = await saveCompromisso({
        ...existingEvent,
        title: 'Evento Atualizado'
      });
      
      expect(updatedEvent.title).toBe('Evento Atualizado');
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([expect.objectContaining({ title: 'Evento Atualizado' })])
      );
    });

    test('Deve deletar compromisso existente', async () => {
      const eventToDelete = {
        id: '20240101-abcd',
        title: 'Evento para Excluir',
        date: new Date()
      };
      mockStorage.getItem.mockResolvedValue([eventToDelete]);
      
      await deleteCompromisso(eventToDelete.id);
      
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.arrayContaining([eventToDelete])
      );
    });

    it("deve adicionar novo evento com ID válido", async () => {
      const { fn } = jest.requireActual('jest-mock');
      storage.getItem = fn().mockResolvedValue([]);
      storage.setItem = fn().mockResolvedValue();
      const novoEvento = { title: "Teste", type: "audiencia", date: new Date().toISOString() };
      await saveCompromisso(novoEvento);
      expect(storage.setItem).toHaveBeenCalled();
      const savedEvents = storage.setItem.mock.calls[0][1];
      expect(savedEvents[0].id).toBeDefined();
    });
  });

  describe("getAllCompromissos", () => {
    it("deve corrigir datas inválidas automaticamente", async () => {
      const { fn } = jest.requireActual('jest-mock');
      (storage.getItem).mockResolvedValueOnce([
        { id: "1", date: "invalid" },
      ]);
      storage.setItem = fn().mockResolvedValue();
      const result = await getAllCompromissos();

      console.log('DEBUG result:', result);
      expect(result).not.toHaveLength(0);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(storage.setItem).toHaveBeenCalled(); // Verifica se o storage foi atualizado com a data corrigida
    });
  });

  describe("deleteCompromisso", () => {
    it("deve capturar exceção no Sentry ao falhar e retornar false", async () => {
      const eventoParaDeletar = { id: "123", title: "Teste Deletar", type: "prazo", date: new Date() };
      const dbError = new Error("DB write error");
      
      // Configura mocks especificamente para esta chamada
      const { fn } = jest.requireActual('jest-mock');
      storage.getItem = fn().mockResolvedValueOnce([eventoParaDeletar]); // Garante que getItem retorne o evento
      storage.setItem = fn().mockRejectedValueOnce(dbError); // Garante que setItem falhe

      // Chama a função a ser testada
      const result = await deleteCompromisso("123");
      
      // Verifica o resultado e a captura da exceção
      expect(result).toBe(false);
      expect(captureException).toHaveBeenCalledWith(
        dbError, 
        expect.objectContaining({ operation: "delete_event" })
      );
      // Verifica se setItem foi chamado com a lista vazia (após a tentativa de remoção)
      expect(storage.setItem).toHaveBeenCalledWith("@jusagenda_events", []);
    });
  });
});
