import { storage } from '../../src/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '../../src/utils/AppError';

jest.mock('@react-native-async-storage/async-storage');

describe('Storage Service', () => {
  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.spyOn(AsyncStorage, 'getItem');
  });

  afterEach(async () => {
    jest.runAllTimers();
    await Promise.resolve(); // Processa microtarefas pendentes
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('deve lançar erro ao exceder timeout na leitura', async () => {
    AsyncStorage.getItem.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve(null), 5000);
    }));
    jest.advanceTimersByTime(3000);
    await Promise.resolve(); // Garante processamento assíncrono
    await expect(storage.getItem('test_key')).rejects.toThrow(
      'Timeout ao ler item de armazenamento'
    );
  });

  it('deve lançar AppError ao encontrar dados corrompidos', async () => {
    AsyncStorage.getItem.mockResolvedValue('{invalid_json');
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    await expect(storage.getItem('bad_data')).rejects.toThrow(AppError);
  });

  it('deve retornar null para chaves não existentes', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const result = await storage.getItem('non_existent');
    expect(result).toBeNull();
  });
});