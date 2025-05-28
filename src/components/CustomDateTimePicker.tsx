import React from 'react';
import DateTimePicker, { DateTimePickerEvent, AndroidNativeProps, IOSNativeProps } from '@react-native-community/datetimepicker';
import { Platform, Modal, View, Button, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Re-exporta DateTimePickerEvent para que outros arquivos possam importá-lo daqui
export type { DateTimePickerEvent as CustomDateTimePickerEvent };

export interface CustomDateTimePickerProps {
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  display?: AndroidNativeProps['display'] | IOSNativeProps['display'];
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onClose?: () => void; // Para fechar o modal no iOS ao cancelar ou confirmar
  minimumDate?: Date;
  maximumDate?: Date;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  mode,
  display = Platform.OS === 'ios' ? 'spinner' : 'default',
  onChange,
  onClose,
  minimumDate,
  maximumDate,
}) => {
  const { theme } = useTheme();

  const handleConfirmIOS = () => {
    // No iOS, o onChange pode já ter sido chamado.
    // Esta função de confirmação garante que o onClose seja chamado.
    // Se o onChange não for chamado continuamente no iOS, você pode chamar onChange aqui também.
    // onChange({ type: 'set' } as DateTimePickerEvent, value); // Descomente se necessário
    if (onClose) {
      onClose();
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={true} // A visibilidade do modal é controlada pelo componente pai
        onRequestClose={onClose} // Para o botão de voltar do Android (embora seja iOS aqui)
      >
        <View style={[styles.modalOverlay, {backgroundColor: theme.colors.overlay}]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>Selecione {mode === 'date' ? 'Data' : 'Hora'}</Text>
            <DateTimePicker
              value={value}
              mode={mode}
              display={display as IOSNativeProps['display']}
              onChange={onChange} // onChange é chamado quando o valor muda no picker
              textColor={theme.colors.text}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale="pt-BR" // Defina sua localidade
              style={styles.iosPicker}
            />
            <View style={styles.iosButtonContainer}>
                <Button title="Cancelar" onPress={onClose} color={theme.colors.error} />
                <Button title="Confirmar" onPress={handleConfirmIOS} color={theme.colors.primary} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Para Android, o DateTimePicker é renderizado diretamente
  // A visibilidade é controlada pelo componente pai (ex: showDatePicker && <CustomDateTimePicker ... />)
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display as AndroidNativeProps['display']}
      onChange={onChange} // onChange também é chamado no Android
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      // is24Hour={true} // Para modo 'time' se desejar formato 24h
    />
  );
};

const styles = StyleSheet.create({
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Ou 'flex-end' com espaçamento
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  iosPicker: {
    // height: 216, // Altura padrão para spinner no iOS
    width: '100%', // Ocupa a largura do modalContent
  },
  modalContent: {
    alignItems: 'center',
    // backgroundColor e shadowColor são aplicados dinamicamente
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5, // Para Android, embora este seja o bloco iOS
    paddingBottom: 30, // Espaço para botões e safe area inferior
    paddingTop: 20,
    shadowOffset: {
      height: -2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    // backgroundColor é aplicado dinamicamente
    flex: 1,
    justifyContent: 'flex-end', // Modal aparece de baixo
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
});

export default CustomDateTimePicker;
