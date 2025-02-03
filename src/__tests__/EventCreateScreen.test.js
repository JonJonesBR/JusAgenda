import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EventCreateScreen from '../screens/EventCreateScreen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { saveEvent } from '../services/storage';

// Mock do módulo de storage
jest.mock('../services/storage', () => ({
  saveEvent: jest.fn(),
}));

// Mock do uuid
jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('EventCreateScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const wrapper = ({ children }) => (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <EventCreateScreen
        navigation={mockNavigation}
        route={{ params: { eventType: 'audiencia' } }}
      />,
      { wrapper }
    );

    expect(getByText('Novo Evento')).toBeTruthy();
    expect(getByPlaceholderText('Digite o título')).toBeTruthy();
    expect(getByPlaceholderText('DD/MM/AAAA')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <EventCreateScreen
        navigation={mockNavigation}
        route={{ params: { eventType: 'audiencia' } }}
      />,
      { wrapper }
    );

    // Tenta salvar sem preencher campos obrigatórios
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(saveEvent).not.toHaveBeenCalled();
    });
  });

  it('validates all required fields', async () => {
    const { getByText, getByPlaceholderText } = render(
        <EventCreateScreen
            navigation={mockNavigation}
            route={{ params: { eventType: 'audiencia' } }}
        />, 
        { wrapper }
    );

    // Tenta salvar sem preencher campos obrigatórios
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
        expect(saveEvent).not.toHaveBeenCalled();
        expect(getByText('O título é obrigatório')).toBeTruthy();
    });
  });

  it('saves event successfully', async () => {
    const { getByPlaceholderText, getByText } = render(
      <EventCreateScreen
        navigation={mockNavigation}
        route={{ params: { eventType: 'audiencia' } }}
      />,
      { wrapper }
    );

    // Preenche os campos obrigatórios
    fireEvent.changeText(getByPlaceholderText('Digite o título'), 'Teste de Audiência');
    fireEvent.changeText(getByPlaceholderText('DD/MM/AAAA'), '01/01/2024');

    // Tenta salvar o evento
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(saveEvent).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Teste de Audiência',
        date: '2024-01-01',
        type: 'audiencia',
        id: 'test-uuid',
      }));
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
