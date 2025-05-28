// src/components/EventWizard/ContactsStep.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
// import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'; // Descomente se for usar
import { FlatList } from 'react-native'; // Usando FlatList normal por agora
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

import { Input, Button, InputDialog } from '../ui'; // Assumindo InputDialog para adicionar/editar
import { EventWizardFormData } from './index';
import { Theme } from '../../contexts/ThemeContext';
import { EventContact } from '../../types/event';
import { Toast } from '../ui/Toast';

interface ContactsStepProps {
  formData: EventWizardFormData;
  updateField: (field: keyof EventWizardFormData, value: any) => void;
  errors: Partial<Record<keyof EventWizardFormData | `contacts.${number}.${keyof EventContact}`, string>>; // Erros podem ser para o array ou campos específicos
  isReadOnly: boolean;
  theme: Theme;
}

const emptyContact: EventContact = { id: '', name: '', phone: '', email: '', role: '' };

const ContactsStep: React.FC<ContactsStepProps> = ({
  formData,
  updateField,
  errors,
  isReadOnly,
  theme,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState<EventContact | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Campos do formulário do modal de contacto
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof EventContact, string>>>({});


  const contacts = formData.contacts || [];

  const handleAddNewContact = () => {
    setCurrentContact(emptyContact); // Novo contacto
    setEditingIndex(null);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactRole('');
    setContactErrors({});
    setIsModalVisible(true);
  };

  const handleEditContact = (contact: EventContact, index: number) => {
    if (isReadOnly) return;
    setCurrentContact(contact);
    setEditingIndex(index);
    setContactName(contact.name);
    setContactPhone(contact.phone || '');
    setContactEmail(contact.email || '');
    setContactRole(contact.role || '');
    setContactErrors({});
    setIsModalVisible(true);
  };

  const handleDeleteContact = (index: number) => {
    if (isReadOnly) return;
    Alert.alert(
      "Remover Contacto",
      `Tem a certeza de que deseja remover "${contacts[index].name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            const updatedContacts = contacts.filter((_, i) => i !== index);
            updateField('contacts', updatedContacts);
            Toast.show({type: 'info', text1: 'Contacto Removido'});
          },
        },
      ]
    );
  };

  const validateContactForm = (): boolean => {
    const errors: Partial<Record<keyof EventContact, string>> = {};
    if (!contactName.trim()) {
      errors.name = 'O nome é obrigatório.';
    }
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.email = 'Email inválido.';
    }
    // Adicionar mais validações se necessário (ex: telefone)
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSaveContact = () => {
    if (!validateContactForm()) {
        Toast.show({type: 'error', text1: 'Campos Inválidos', text2: 'Por favor, corrija os campos do contacto.'});
        return;
    }

    const newContactData: EventContact = {
      id: currentContact?.id || uuidv4(), // Mantém ID se a editar, ou gera novo
      name: contactName.trim(),
      phone: contactPhone.trim() || undefined,
      email: contactEmail.trim() || undefined,
      role: contactRole.trim() || undefined,
    };

    let updatedContacts: EventContact[];
    if (editingIndex !== null) {
      // Editar contacto existente
      updatedContacts = contacts.map((contact, index) =>
        index === editingIndex ? newContactData : contact
      );
    } else {
      // Adicionar novo contacto
      updatedContacts = [...contacts, newContactData];
    }
    updateField('contacts', updatedContacts);
    setIsModalVisible(false);
    setCurrentContact(null);
    setEditingIndex(null);
    Toast.show({type: 'success', text1: editingIndex !== null ? 'Contacto Atualizado' : 'Contacto Adicionado'});
  };


  // Se usar DraggableFlatList:
  // const renderItemDraggable = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<EventContact>) => {
  //   const index = getIndex(); // Necessário para handleEditContact e handleDeleteContact
  //   // ... seu JSX para o item
  // }, [isReadOnly, theme.colors]);

  const renderContactItem = ({ item, index }: { item: EventContact; index: number }) => (
    <View style={[styles.contactItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.contactDetails}>
        <Text style={[styles.contactName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{item.name}</Text>
        {item.role && <Text style={[styles.contactInfo, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>Papel: {item.role}</Text>}
        {item.phone && <Text style={[styles.contactInfo, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>Telefone: {item.phone}</Text>}
        {item.email && <Text style={[styles.contactInfo, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>Email: {item.email}</Text>}
      </View>
      {!isReadOnly && (
        <View style={styles.contactActions}>
          <TouchableOpacity onPress={() => handleEditContact(item, index)} style={styles.iconButton}>
            <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteContact(index)} style={styles.iconButton}>
            <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
          </TouchableOpacity>
          {/* Se usar DraggableFlatList, o ícone de arrastar pode vir aqui */}
          {/* <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.iconButton}>
            <MaterialCommunityIcons name="drag-horizontal-variant" size={24} color={theme.colors.placeholder} />
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Input
        label="Cliente Principal (Nome)"
        placeholder="Nome do cliente associado ao evento"
        value={formData.clienteNome || ''}
        onChangeText={(text) => updateField('clienteNome', text)}
        error={errors.clienteNome} // Assumindo que pode haver erro para este campo
        editable={!isReadOnly}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />
      {/* Poderia adicionar um Input para clienteId se for selecionável de uma lista */}

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Contactos Adicionais
        </Text>
        {!isReadOnly && (
          <Button
            title="Adicionar Contacto"
            onPress={handleAddNewContact}
            type="outline"
            size="sm"
            icon="plus"
          />
        )}
      </View>

      {/* <DraggableFlatList
        data={contacts}
        renderItem={renderItemDraggable} // ou renderContactItem se não for draggable
        keyExtractor={(item) => item.id}
        onDragEnd={({ data: newOrder }) => updateField('contacts', newOrder)}
        ListEmptyComponent={
          <Text style={[styles.emptyListText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
            Nenhum contacto adicional.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      /> */}
       <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyComponentContainer}>
            <Text style={[styles.emptyListText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
              Nenhum contacto adicional.
            </Text>
          </View>
        }
        contentContainerStyle={contacts.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />


      {/* Modal para Adicionar/Editar Contacto */}
      {/* Usando um modal simples com Inputs. Poderia ser InputDialog se adaptado para múltiplos campos. */}
      {isModalVisible && (
        <Modal
            transparent
            visible={isModalVisible}
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                        {editingIndex !== null ? 'Editar Contacto' : 'Adicionar Novo Contacto'}
                    </Text>
                    <Input
                        label="Nome *"
                        value={contactName}
                        onChangeText={setContactName}
                        error={contactErrors.name}
                        placeholder="Nome completo"
                        containerStyle={styles.modalInput}
                    />
                    <Input
                        label="Telefone"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        error={contactErrors.phone}
                        placeholder="(XX) XXXXX-XXXX"
                        keyboardType="phone-pad"
                        containerStyle={styles.modalInput}
                    />
                    <Input
                        label="Email"
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        error={contactErrors.email}
                        placeholder="email@exemplo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        containerStyle={styles.modalInput}
                    />
                    <Input
                        label="Papel/Função"
                        value={contactRole}
                        onChangeText={setContactRole}
                        error={contactErrors.role}
                        placeholder="Ex: Testemunha, Advogado da outra parte"
                        containerStyle={styles.modalInput}
                    />
                    <View style={styles.modalButtonContainer}>
                        <Button title="Cancelar" onPress={() => setIsModalVisible(false)} type="outline" buttonStyle={styles.modalButton} />
                        <Button title={editingIndex !== null ? "Salvar Alterações" : "Adicionar"} onPress={handleSaveContact} type="solid" buttonStyle={styles.modalButton} />
                    </View>
                </View>
            </View>
        </Modal>
      )}
      {errors.contacts && typeof errors.contacts === 'string' && (
          <Text style={[styles.errorTextBase, { color: theme.colors.error }]}>{errors.contacts}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Usar theme.spacing.sm ou md
  },
  listTitle: {
    fontSize: 18, // Usar theme.typography.fontSize.lg
    fontWeight: 'bold', // Usar theme.typography.fontFamily.bold
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12, // Usar theme.spacing.sm ou md
    borderBottomWidth: 1,
    marginBottom: 8, // Usar theme.spacing.sm
    borderRadius: 8, // Usar theme.radii.md
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16, // Usar theme.typography.fontSize.md
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20, // Usar theme.spacing.lg
    fontSize: 16, // Usar theme.typography.fontSize.md
  },
  emptyComponentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyListContainer: {
    flexGrow: 1, // Para centralizar o ListEmptyComponent
    justifyContent: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20, // Usar theme.spacing.lg
    // backgroundColor e borderRadius são dinâmicos
  },
  modalTitle: {
    fontSize: 20, // Usar theme.typography.fontSize.xl
    marginBottom: 16, // Usar theme.spacing.md
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 12, // Usar theme.spacing.sm
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Ou flex-end
    marginTop: 16, // Usar theme.spacing.md
  },
  modalButton: {
    flex: 1, // Para os botões dividirem o espaço
    marginHorizontal: 4, // Usar theme.spacing.xs
  },
   errorTextBase: {
    fontSize: 12,
    marginTop: 4,
    // A cor é definida dinamicamente
  },
});

export default ContactsStep;
