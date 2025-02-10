import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { EventProvider } from '../contexts/EventContext';

// Mock do serviço de Email para evitar chamadas reais
jest.mock('../services/EmailService', () => ({
  sendEmail: jest.fn(),
}));

// Mock das dependências de navegação
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock do hook useNavigation e useFocusEffect do React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
    useFocusEffect: jest.fn(),
  };
});

describe('HomeScreen', () => {
  // Função auxiliar para renderizar o componente com os provedores necessários
  const renderComponent = () =>
    render(<HomeScreen navigation={mockNavigation} route={{}} />, {
      wrapper: ({ children }) => (
        <ThemeProvider>
          <LanguageProvider>
            <EventProvider>{children}</EventProvider>
          </LanguageProvider>
        </ThemeProvider>
      ),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = renderComponent();

    // Verifica se os textos principais estão presentes na tela
    expect(getByText('JusAgenda')).toBeTruthy();
    expect(getByText(/próximos compromissos/i)).toBeTruthy();
  });

  it('navigates to event creation when event type is selected', () => {
    const { getByText } = renderComponent();

    // Aciona a seleção do tipo de evento "Audiência"
    fireEvent.press(getByText('Audiência'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('EventCreate', {
      eventType: 'audiencia',
    });
  });

  it('navigates to event details when an event is pressed', () => {
    const { getByText } = renderComponent();

    // Simula a ação de pressionar em um evento listado (ex.: "Audiência")
    fireEvent.press(getByText('Audiência'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('EventDetails', {
      event: expect.any(Object),
    });
  });
});
