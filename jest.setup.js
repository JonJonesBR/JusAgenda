require('@testing-library/jest-native/extend-expect');

// Mock do react-native-reanimated
global.__reanimatedWorkletInit = jest.fn();
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Mock do react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

// Mock dos módulos Expo utilizados
jest.mock('expo-mail-composer', () => ({
  composeAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true))
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true }))
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test/',
  writeAsStringAsync: jest.fn()
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn()
}));

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));
