// src/__mocks__/@react-navigation/native.js

/**
 * Mock para @react-navigation/native.
 * Simula os hooks e componentes mais comuns para uso em testes Jest.
 */

import React from 'react';

// Mock para o NavigationContainer. Geralmente, apenas renderiza os children nos testes.
const MockNavigationContainer = ({ children }) => <>{children}</>;

// Mock para o hook useNavigation
// Retorna um objeto com as funções de navegação mais comuns como jest.fn()
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockSetParams = jest.fn();
const mockDispatch = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockPop = jest.fn();
const mockPopToTop = jest.fn();
const mockIsFocused = jest.fn(() => true); // Por padrão, assume que a tela está focada
const mockCanGoBack = jest.fn(() => true); // Por padrão, assume que pode voltar

const useNavigation = jest.fn(() => ({
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  setParams: mockSetParams,
  dispatch: mockDispatch,
  replace: mockReplace,
  push: mockPush,
  pop: mockPop,
  popToTop: mockPopToTop,
  isFocused: mockIsFocused,
  canGoBack: mockCanGoBack,
  // Adicione outras funções de navegação que você usa, como reset, etc.
  // Ex: reset: jest.fn(),
  // Ex: dangerouslyGetParent: jest.fn(),
  // Ex: dangerouslyGetState: jest.fn(),
}));

// Mock para o hook useRoute
// Retorna um objeto com 'params' e 'key' e 'name' para a rota atual.
// Você pode querer que `params` seja configurável por teste.
const mockRouteParams = {}; // Pode ser sobrescrito em testes específicos
const useRoute = jest.fn(() => ({
  params: mockRouteParams,
  key: 'mockRouteKey-123',
  name: 'MockScreenName',
}));

// Mock para o hook useFocusEffect
// Simplesmente executa o callback fornecido, similar ao useEffect.
// Não simula a lógica real de foco/desfoco para o efeito.
const useFocusEffect = jest.fn(React.useEffect);

// Mock para o hook useIsFocused
// Por padrão, retorna true. Pode ser mockado para retornar false em testes específicos.
const useIsFocusedMock = jest.fn(() => true);

// Mock para o hook useLinkTo
const useLinkTo = jest.fn(() => jest.fn()); // Retorna uma função mock

// Mock para o hook useLinkProps
const useLinkProps = jest.fn(() => ({ onPress: jest.fn(), href: '/mock-link' }));

// Mock para o hook useScrollToTop
// Simplesmente aceita a ref.
const useScrollToTop = jest.fn((ref) => {
  // console.log('[Mock useScrollToTop] Ref:', ref);
});


// Exporta os mocks
export {
  MockNavigationContainer as NavigationContainer, // Exporta o mock como NavigationContainer
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocusedMock as useIsFocused, // Exporta o mock como useIsFocused
  useLinkTo,
  useLinkProps,
  useScrollToTop,
  // Adicione outros exports que sua aplicação usa de @react-navigation/native
  // Ex: DefaultTheme, DarkTheme (podem ser objetos simples)
  // Ex: getFocusedRouteNameFromRoute (pode retornar um valor mockado)
};

// Funções auxiliares para controlar os mocks em testes (opcional)
export const __mockNavigate = mockNavigate;
export const __mockGoBack = mockGoBack;
export const __mockSetOptions = mockSetOptions;
export const __mockSetParams = mockSetParams;
export const __mockIsFocused = mockIsFocused; // A função interna do useNavigation
export const __setMockRouteParams = (params) => {
  Object.assign(mockRouteParams, params); // Permite definir params para useRoute
};
export const __clearMockRouteParams = () => {
  for (const key in mockRouteParams) {
    delete mockRouteParams[key];
  }
};
export const __setUseIsFocusedReturnValue = (value) => {
  useIsFocusedMock.mockReturnValue(value);
};

// Resetar todos os mocks de função antes de cada teste (pode ser feito no setupTests.js)
// Exemplo:
// beforeEach(() => {
//   mockNavigate.mockClear();
//   mockGoBack.mockClear();
//   // ... resetar outros mocks
//   __clearMockRouteParams();
//   useIsFocusedMock.mockReturnValue(true); // Reset para o padrão
// });
