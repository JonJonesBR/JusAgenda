import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../../components/ErrorBoundary.tsx';
import { Text } from 'react-native';

// Mock @rneui/themed
jest.mock('@rneui/themed', () => ({
  Icon: ({ name, size, color, style }) => (
    <div testID={`icon-${name}`} style={style}>{name}</div>
  ),
}));

// Mock theme
jest.mock('../../theme/theme', () => ({
  lightTheme: {
    colors: {
      error: 'red',
      primary: 'blue',
      background: 'white',
      text: {
        primary: 'black',
        secondary: 'gray'
      }
    },
    spacing: {
      lg: 16,
      md: 12,
      sm: 8
    },
    typography: {
      fontSize: {
        xl: 24,
        md: 16
      }
    }
  }
}));

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Silence the console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test Content</Text>
      </ErrorBoundary>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
});