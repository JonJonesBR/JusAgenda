import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EventCreateScreen from '../screens/EventCreateScreen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { saveEvent } from '../services/storage';

// Mock do módulo de storage para interceptar chamadas à função saveEvent
jest.mock('../services/storage', () => ({
  saveEvent: jest.fn(),
}));

// Mock do módulo de geração de UUID para garantir um ID fixo nos testes
jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('EventCreateScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  // Função auxiliar para renderizar o componente com o ThemeProvider
  const renderComponent = (params = { eventType: 'audiencia' }) =>
    render(
      <EventCreateScreen navigation={mockNavigation} route={{ params }} />,
      { wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider> }
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    expect(getByText('Novo Evento')).toBeTruthy();
    expect(getByPlaceholderText('Digite o título')).toBeTruthy();
    expect(getByPlaceholderText('DD/MM/AAAA')).toBeTruthy();
  });

  it('validates required fields and prevents saving when empty', async () => {
    const { getByText } = renderComponent();

    // Aciona a tentativa de salvar sem preencher os campos obrigatórios
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(saveEvent).not.toHaveBeenCalled();
    });
  });

  it('shows validation error messages for required fields', async () => {
    const { getByText } = renderComponent();

    // Tenta salvar sem preencher os campos e verifica a mensagem de erro
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(saveEvent).not.toHaveBeenCalled();
      expect(getByText('O título é obrigatório')).toBeTruthy();
    });
  });

  it('saves event successfully when required fields are provided', async () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    // Preenche os campos obrigatórios
    fireEvent.changeText(getByPlaceholderText('Digite o título'), 'Teste de Audiência');
    fireEvent.changeText(getByPlaceholderText('DD/MM/AAAA'), '01/01/2024');

    // Aciona a ação de salvar
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Teste de Audiência',
          date: '2024-01-01',
          type: 'audiencia',
          id: 'test-uuid',
        })
      );
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
