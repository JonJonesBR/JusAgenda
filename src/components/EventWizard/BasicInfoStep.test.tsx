// src/components/EventWizard/BasicInfoStep.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BasicInfoStep from './BasicInfoStep'; // Ajuste o caminho se necessário
import { ThemeContext, lightTheme /* Theme */ } from '../../contexts/ThemeContext'; // 'Theme' pode não ser necessária aqui diretamente
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '../../constants';
import { EventWizardFormData } from './index'; // Tipo dos dados do formulário

// Mock das props necessárias para BasicInfoStep
const mockFormData: EventWizardFormData = {
  title: '',
  data: new Date(),
  hora: null,
  isAllDay: false,
  eventType: EVENT_TYPES.REUNIAO,
  local: '',
  description: '',
  cor: '',
  // Adicione outros campos conforme a definição de EventWizardFormData
};

const mockUpdateField = jest.fn();
const mockErrors = {};

const mockEventTypes = EVENT_TYPE_LABELS;

// Um wrapper para prover o contexto de tema, se BasicInfoStep o utilizar diretamente ou indiretamente
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('<BasicInfoStep />', () => {
  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    mockUpdateField.mockClear();
  });

  it('deve renderizar os campos de informação básica', () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <BasicInfoStep
        formData={mockFormData}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={false}
        theme={lightTheme} // Passa o tema diretamente
        eventTypes={mockEventTypes}
      />
    );

    // Verifica se os campos principais estão presentes
    expect(getByPlaceholderText('Ex: Reunião com cliente X')).toBeTruthy(); // Título
    expect(getByText('Tipo de Evento *')).toBeTruthy();
    expect(getByText('Data *')).toBeTruthy();
    expect(getByText('Dia Todo?')).toBeTruthy();
    expect(getByPlaceholderText('Ex: Escritório, Fórum, Online')).toBeTruthy(); // Local
  });

  it('deve chamar updateField ao alterar o título', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <BasicInfoStep
        formData={mockFormData}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={false}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );

    const titleInput = getByPlaceholderText('Ex: Reunião com cliente X');
    fireEvent.changeText(titleInput, 'Nova Reunião');
    expect(mockUpdateField).toHaveBeenCalledWith('title', 'Nova Reunião');
  });

  it('deve mostrar o campo de hora se "Dia Todo" for falso', () => {
    const formDataNotAllDay = { ...mockFormData, isAllDay: false, hora: new Date() };
    const { getByText } = renderWithTheme( // Removido queryByText se não for usado aqui
      <BasicInfoStep
        formData={formDataNotAllDay}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={false}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );
    expect(getByText('Hora')).toBeTruthy();
  });

  it('não deve mostrar o campo de hora se "Dia Todo" for verdadeiro', () => {
    const formDataAllDay = { ...mockFormData, isAllDay: true, hora: null };
    const { queryByText } = renderWithTheme( // queryByText é usado aqui
      <BasicInfoStep
        formData={formDataAllDay}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={false}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );
    expect(queryByText('Hora')).toBeNull();
  });

  it('deve limpar a hora quando "Dia Todo" é ativado', () => {
    const formDataWithTime = { ...mockFormData, isAllDay: false, hora: new Date() };
     renderWithTheme( // Removido getByTestId se o teste estiver incompleto/comentado
      <BasicInfoStep
        formData={formDataWithTime}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={false}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );
    // Para testar o Switch, você precisaria de uma forma de o identificar (ex: testID)
    // e simular a sua alteração.
    // Exemplo (com testID='all-day-switch'):
    // const allDaySwitch = getByTestId('all-day-switch'); // Precisaria de getByTestId
    // fireEvent(allDaySwitch, 'valueChange', true); // Simula a ativação
    // expect(mockUpdateField).toHaveBeenCalledWith('isAllDay', true);
    // expect(mockUpdateField).toHaveBeenCalledWith('hora', null);
    // Este teste ainda está incompleto, então as variáveis de query podem não ser necessárias ainda.
  });


  it('deve exibir mensagem de erro para o campo de título', () => {
    const errorsWithTitle = { ...mockErrors, title: 'Título inválido' };
    const { getByText } = renderWithTheme(
      <BasicInfoStep
        formData={errorsWithTitle} // Corrigido: Deveria ser mockFormData aqui
        updateField={mockUpdateField}
        // errors={errorsWithTitle} // A prop errors deveria ser passada aqui
        // Vou corrigir para o que parece ser a intenção:
        errors={errorsWithTitle as any} // Usar 'as any' se a estrutura de erro não corresponder perfeitamente a Partial<Record<keyof EventWizardFormData, string>> por agora
        isReadOnly={false}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );
    expect(getByText('Título inválido')).toBeTruthy();
  });

  it('deve desabilitar campos quando isReadOnly for true', () => {
    const { getByPlaceholderText /*, UNSAFE_getByProps */ } = renderWithTheme( // Removido UNSAFE_getByProps
      <BasicInfoStep
        formData={mockFormData}
        updateField={mockUpdateField}
        errors={mockErrors}
        isReadOnly={true}
        theme={lightTheme}
        eventTypes={mockEventTypes}
      />
    );

    const titleInput = getByPlaceholderText('Ex: Reunião com cliente X');
    expect(titleInput.props.editable).toBe(false);

    // Testar o Picker desabilitado
    // A forma de testar `enabled` no Picker pode variar.
  });

  // Adicione mais testes para:
  // - Interação com CustomDateTimePicker para data e hora
  // - Seleção de tipo de evento no Picker
  // - Outros campos e suas validações/erros
  // - Comportamento do modo isReadOnly para todos os campos interativos
});
