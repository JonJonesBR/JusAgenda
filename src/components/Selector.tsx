import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Text, Icon } from "@rneui/themed";
import { COLORS } from "../utils/common";
import { useTheme } from "../contexts/ThemeContext";

interface SelectorProps {
  label: string;
  selectedValue: string | null;
  options: Record<string, string>;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const Selector: React.FC<SelectorProps> = ({
  label,
  selectedValue,
  options,
  onSelect,
  placeholder = "Selecione uma opção",
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme, isDarkMode } = useTheme();

  const handleSelect = (value: string) => {
    onSelect(value);
    setModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    modalContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      flex: 1,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
    },
    modalHeader: {
      alignItems: "center",
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 15,
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    option: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      padding: 15,
    },
    optionText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    placeholderText: {
      color: theme.colors.textSecondary,
      fontStyle: "italic",
    },
    required: {
      color: theme.colors.error || "red",
      fontWeight: "bold",
    },
    selectedOption: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    selectedText: {
      color: selectedValue ? theme.colors.text : theme.colors.textSecondary,
      fontSize: 16,
    },
    selector: {
      alignItems: "center",
      backgroundColor: isDarkMode ? theme.colors.surface : "#f9f9f9",
      borderColor: theme.colors.border,
      borderRadius: 5,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectedText,
            !selectedValue && styles.placeholderText,
          ]}
        >
          {selectedValue ? options[selectedValue] : placeholder}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {Object.entries(options).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.option,
                    selectedValue === key && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === key && styles.selectedOptionText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Selector;
