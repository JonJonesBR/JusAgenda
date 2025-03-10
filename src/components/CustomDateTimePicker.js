import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import { COLORS } from '../utils/common';

/**
 * A custom date and time picker component for React Native.
 * Provides a modal interface for selecting date or time with a scrollable interface.
 *
 * @component
 * @example
 * // Date picker usage
 * <CustomDateTimePicker
 *   visible={isVisible}
 *   mode="date"
 *   value={new Date()}
 *   onClose={() => setIsVisible(false)}
 *   onConfirm={(date) => handleDateSelection(date)}
 * />
 *
 * // Time picker usage
 * <CustomDateTimePicker
 *   visible={isVisible}
 *   mode="time"
 *   value={new Date()}
 *   onClose={() => setIsVisible(false)}
 *   onConfirm={(time) => handleTimeSelection(time)}
 * />
 *
 * @typedef {Object} Props
 * @property {boolean} visible - Controls the visibility of the picker modal
 * @property {('date'|'time')} mode - Determines whether to show date or time picker
 * @property {Date} value - The initial date/time value
 * @property {() => void} onClose - Callback function when the picker is closed
 * @property {(date: Date) => void} onConfirm - Callback function when a date/time is confirmed
 */
const CustomDateTimePicker = ({
  visible,
  mode,
  value,
  onClose,
  onConfirm,
}) => {
  /**
   * State to track the currently selected date/time value
   * @type {[Date, React.Dispatch<React.SetStateAction<Date>>]}
   */
  const [tempDate, setTempDate] = React.useState(value);

  /**
   * Handles the confirmation action when user selects a date/time
   * Calls the onConfirm callback with the selected date and closes the modal
   */
  const handleConfirm = () => {
    onConfirm(tempDate);
    onClose();
  };

  /**
   * Renders the date picker UI with day, month and year selection
   * @returns {React.ReactElement} The date picker component
   */
  const renderDatePicker = () => {
    // Generate array of days (1-31)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    // Portuguese month abbreviations
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const currentYear = new Date().getFullYear();
    // Generate array of years (current year + 76 years ahead)
    const years = Array.from({ length: 77 }, (_, i) => currentYear + i);

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Dia</Text>
          <ScrollView style={styles.pickerScroll}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.pickerItem, tempDate.getDate() === day && styles.selectedItem]}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setDate(day);
                  setTempDate(newDate);
                }}
              >
                <Text style={[styles.pickerText, tempDate.getDate() === day && styles.selectedText]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Mês</Text>
          <ScrollView style={styles.pickerScroll}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[styles.pickerItem, tempDate.getMonth() === index && styles.selectedItem]}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(index);
                  setTempDate(newDate);
                }}
              >
                <Text style={[styles.pickerText, tempDate.getMonth() === index && styles.selectedText]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Ano</Text>
          <ScrollView style={styles.pickerScroll}>
            {years.map(year => (
              <TouchableOpacity
                key={year}
                style={[styles.pickerItem, tempDate.getFullYear() === year && styles.selectedItem]}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(year);
                  setTempDate(newDate);
                }}
              >
                <Text style={[styles.pickerText, tempDate.getFullYear() === year && styles.selectedText]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  /**
   * Renders the time picker UI with hour and minute selection
   * @returns {React.ReactElement} The time picker component
   */
  const renderTimePicker = () => {
    // Generate array of hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    // Generate array of minutes (0-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Hora</Text>
          <ScrollView style={styles.pickerScroll}>
            {hours.map(hour => (
              <TouchableOpacity
                key={hour}
                style={[styles.pickerItem, tempDate.getHours() === hour && styles.selectedItem]}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setHours(hour);
                  setTempDate(newDate);
                }}
              >
                <Text style={[styles.pickerText, tempDate.getHours() === hour && styles.selectedText]}>
                  {hour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Minuto</Text>
          <ScrollView style={styles.pickerScroll}>
            {minutes.map(minute => (
              <TouchableOpacity
                key={minute}
                style={[styles.pickerItem, tempDate.getMinutes() === minute && styles.selectedItem]}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMinutes(minute);
                  setTempDate(newDate);
                }}
              >
                <Text style={[styles.pickerText, tempDate.getMinutes() === minute && styles.selectedText]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'date' ? 'Selecionar Data' : 'Selecionar Hora'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} />
            </TouchableOpacity>
          </View>

          {mode === 'date' ? renderDatePicker() : renderTimePicker()}

          <View style={styles.buttonContainer}>
            <Button
              title="Confirmar"
              onPress={handleConfirm}
              buttonStyle={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  selectedItem: {
    backgroundColor: COLORS.primary,
  },
  pickerText: {
    fontSize: 16,
  },
  selectedText: {
    color: 'white',
  },
  buttonContainer: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
});

export default CustomDateTimePicker;