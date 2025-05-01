import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Input, Text, Button, Icon, ListItem } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';
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
  isEditMode?: boolean;
}

/**
 * Terceiro passo do wizard - Gestão de contatos relacionados ao evento
 */
const ContactsStep: React.FC<ContactsStepProps> = ({
  data,
  onUpdate,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(data.contatos || []);

  // Adicionar ou atualizar um contato
  const handleAddContact = () => {
    if (!newContact.nome) return;

    if (editing) {
      // Atualizar contato existente
      const updatedContacts = contacts.map(contact => 
        contact.id === editing ? { ...newContact, id: editing } : contact
      );
      setContacts(updatedContacts);
      onUpdate({ contatos: updatedContacts });
      setEditing(null);
    } else {
      // Adicionar novo contato
      const contact = {
        ...newContact,
        id: Date.now().toString(),
      };
      const updatedContacts = [...contacts, contact];
      setContacts(updatedContacts);
      onUpdate({ contatos: updatedContacts });
    }
    // Limpar formulário
    setNewContact({});
  };

  // Editar um contato existente
  const handleEditContact = (contact: Contact) => {
    setNewContact(contact);
    setEditing(contact.id);
  };

  // Remover um contato
  const handleRemoveContact = (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    onUpdate({ contatos: updatedContacts });
    
    // Se estiver editando o contato que foi removido, cancelar a edição
    if (editing === id) {
      setEditing(null);
      setNewContact({});
    }
  };

  // Renderizar um item de contato
  const renderContactItem = ({ item }: { item: Contact }) => (
    <ListItem
      containerStyle={[
        styles.contactItem, 
        { 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.grey5 || '#e0e0e0',
        }
      ]}
      bottomDivider
    >
      <Icon
        name="person"
        type="material"
        color={theme.colors.primary}
      />
      <ListItem.Content>
        <ListItem.Title style={{ color: theme.colors.text }}>{item.nome}</ListItem.Title>
        {item.telefone && (
          <ListItem.Subtitle style={{ color: theme.colors.grey1 || '#999' }}>
            Tel: {item.telefone}
          </ListItem.Subtitle>
        )}
        {item.email && (
          <ListItem.Subtitle style={{ color: theme.colors.grey1 || '#999' }}>
            Email: {item.email}
          </ListItem.Subtitle>
        )}
      </ListItem.Content>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => handleEditContact(item)}
          style={styles.actionButton}
        >
          <Icon
            name="edit"
            type="material"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemoveContact(item.id)}
          style={styles.actionButton}
        >
          <Icon
            name="delete"
            type="material"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      </View>
    </ListItem>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contatos Relacionados
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.grey1 || '#999' }]}>
        Adicione contatos relacionados a este evento (clientes, testemunhas, etc).
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {editing ? 'Editar Contato' : 'Adicionar Contato'}
        </Text>
        
        <Input
          placeholder="Nome do contato"
          value={newContact.nome || ''}
          onChangeText={(value) => setNewContact({ ...newContact, nome: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          accessibilityLabel="Nome do contato"
          returnKeyType="next"
        />
        
        <Input
          placeholder="Telefone"
          value={newContact.telefone || ''}
          onChangeText={(value) => setNewContact({ ...newContact, telefone: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="phone-pad"
          accessibilityLabel="Telefone do contato"
          returnKeyType="next"
        />
        
        <Input
          placeholder="Email"
          value={newContact.email || ''}
          onChangeText={(value) => setNewContact({ ...newContact, email: value })}
          containerStyle={styles.inputContainer}
          inputStyle={{ color: theme.colors.text }}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email do contato"
          returnKeyType="done"
        />
        
        <View style={styles.buttonContainer}>
          {editing && (
            <Button
              title="Cancelar"
              type="outline"
              buttonStyle={[styles.actionBtn, { borderColor: theme.colors.grey5 || '#e0e0e0' }]}
              titleStyle={{ color: theme.colors.text }}
              onPress={() => {
                setEditing(null);
                setNewContact({});
              }}
              accessibilityLabel="Cancelar edição do contato"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
          )}
          
          <Button
            title={editing ? "Atualizar" : "Adicionar"}
            buttonStyle={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            titleStyle={{ color: 'white' }}
            onPress={handleAddContact}
            disabled={!newContact.nome}
            accessibilityLabel={editing ? "Atualizar contato" : "Adicionar contato"}
            containerStyle={{ flex: 1, marginLeft: editing ? 8 : 0 }}
          />
        </View>
      </View>

      <View style={styles.contactsList}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Contatos ({contacts.length})
        </Text>
        
        {contacts.length > 0 ? (
          <FlatList
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.grey1 || '#999' }]}>
            Nenhum contato adicionado
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  contactsList: {
    marginTop: 16,
  },
  contactItem: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default ContactsStep;
