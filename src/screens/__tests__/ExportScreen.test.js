import React from 'react';

jest.mock('../../utils/common', () => ({
  COLORS: { background: '#fff', textPrimary: '#000', textSecondary: '#333', primary: '#007bff' },
  EVENT_TYPES: ['audiencia', 'reuniao'],
}));
jest.mock('../../utils/dateUtils', () => ({
  formatDateTime: (date) => '01/01/2025 10:00',
}));

jest.mock("@rneui/themed", () => {
  const React = require('react');
  const { View, Text: RNText, TouchableOpacity } = require('react-native');
  return {
    Button: (props) => React.createElement(View, props, [React.createElement(RNText, { key: 'title' }, props.title), props.children]),
    FAB: (props) => React.createElement(View, props, props.children),
    Card: (props) => React.createElement(View, props, props.children),
    Icon: (props) => React.createElement(RNText, null, `Icon:${props.name}`),
    Text: (props) => React.createElement(RNText, props, props.children),
    CheckBox: (props) => React.createElement(TouchableOpacity, { onPress: props.onPress, style: props.containerStyle },
      React.createElement(RNText, null, props.checked ? '[X]' : '[ ]'),
      React.createElement(RNText, null, props.title)
    ),
  };
});

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///mock-dir/",
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: "utf8" },
}));
jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));
const mockEvents = [
  { id: "1", title: "Audiência Teste", type: "audiencia", date: new Date() },
  { id: "2", title: "Reunião Teste", type: "reuniao", date: new Date() },
];
jest.mock("../../contexts/EventContext", () => ({
  useEvents: () => ({ events: mockEvents }),
}));
jest.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: { colors: { primary: '#007bff', background: '#fff', card: '#fff', text: '#000', border: '#ccc', notification: '#f00', surface: '#fff' } } }),
}));
jest.mock('../../theme/theme', () => ({
  DefaultTheme: { colors: { primary: '#007bff', background: '#fff', card: '#fff', text: '#000', border: '#ccc', notification: '#f00', surface: '#fff' } },
  lightTheme: { colors: { primary: '#007bff', background: '#fff', surface: '#fff' } },
}));
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));
jest.mock("../../services/ExportService", () => ({
  exportToExcel: jest.fn().mockResolvedValue({ success: true }),
  exportToPDF: jest.fn().mockResolvedValue({ success: true }),
  exportToWord: jest.fn().mockResolvedValue({ success: true }),
}));
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExportScreen from '../ExportScreen';
import ExportService from '../../services/ExportService';

describe('ExportScreen', () => {
  it('should render export buttons and handle export', async () => {
    const { getByText } = render(<ExportScreen />);
    expect(getByText('Exportar Compromissos')).toBeTruthy();
    expect(getByText('Audiência Teste')).toBeTruthy();
    expect(getByText('Excel')).toBeTruthy();
    expect(getByText('PDF')).toBeTruthy();
    expect(getByText('Word')).toBeTruthy();
  });

  it('should call the correct export function when clicking the buttons', async () => {
    const { getByText } = render(<ExportScreen />);

    // Select the first event (simulating click on CheckBox)
    const eventCheckbox = getByText("Audiência Teste");
    fireEvent.press(eventCheckbox); // Assuming the text is inside the TouchableOpacity of the mock CheckBox

    // Click on the export buttons
    fireEvent.press(getByText("Excel"));
    await waitFor(() => {
      expect(ExportService.exportToExcel).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: "1" })
      ]));
    });

    fireEvent.press(getByText("PDF"));
    await waitFor(() => {
      expect(ExportService.exportToPDF).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: "1" })
      ]));
    });

    fireEvent.press(getByText("Word"));
    await waitFor(() => {
      expect(ExportService.exportToWord).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: "1" })
      ]));
    });
  });
});
