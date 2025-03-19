import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import { Text, Icon } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../utils/common';

const CustomDateTimePicker = ({ label, value, onChange, mode = 'date', visible, onClose, onConfirm }) => {
  const formatValue = () => {
    if (mode === 'date') {
      return tempDate.toLocaleDateString();
    }
    return tempDate.toLocaleTimeString();
  };
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    onChange?.(tempDate);
    onConfirm(tempDate);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => onConfirm(true)}
      >
        <Text style={styles.selectedText}>{formatValue()}</Text>
        <Icon
          name={mode === 'date' ? 'calendar-today' : 'access-time'}
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
              onChange={handleChange}
              themeVariant="dark"
              textColor="#212529"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const formatValue = () => {
  if (!value) return 'Selecione';
  
  if (mode === 'date') {
    return value.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
  
  return value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginBottom: 5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e1e8ee',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  selectedText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  confirmButtonText: {
    color: '#ffffff',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.primary + '80',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  confirmButtonText: {
    color: '#ffffff',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  confirmButtonText: {
    color: '#ffffff',
  },
});

export default CustomDateTimePicker;