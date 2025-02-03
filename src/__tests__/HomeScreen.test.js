import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';

// Mock das dependências de navegação
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock do useNavigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
}));

describe('HomeScreen', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} route={{}} />,
      { wrapper }
    );

    // Verifica se o título está presente
    expect(getByText('JusAgenda')).toBeTruthy();
  });

  it('navigates to event creation when event type is selected', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} route={{}} />,
      { wrapper }
    );

    // Encontra e clica no botão de audiência
    fireEvent.press(getByText('Audiência'));

    // Verifica se a navegação foi chamada com os parâmetros corretos
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EventCreate', {
      eventType: 'audiencia',
    });
  });

  it('navigates to event details when an event is pressed', () => {
    const { getByText } = render(
        <HomeScreen navigation={mockNavigation} route={{}} />, 
        { wrapper }
    );

    // Simula a pressão em um evento
    fireEvent.press(getByText('Audiência'));

    // Verifica se a navegação foi chamada com os parâmetros corretos
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EventDetails', { event: expect.any(Object) });
  });
});
