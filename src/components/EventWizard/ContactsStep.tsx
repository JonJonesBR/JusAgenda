import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Input, Text, Button, Icon, ListItem } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Event } from '../../types/event';

interface Contact {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

interface ContactsStepProps {
  data: Partial<Event>;
  onUpdate: (data: Partial<Event>) => void;
}

const ContactsStep: React.FC<ContactsStepProps> = ({
  data,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(data.contatos || []);

  useEffect(() => {
    setContacts(data.contatos || []);
  }, [data.contatos]);

  const handleSaveContact = () => {
    if (!newContact.nome || newContact.nome.trim() === '') {
      Alert.alert("Nome Necessário", "Por favor, insira o nome do contato.");
      return;
    }

    let updatedContacts;
    if (editingContactId) {
      updatedContacts = contacts.map(contact =>
        contact.id === editingContactId ? { ...contact, ...newContact, id: editingContactId } : contact
      );
    } else {
      const contactToAdd: Contact = {
        id: newContact.id || Date.now().toString(),
        nome: newContact.nome,
        telefone: newContact.telefone,
        email: newContact.email,
      };
      updatedContacts = [...contacts, contactToAdd];
    }
    setContacts(updatedContacts);
    onUpdate({ ...data, contatos: updatedContacts });
    setNewContact({});
    setEditingContactId(null);
  };

  const handleEditContact = (contactToEdit: Contact) => {
    setNewContact({ ...contactToEdit });
    setEditingContactId(contactToEdit.id);
  };

  const handleRemoveContact = (idToRemove: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== idToRemove);
    setContacts(updatedContacts);
    onUpdate({ ...data, contatos: updatedContacts });

    if (editingContactId === idToRemove) {
      setEditingContactId(null);
      setNewContact({});
    }
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setNewContact({});
  };

  const renderContactItem = ({ item, drag, isActive }: RenderItemParams<Contact>) => (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={drag}
      disabled={isActive}
    >
      <ListItem
        containerStyle={[
          styles.contactItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border || '#e0e0e0',
          }
        ]}
        bottomDivider
      >
        <Icon
          name="person-outline"
          type="material"
          color={theme.colors.primary}
          size={28}
        />
        <ListItem.Content>
          <ListItem.Title style={[styles.contactName, { color: theme.colors.text }]}>{item.nome}</ListItem.Title>
          {item.telefone && (
            <ListItem.Subtitle style={[styles.contactDetail, { color: theme.colors.textSecondary || '#999' }]}>
              <Text>Tel: </Text>{item.telefone}
            </ListItem.Subtitle>
          )}
          {item.email && (
            <ListItem.Subtitle style={[styles.contactDetail, { color: theme.colors.textSecondary || '#999' }]}>
              <Text>Email: </Text>{item.email}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={() => handleEditContact(item)}
            style={styles.actionButton}
            accessibilityLabel={`Editar contato ${item.nome}`}
          >
            <Icon
              name="edit"
              type="material"
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemoveContact(item.id)}
            style={styles.actionButton}
            accessibilityLabel={`Remover contato ${item.nome}`}
          >
            <Icon
              name="delete-outline"
              type="material"
              size={22}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </ListItem>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contatos Relacionados
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary || '#999' }]}>
        Adicione contatos relacionados a este evento (clientes, testemunhas, etc).
      </Text>

      <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, styles.formTitle, { color: theme.colors.text }]}>
          {editingContactId ? 'Editar Contato' : 'Adicionar Novo Contato'}
        </Text>

        <Input
          placeholder="Nome do contato *"
          value={newContact.nome || ''}
          onChangeText={(value) => setNewContact({ ...newContact, nome: value })}
          containerStyle={styles.inputGroup}
          inputStyle={{ color: theme.colors.text }}
          accessibilityLabel="Nome do contato"
          returnKeyType="next"
        />

        <Input
          placeholder="Telefone"
          value={newContact.telefone || ''}
          onChangeText={(value) => setNewContact({ ...newContact, telefone: value })}
          containerStyle={styles.inputGroup}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="phone-pad"
          accessibilityLabel="Telefone do contato"
          returnKeyType="next"
        />

        <Input
          placeholder="Email"
          value={newContact.email || ''}
          onChangeText={(value) => setNewContact({ ...newContact, email: value })}
          containerStyle={styles.inputGroup}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email do contato"
          returnKeyType="done"
          onSubmitEditing={handleSaveContact}
        />

        <View style={styles.formActionsContainer}>
          {editingContactId && (
            <Button
              title="Cancelar"
              type="outline"
              buttonStyle={[styles.formButton, { borderColor: theme.colors.border || '#e0e0e0' }]}
              titleStyle={{ color: theme.colors.text }}
              onPress={handleCancelEdit}
              accessibilityLabel="Cancelar edição do contato"
              containerStyle={styles.cancelButtonContainer}
            />
          )}

          <Button
            title={editingContactId ? "Atualizar Contato" : "Adicionar Contato"}
            buttonStyle={[styles.formButton, { backgroundColor: theme.colors.primary }]}
            titleStyle={{ color: theme.colors.onPrimary }}
            onPress={handleSaveContact}
            disabled={!newContact.nome || newContact.nome.trim() === ''}
            accessibilityLabel={editingContactId ? "Atualizar contato" : "Adicionar contato"}
            containerStyle={[styles.saveButtonContainer, editingContactId && styles.saveButtonEditingContainer]}
            icon={editingContactId ? undefined : <Icon name="add" color={theme.colors.onPrimary} />}
          />
        </View>
      </View>

      <View style={styles.contactsListSection}>
        <Text style={[styles.label, styles.contactsListTitle, { color: theme.colors.text }]}>
          Contatos Adicionados ({contacts.length})
        </Text>

        {contacts.length > 0 ? (
          <DraggableFlatList<Contact>
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => { setContacts(data); onUpdate({ ...data, contatos: data }); console.log('New contacts order:', data); }}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyListContainer}>
            <Icon name="people-outline" type="material" size={48} color={theme.colors.textSecondary || '#999'} />
            <Text style={[styles.emptyListText, { color: theme.colors.textSecondary || '#999' }]}>
              Nenhum contato adicionado ainda.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: 8,
    padding: 8,
  },
  actionButtonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButtonContainer: {
    flex: 1,
    marginRight: 8,
  },
  contactDetail: {
  },
  contactItem: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactName: {
    fontWeight: 'bold',
  },
  contactsListSection: {
  },
  contactsListTitle: {
    marginBottom: 12,
    marginTop: 24,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  formActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  formButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  formCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  formTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    // marginBottom: 8,
  },
  saveButtonContainer: {
    flex: 1,
  },
  saveButtonEditingContainer: {
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 15,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  separator: {
    height: 10,
  },
});

export default ContactsStep;
