import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../../App';

// Mock de navegação: preserva as funcionalidades reais, mas substitui os métodos de navegação
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});
