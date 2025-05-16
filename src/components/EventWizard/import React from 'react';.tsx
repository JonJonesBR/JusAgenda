import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BasicInfoStep from './BasicInfoStep';

// src/components/EventWizard/BasicInfoStep.test.tsx

// Mock dependencies
jest.mock('@rneui/themed', () => ({
  Input: (props: any) => <input {...props} />,
  Text: (props: any) => <text {...props} />,
}));
jest.mock('@react-native-picker/picker', () => ({
  Picker: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  Item: ({ label, value }: any) => <option value={value}>{label}</option>,
}));
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return (...args: any[]) => actualMoment(...args);
});
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000',
        textSecondary: '#999',
        card: '#fff',
        border: '#ccc',
      },
    },
  }),
}));
jest.mock('../components/ui/InputDialog', () => (props: any) =>
  props.isVisible ? <div testID={`InputDialog-${props.mode}`}>{props.title}</div> : null
);

describe('BasicInfoStep', () => {
  const baseProps = {
    data: {},
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required fields', () => {
    const { getByText, getByPlaceholderText } = render(<BasicInfoStep {...baseProps} />);
    expect(getByText('Informações Básicas')).toBeTruthy();
    expect(getByText('Título *')).toBeTruthy();
    expect(getByText('Tipo *')).toBeTruthy();
    expect(getByText('Data *')).toBeTruthy();
    expect(getByText('Hora')).toBeTruthy();
    expect(getByText('Descrição')).toBeTruthy();
    expect(getByText('Local')).toBeTruthy();
    expect(getByPlaceholderText('Digite o título do evento')).toBeTruthy();
    expect(getByPlaceholderText('Descreva o evento')).toBeTruthy();
    expect(getByPlaceholderText('Local do evento')).toBeTruthy();
  });

  it('calls onUpdate when title changes', () => {
    const onUpdate = jest.fn();
    const { getByPlaceholderText } = render(<BasicInfoStep {...baseProps} onUpdate={onUpdate} />);
    fireEvent.changeText(getByPlaceholderText('Digite o título do evento'), 'Novo Evento');
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Novo Evento' }));
  });

  it('calls onUpdate when tipo changes', () => {
    const onUpdate = jest.fn();
    const { getByLabelText } = render(<BasicInfoStep {...baseProps} onUpdate={onUpdate} />);
    fireEvent.valueChange(getByLabelText('Tipo de evento'), 'prazo');
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'prazo' }));
  });

  it('opens date picker modal when Data button is pressed', () => {
    const { getByText, getByTestId } = render(<BasicInfoStep {...baseProps} />);
    fireEvent.press(getByText('Selecione a data'));
    expect(getByTestId('InputDialog-date')).toBeTruthy();
  });

  it('opens time picker modal when Hora button is pressed', () => {
    const { getByText, getByTestId } = render(<BasicInfoStep {...baseProps} />);
    fireEvent.press(getByText('Selecione a hora'));
    expect(getByTestId('InputDialog-time')).toBeTruthy();
  });

  it('calls onUpdate when descricao changes', () => {
    const onUpdate = jest.fn();
    const { getByPlaceholderText } = render(<BasicInfoStep {...baseProps} onUpdate={onUpdate} />);
    fireEvent.changeText(getByPlaceholderText('Descreva o evento'), 'Descrição teste');
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ descricao: 'Descrição teste' }));
  });

  it('calls onUpdate when local changes', () => {
    const onUpdate = jest.fn();
    const { getByPlaceholderText } = render(<BasicInfoStep {...baseProps} onUpdate={onUpdate} />);
    fireEvent.changeText(getByPlaceholderText('Local do evento'), 'Sala 1');
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ local: 'Sala 1' }));
  });
});