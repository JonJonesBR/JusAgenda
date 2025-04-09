// Import jest from @jest/globals
const { jest } = require("@jest/globals");

// Set global jest
global.jest = jest;

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

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
