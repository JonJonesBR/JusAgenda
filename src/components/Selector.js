import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, Icon } from '@rneui/themed';
import { COLORS } from '../utils/common';

const Selector = ({ label, selectedValue, options, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedText}>
          {selectedValue ? options[selectedValue] : 'Selecione uma opção'}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={COLORS.primary} />
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
                <Icon name="close" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {Object.entries(options).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.option, selectedValue === key && styles.selectedOption]}
                  onPress={() => handleSelect(key)}
                >
                  <Text style={[styles.optionText, selectedValue === key && styles.selectedOptionText]}>
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
    color: '#242424',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ee',
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: '#242424',
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default Selector;