import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar as configurações salvas ao iniciar', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('true') // Notificações
      .mockResolvedValueOnce('true') // Email
      .mockResolvedValueOnce('user@example.com') // Email padrão
      .mockResolvedValueOnce('45'); // Tempo de lembrete

    const { findByDisplayValue } = render(<SettingsScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(4);
      expect(findByDisplayValue('user@example.com')).toBeTruthy();
      expect(findByDisplayValue('45 minutos antes')).toBeTruthy();
    });
  });

  it('deve alternar as notificações push corretamente', async () => {
    const { getByTestId } = render(<SettingsScreen />);
    
    fireEvent(getByTestId('notifications-switch'), 'valueChange', true);
    
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@jusagenda_notifications_enabled', 
        'true'
      );
    });
  });

  it('deve lidar com erros ao carregar configurações', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockRejectedValueOnce(new Error('Erro de leitura'));

    const { findByText } = render(<SettingsScreen />);
    
    await waitFor(() => {
      expect(findByText(/Erro ao carregar configurações/i)).toBeTruthy();
    });
  });
});