import 'react-native-gesture-handler/jestSetup';

// Mock do react-native-reanimated para evitar avisos e erros durante os testes
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // Sobrepõe o método 'call' para que não execute nenhuma ação
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock do módulo expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

// Mock do módulo expo-mail-composer
jest.mock('expo-mail-composer', () => ({
  composeAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock do módulo expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test/',
  writeAsStringAsync: jest.fn(),
}));

// Mock do módulo expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
