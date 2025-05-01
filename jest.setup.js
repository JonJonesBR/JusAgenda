// Import jest from @jest/globals
const { jest } = require("@jest/globals");

// Set global jest
global.jest = jest;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.useFakeTimers();

// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

// Mock Expo Calendar
jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  createEventAsync: jest.fn(),
  deleteEventAsync: jest.fn(),
}));

// Mock react-native-fs
jest.mock("react-native-fs", () => ({
  writeFile: jest.fn(),
  readFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
}));

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  documentDirectory: '/mock/documents/',
  EncodingType: { UTF8: 'utf8' },
}));

// Mock expo-sharing
jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-device
jest.mock("expo-device", () => ({
  brand: 'MockBrand',
  modelName: 'MockModel',
  osName: 'MockOS',
  osVersion: '1.0',
}));

// Mock expo-print
jest.mock("expo-print", () => ({
  printAsync: jest.fn(),
  selectPrinterAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  manifest: {},
  appOwnership: 'expo',
  platform: { ios: {}, android: {}, web: {} },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children || null,
}));

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  createAssetAsync: jest.fn(),
  createAlbumAsync: jest.fn(),
  addAssetsToAlbumAsync: jest.fn(),
}));

// Mock react-native Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  select: jest.fn(),
}));

// Mock expo-mail-composer
jest.mock("expo-mail-composer", () => ({
  composeAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-modules-core
jest.mock("expo-modules-core", () => ({
  EventEmitter: {
    setMaxListeners: jest.fn(),
  },
}));
