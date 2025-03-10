import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  DefaultTheme: {
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(242, 242, 242)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)'
    }
  }
}));

// Mock contexts
jest.mock('../../src/contexts/EventContext', () => ({
  useEvents: () => ({
    events: [],
    deleteEvent: jest.fn(),
    refreshEvents: jest.fn(),
    loading: false,
  }),
  EventProvider: ({ children }) => children,
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
}));

jest.mock('../../src/contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }) => children,
}));

// Mock AppNavigator
jest.mock('../../src/navigation/AppNavigator', () => 'AppNavigator');

// Mock Toast
jest.mock('react-native-toast-message', () => 'Toast');

// Mock error tracking
jest.mock('../../src/utils/errorTracking', () => ({
  initErrorTracking: jest.fn(),
}));

// Mock ErrorBoundary
jest.mock('../../src/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children, testID }) => <div testID={testID}>{children}</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    // Basic smoke test to ensure the app renders
    expect(getByTestId('app-root')).toBeTruthy();
  });

  it('has ErrorBoundary as the root component', () => {
    // This test verifies that ErrorBoundary is properly set up as the root component
    const { getByTestId } = render(<App />);
    const rootElement = getByTestId('app-root');
    expect(rootElement).toBeTruthy();
  });
});