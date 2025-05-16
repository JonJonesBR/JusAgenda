import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native"; // Added TouchableOpacity back
import { Text } from "@rneui/themed";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { formatDate } from "../utils/dateUtils"; // Import formatDate

interface CustomDateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode: "date" | "time" | "datetime";
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios"); // Keep picker open on iOS after selection
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {/* Display the selected date/time */}
      <View style={styles.pickerContainer}>
        <Text>{mode === 'date' ? formatDate(value, 'DD/MM/YYYY') : formatDate(value, 'HH:mm')}</Text>
      </View>
      {/* Render the DateTimePicker directly */}
      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display="spinner"
          onChange={handleDateChange}
          style={styles.picker}
        />
      )}
      {/* Add a button or touchable area to show the picker */}
      {!showPicker && (
        <TouchableOpacity onPress={showDatepicker} style={styles.showPickerButton}>
           <Text style={styles.showPickerButtonText}>Selecionar {mode === 'date' ? 'Data' : 'Hora'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const componentColors = {
  labelColor: "#86939e",
  pickerBackground: "#f5f5f5",
  shadowBlack: "#000", // For shadowColor, can be moved to theme/constants later
};

const colors = {
  primary: '#007bff', // Example primary color
  white: '#fff', // Example white color
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: "100%",
  },
  label: {
    color: componentColors.labelColor,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  picker: {
    height: 40,
    transform: [{ scale: 1.2 }],
    width: "100%",
  },
  pickerContainer: {
    alignItems: "center",
    backgroundColor: componentColors.pickerBackground,
    borderRadius: 12,
    elevation: 3,
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 55,
    padding: 10,
    shadowColor: componentColors.shadowBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  showPickerButton: {
    alignItems: 'center',
    backgroundColor: colors.primary, // Use color constant
    borderRadius: 5,
    padding: 10,
  },
  showPickerButtonText: {
    color: colors.white, // Use color constant
    fontSize: 16,
  }
});

export default CustomDateTimePicker;
