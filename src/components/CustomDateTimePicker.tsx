// src/components/CustomDateTimePicker.tsx
import React, { useState, ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent, // Evento do DateTimePicker
  AndroidNativeProps, // Props específicas do Android
  IOSNativeProps,     // Props específicas do iOS
} from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button'; // Usando o seu componente Button customizado

// Reexportando o tipo de evento para clareza, caso seja necessário externamente
export type CustomDateTimePickerEvent = DateTimePickerEvent;

// Props para o CustomDateTimePicker
// Combinando props do iOS e Android, e adicionando as nossas
type DateTimePickerMode = 'date' | 'time' | 'datetime' | 'countdown'; // Adicionando 'countdown'

interface CustomDateTimePickerProps {
  value: Date; // A data/hora atual selecionada
  mode?: DateTimePickerMode; // 'date', 'time', 'datetime', ou 'countdown'
  display?: AndroidNativeProps['display'] | IOSNativeProps['display']; // 'default', 'spinner', 'calendar', 'clock' (Android) / 'default', 'compact', 'inline', 'spinner' (iOS)
  onChange: (event: CustomDateTimePickerEvent, date?: Date) => void;
  placeholder?: string; // Texto a ser exibido antes de uma data ser selecionada (para o TouchableOpacity)
  style?: StyleProp<ViewStyle>; // Estilo para o TouchableOpacity que abre o picker
  textStyle?: StyleProp<TextStyle>; // Estilo para o texto dentro do TouchableOpacity
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: IOSNativeProps['minuteInterval']; // Intervalo de minutos para iOS
  timeZoneOffsetInMinutes?: IOSNativeProps['timeZoneOffsetInMinutes']; // Fuso horário para iOS
  is24Hour?: AndroidNativeProps['is24Hour']; // Formato 24h para Android (time mode)
  // Props para o Modal no iOS
  iosModalTitle?: string;
  iosDoneText?: string;
  iosCancelText?: string;
  // Render customizado para o ativador do picker
  customTrigger?: (params: { onPress: () => void; displayValue: string }) => ReactNode;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  mode = 'date',
  display, // Será 'default' se não especificado, o DateTimePicker lida com isso
  onChange,
  placeholder = 'Selecionar...',
  style,
  textStyle,
  disabled = false,
  minimumDate,
  maximumDate,
  minuteInterval,
  timeZoneOffsetInMinutes,
  is24Hour,
  iosModalTitle = 'Selecionar Data/Hora',
  iosDoneText = 'Confirmar',
  iosCancelText = 'Cancelar',
  customTrigger,
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  // Para iOS, precisamos de um estado temporário para a data no modal
  const [iosTempValue, setIosTempValue] = useState<Date>(value);

  const handlePress = () => {
    if (!disabled) {
      setIosTempValue(value); // Reseta o valor temporário do iOS ao abrir
      setShowPicker(true);
    }
  };

