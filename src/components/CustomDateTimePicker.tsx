import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

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
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (event.type === "set" && selectedDate) {
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
    marginBottom: 14,
    width: "100%",
  },
  label: {
    color: "#86939e",
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
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    elevation: 3,
    justifyContent: "center",
    minHeight: 55,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default CustomDateTimePicker;
