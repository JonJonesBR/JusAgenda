import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDateTimePicker = ({ label, value, onChange, mode }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => {}}
        activeOpacity={0.7}
      >
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            if (event.type === 'set') {
              onChange(selectedDate);
            }
          }}
          style={styles.picker}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#86939e',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    minHeight: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    width: '100%',
    height: 40,
    transform: [{ scale: 1.2 }],
  },
});

export default CustomDateTimePicker;