  const handleChange = (event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false); // No Android, o picker se fecha automaticamente
    }
    // selectedDate pode ser undefined se o usuário cancelar (Android)
    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setIosTempValue(selectedDate); // Atualiza o valor temporário no modal do iOS
        // Não chama onChange aqui ainda, espera o "Confirmar"
      } else {
        // No Android, ou se não for iOS, chama onChange diretamente
        onChange(event, selectedDate);
      }
    } else if (Platform.OS === 'android' && event.type === 'dismissed') {
        // Usuário cancelou no Android
        onChange(event, undefined);
    }
  };

  const handleIosConfirm = () => {
    setShowPicker(false);
    onChange({ type: 'set', nativeEvent: { timestamp: iosTempValue.getTime() } } as CustomDateTimePickerEvent, iosTempValue);
  };

  const handleIosCancel = () => {
    setShowPicker(false);
    // Opcional: notificar que foi cancelado, se necessário
    // onChange({ type: 'dismissed', nativeEvent: { timestamp: Date.now() } } as CustomDateTimePickerEvent, undefined);
  };

  const getDisplayValue = (): string => {
    if (!value || isNaN(value.getTime())) return placeholder;

    if (mode === 'date') {
      return value.toLocaleDateString(theme.mode === 'dark' ? 'pt-BR' : 'pt-BR'); // Ajuste de locale se necessário
    }
    if (mode === 'time') {
      return value.toLocaleTimeString(theme.mode === 'dark' ? 'pt-BR' : 'pt-BR', { hour: '2-digit', minute: '2-digit', hour12: !is24Hour });
    }
    if (mode === 'datetime') {
      return value.toLocaleString(theme.mode === 'dark' ? 'pt-BR' : 'pt-BR', { hour: '2-digit', minute: '2-digit', hour12: !is24Hour });
    }
    return value.toString(); // Fallback
  };

  const displayValue = getDisplayValue();

  const pickerProps = {
    value: Platform.OS === 'ios' ? iosTempValue : value,
    mode,
    display: display || (Platform.OS === 'ios' ? (mode === 'date' ? 'inline' : 'spinner') : 'default'),
    onChange: handleChange,
    minimumDate,
    maximumDate,
    minuteInterval,
    timeZoneOffsetInMinutes,
    is24Hour,
    // Adicionar textColor para iOS 14+ se display for 'inline' ou 'compact'
    ...(Platform.OS === 'ios' && (display === 'inline' || display === 'compact') && { textColor: theme.colors.text }),
  };

  // Estilos dinâmicos
  const themedTouchableStyle: ViewStyle = {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2, // Similar ao Input
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    minHeight: 48, // Altura mínima para toque
  };

  const themedTextStyle: TextStyle = {
    color: (value && !isNaN(value.getTime())) ? theme.colors.text : theme.colors.placeholder,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
  };


  if (Platform.OS === 'ios') {
    return (
      <>
        {customTrigger ? (
          customTrigger({ onPress: handlePress, displayValue })
        ) : (
          <TouchableOpacity
            style={[themedTouchableStyle, styles.touchableBase, style]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[themedTextStyle, textStyle]}>{displayValue}</Text>
          </TouchableOpacity>
        )}
        <Modal
          transparent
          visible={showPicker}
          animationType="slide"
          onRequestClose={handleIosCancel}
        >
          <View style={styles.iosModalOverlay}>
            <View style={[styles.iosModalContent, { backgroundColor: theme.colors.card }]}>
              {iosModalTitle && <Text style={[styles.iosModalTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{iosModalTitle}</Text>}
              {/* @ts-ignore: DateTimePicker types podem não estar perfeitos para todas as props condicionais */}
              <DateTimePicker {...pickerProps} />
              <View style={[styles.iosModalActions, { borderTopColor: theme.colors.border }]}>
                <Button title={iosCancelText} onPress={handleIosCancel} type="clear" buttonStyle={styles.iosModalButton} titleStyle={{color: theme.colors.text}} />
                <View style={styles.iosButtonSeparator} />
                <Button title={iosDoneText} onPress={handleIosConfirm} type="solid" buttonStyle={styles.iosModalButton} />
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // Android
  return (
    <>
      {customTrigger ? (
        customTrigger({ onPress: handlePress, displayValue })
      ) : (
        <TouchableOpacity
          style={[themedTouchableStyle, styles.touchableBase, style]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[themedTextStyle, textStyle]}>{displayValue}</Text>
        </TouchableOpacity>
      )}
      {showPicker && (
        // @ts-ignore: DateTimePicker types podem não estar perfeitos para todas as props condicionais
        <DateTimePicker {...pickerProps} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  touchableBase: {
    // Estilos base para o TouchableOpacity que não dependem do tema
  },
  // Estilos para o Modal do iOS
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Modal aparece de baixo
  },
  iosModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20, // Espaço para botões e safe area
  },
  iosModalTitle: {
    fontSize: 18, // Ajustado via theme
    padding: 16,
    textAlign: 'center',
  },
  iosModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
  },
  iosModalButton: {
    flex: 1, // Para os botões dividirem o espaço
    marginHorizontal: 5,
  },
  iosButtonSeparator: {
    width: 10,
  }
});

export default CustomDateTimePicker;
