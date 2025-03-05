import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, Icon } from '@rneui/themed';

const Selector = ({ label, selectedValue, options, onSelect = () => {} }) => {
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
        <Text style={styles.selectorText}>
          {selectedValue ? (typeof options[selectedValue] === 'object' ? options[selectedValue].label : options[selectedValue]) : 'Selecione uma opção'}
        </Text>
        <Icon name="arrow-drop-down" size={24} color="#86939e" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
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
                  style={[styles.option, key === selectedValue && styles.selectedOption]}
                  onPress={() => handleSelect(key)}
                >
                  <Text style={[styles.optionText, key === selectedValue && styles.selectedOptionText]}>
                    {typeof value === 'object' ? value.label : value}
                  </Text>
                  {key === selectedValue && (
                    <Icon name="check" size={20} color="#6200ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
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
    marginBottom: 8,
    color: '#86939e',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e1e8ee',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  selectorText: {
    fontSize: 16,
    color: '#242424',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ee',
  },
  selectedOption: {
    backgroundColor: '#f6f8fa',
  },
  optionText: {
    fontSize: 16,
    color: '#242424',
  },
  selectedOptionText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default Selector;