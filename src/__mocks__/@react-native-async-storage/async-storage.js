// src/__mocks__/@react-native-async-storage/async-storage.js

/**
 * Mock para @react-native-async-storage/async-storage.
 * Este mock simula a API do AsyncStorage para uso em testes Jest.
 * Permite que os testes executem sem depender do armazenamento nativo real.
 */

// Um objeto para simular o armazenamento em memória durante os testes.
const mockStorage = new Map();

export default {
  /**
   * Simula a função getItem.
   * @param {string} key - A chave do item a ser recuperado.
   * @returns {Promise<string|null>} Uma Promise que resolve com o valor do item ou null se não encontrado.
   */
  getItem: jest.fn(async (key) => {
    // console.log(`[Mock AsyncStorage] getItem: key="${key}"`);
    return mockStorage.has(key) ? mockStorage.get(key) : null;
  }),

  /**
   * Simula a função setItem.
   * @param {string} key - A chave do item a ser armazenado.
   * @param {string} value - O valor do item a ser armazenado.
   * @returns {Promise<void>} Uma Promise que resolve quando o item é "armazenado".
   */
  setItem: jest.fn(async (key, value) => {
    // console.log(`[Mock AsyncStorage] setItem: key="${key}", value="${value}"`);
    mockStorage.set(key, String(value)); // Garante que o valor seja string
    return undefined; // setItem retorna Promise<void>
  }),

  /**
   * Simula a função removeItem.
   * @param {string} key - A chave do item a ser removido.
   * @returns {Promise<void>} Uma Promise que resolve quando o item é "removido".
   */
  removeItem: jest.fn(async (key) => {
    // console.log(`[Mock AsyncStorage] removeItem: key="${key}"`);
    mockStorage.delete(key);
    return undefined;
  }),

  /**
   * Simula a função mergeItem.
   * Geralmente usado para fundir um valor JSON com um valor existente.
   * @param {string} key - A chave do item a ser mesclado.
   * @param {string} value - O valor (string JSON) a ser mesclado.
   * @returns {Promise<void>} Uma Promise que resolve quando o item é "mesclado".
   */
  mergeItem: jest.fn(async (key, value) => {
    // console.log(`[Mock AsyncStorage] mergeItem: key="${key}", value="${value}"`);
    const existingValue = mockStorage.get(key);
    if (existingValue) {
      try {
        const existingObj = JSON.parse(existingValue);
        const valueToMerge = JSON.parse(value);
        const mergedObj = { ...existingObj, ...valueToMerge };
        mockStorage.set(key, JSON.stringify(mergedObj));
      } catch (e) {
        // Se não for JSON válido, ou o merge falhar, pode simplesmente sobrescrever ou logar erro.
        // Para o mock, sobrescrever pode ser suficiente ou manter o comportamento de setItem.
        mockStorage.set(key, value);
      }
    } else {
      mockStorage.set(key, value);
    }
    return undefined;
  }),

  /**
   * Simula a função clear.
   * Remove todos os itens do armazenamento mockado.
   * @returns {Promise<void>} Uma Promise que resolve quando o armazenamento é "limpo".
   */
  clear: jest.fn(async () => {
    // console.log('[Mock AsyncStorage] clear');
    mockStorage.clear();
    return undefined;
  }),

  /**
   * Simula a função getAllKeys.
   * @returns {Promise<string[]>} Uma Promise que resolve com um array de todas as chaves.
   */
  getAllKeys: jest.fn(async () => {
    // console.log('[Mock AsyncStorage] getAllKeys');
    return Array.from(mockStorage.keys());
  }),

  /**
   * Simula a função multiGet.
   * @param {string[]} keys - Um array de chaves a serem recuperadas.
   * @returns {Promise<Array<[string, string|null]>>} Uma Promise que resolve com um array de pares [chave, valor].
   */
  multiGet: jest.fn(async (keys) => {
    // console.log(`[Mock AsyncStorage] multiGet: keys="${keys.join(', ')}"`);
    return keys.map(key => [key, mockStorage.has(key) ? mockStorage.get(key) : null]);
  }),

  /**
   * Simula a função multiSet.
   * @param {Array<[string, string]>} keyValuePairs - Um array de pares [chave, valor] a serem armazenados.
   * @returns {Promise<void>} Uma Promise que resolve quando os itens são "armazenados".
   */
  multiSet: jest.fn(async (keyValuePairs) => {
    // console.log(`[Mock AsyncStorage] multiSet: ${keyValuePairs.length} pairs`);
    keyValuePairs.forEach(([key, value]) => {
      mockStorage.set(key, String(value));
    });
    return undefined;
  }),

  /**
   * Simula a função multiRemove.
   * @param {string[]} keys - Um array de chaves a serem removidas.
   * @returns {Promise<void>} Uma Promise que resolve quando os itens são "removidos".
   */
  multiRemove: jest.fn(async (keys) => {
    // console.log(`[Mock AsyncStorage] multiRemove: keys="${keys.join(', ')}"`);
    keys.forEach(key => {
      mockStorage.delete(key);
    });
    return undefined;
  }),

  /**
   * Simula a função multiMerge.
   * @param {Array<[string, string]>} keyValuePairs - Um array de pares [chave, valorJSON] a serem mesclados.
   * @returns {Promise<void>} Uma Promise que resolve quando os itens são "mesclados".
   */
  multiMerge: jest.fn(async (keyValuePairs) => {
    // console.log(`[Mock AsyncStorage] multiMerge: ${keyValuePairs.length} pairs`);
    keyValuePairs.forEach(async ([key, value]) => { // Usando async no forEach interno
      const existingValue = mockStorage.get(key);
      if (existingValue) {
        try {
          const existingObj = JSON.parse(existingValue);
          const valueToMerge = JSON.parse(value);
          const mergedObj = { ...existingObj, ...valueToMerge };
          mockStorage.set(key, JSON.stringify(mergedObj));
        } catch (e) {
          mockStorage.set(key, value);
        }
      } else {
        mockStorage.set(key, value);
      }
    });
    return undefined;
  }),

  // Função auxiliar para testes, para limpar o mockStorage entre os testes.
  __INTERNAL_MOCK_STORAGE_DO_NOT_USE_OR_YOU_WILL_BE_FIRED__: mockStorage,
  __INTERNAL_CLEAR_MOCK_STORAGE_DO_NOT_USE_OR_YOU_WILL_BE_FIRED__: () => {
    mockStorage.clear();
  },
};
