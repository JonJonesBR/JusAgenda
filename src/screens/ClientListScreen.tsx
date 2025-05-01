import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, Button, SearchBar, Icon, FAB } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Client } from './ClientWizardScreen';
import { SwipeListView } from 'react-native-swipe-list-view';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EnhancedRefreshControl from '../components/EnhancedRefreshControl';

// Definição do tipo de navegação
type ClientStackParamList = {
  ClientList: undefined;
  ClientWizard: {
    client?: Client;
    isEditMode?: boolean;
    readOnly?: boolean;
  };
};

type ClientScreenNavigationProp = NativeStackNavigationProp<ClientStackParamList>;

// Dados de exemplo para testes
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    nome: 'João da Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    tipo: 'pessoaFisica',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    },
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 98765-1234',
    cpf: '987.654.321-00',
    tipo: 'pessoaFisica',
    endereco: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
    },
  },
  {
    id: '3',
    nome: 'Empresa ABC Ltda',
    email: 'contato@empresaabc.com',
    telefone: '(11) 3456-7890',
    cnpj: '12.345.678/0001-90',
    tipo: 'pessoaJuridica',
    endereco: {
      logradouro: 'Av. Brigadeiro Faria Lima',
      numero: '3900',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04538-132',
    },
  },
];

/**
 * Tela de listagem de clientes
 */
const ClientListScreen: React.FC = () => {
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Carregar clientes
  const loadClients = useCallback(async () => {
    try {
      // Aqui você implementaria a lógica para buscar os clientes
      // do banco de dados ou da API
      
      // Por enquanto, usamos dados de exemplo
      setTimeout(() => {
        setClients(MOCK_CLIENTS);
        setFilteredClients(MOCK_CLIENTS);
        setLoading(false);
        setRefreshing(false);
        setLastRefreshed(new Date());
      }, 1000); // Simulação de carregamento por 1 segundo
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar clientes',
        text2: 'Tente novamente mais tarde',
      });
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  // Função para filtrar clientes
  const updateSearch = (searchText: string) => {
    setSearch(searchText);
    
    if (searchText.trim() === '') {
      setFilteredClients(clients);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = clients.filter((client) => {
      return (
        client.nome.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.telefone && client.telefone.includes(searchText)) ||
        (client.cpf && client.cpf.includes(searchText)) ||
        (client.cnpj && client.cnpj.includes(searchText))
      );
    });
    
    setFilteredClients(filtered);
  };

  // Função para atualizar a lista por pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    loadClients();
  };

  // Função para navegar para o wizard de criação de cliente
  const handleAddClient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    navigation.navigate('ClientWizard', {});
  };

  // Função para editar um cliente
  const handleEditClient = (client: Client) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('ClientWizard', { client, isEditMode: true });
  };

  // Função para visualizar detalhes do cliente
  const handleViewClient = (client: Client) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('ClientWizard', { client, isEditMode: true, readOnly: true });
  };

  // Função para excluir um cliente
  const handleDeleteClient = (clientId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    
    // Aqui você implementaria a lógica para excluir o cliente
    // do banco de dados ou da API
    
    // Por enquanto, apenas atualizamos o estado local
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    setFilteredClients(updatedClients);
    
    Toast.show({
      type: 'success',
      text1: 'Cliente excluído',
      text2: 'O cliente foi excluído com sucesso',
    });
  };

  // Renderizar item da lista de clientes
  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleViewClient(item)}
      activeOpacity={0.7}
      accessibilityLabel={`Cliente ${item.nome}`}
    >
      <View style={styles.clientInfo}>
        <View style={styles.nameContainer}>
          <Text style={[styles.clientName, { color: theme.colors.text }]}>
            {item.nome}
          </Text>
          <View 
            style={[
              styles.clientType, 
              { 
                backgroundColor: item.tipo === 'pessoaFisica' 
                  ? theme.colors.primary 
                  : theme.colors.secondary 
              }
            ]}
          >
            <Text style={styles.clientTypeText}>
              {item.tipo === 'pessoaFisica' ? 'PF' : 'PJ'}
            </Text>
          </View>
        </View>
        
        {item.email && (
          <View style={styles.infoRow}>
            <Icon
              name="email"
              type="material"
              size={14}
              color={theme.colors.grey3}
              style={styles.infoIcon}
            />
            <Text style={[styles.clientDetail, { color: theme.colors.grey2 }]}>
              {item.email}
            </Text>
          </View>
        )}
        
        {item.telefone && (
          <View style={styles.infoRow}>
            <Icon
              name="phone"
              type="material"
              size={14}
              color={theme.colors.grey3}
              style={styles.infoIcon}
            />
            <Text style={[styles.clientDetail, { color: theme.colors.grey2 }]}>
              {item.telefone}
            </Text>
          </View>
        )}
        
        {(item.cpf || item.cnpj) && (
          <View style={styles.infoRow}>
            <Icon
              name={item.tipo === 'pessoaFisica' ? 'badge' : 'business'}
              type="material"
              size={14}
              color={theme.colors.grey3}
              style={styles.infoIcon}
            />
            <Text style={[styles.clientDetail, { color: theme.colors.grey2 }]}>
              {item.tipo === 'pessoaFisica' ? item.cpf : item.cnpj}
            </Text>
          </View>
        )}
        
        {item.endereco && (
          <View style={styles.infoRow}>
            <Icon
              name="location-on"
              type="material"
              size={14}
              color={theme.colors.grey3}
              style={styles.infoIcon}
            />
            <Text style={[styles.clientDetail, { color: theme.colors.grey2 }]} numberOfLines={1}>
              {`${item.endereco.cidade}/${item.endereco.estado}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Renderizar os botões de ação quando o item é deslizado
  const renderHiddenItem = ({ item }: { item: Client }) => (
    <View style={[styles.rowBack, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft, { backgroundColor: theme.colors.warning }]}
        onPress={() => handleEditClient(item)}
        accessibilityLabel={`Editar cliente ${item.nome}`}
      >
        <Icon name="edit" type="material" color="#fff" size={20} />
        <Text style={styles.backTextWhite}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight, { backgroundColor: theme.colors.error }]}
        onPress={() => handleDeleteClient(item.id)}
        accessibilityLabel={`Excluir cliente ${item.nome}`}
      >
        <Icon name="delete" type="material" color="#fff" size={20} />
        <Text style={styles.backTextWhite}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderização condicional para o estado de carregamento
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={theme.dark ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.background} 
        />
        <SearchBar
          placeholder="Buscar cliente..."
          onChangeText={updateSearch}
          value={search}
          containerStyle={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}
          inputContainerStyle={{ backgroundColor: theme.colors.surface }}
          inputStyle={{ color: theme.colors.text }}
          searchIcon={{ color: theme.colors.grey3 }}
          clearIcon={{ color: theme.colors.grey3 }}
          disabled
        />
        <LoadingSkeleton 
          type="event-list" 
          itemCount={6} 
          style={{ paddingHorizontal: 16 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      <SearchBar
        placeholder="Buscar cliente..."
        onChangeText={updateSearch}
        value={search}
        containerStyle={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}
        inputContainerStyle={{ backgroundColor: theme.colors.surface }}
        inputStyle={{ color: theme.colors.text }}
        searchIcon={{ color: theme.colors.grey3 }}
        clearIcon={{ color: theme.colors.grey3 }}
      />
      
      {filteredClients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon 
            name="people" 
            type="material" 
            size={60} 
            color={theme.colors.grey5} 
          />
          <Text style={[styles.emptyText, { color: theme.colors.grey3 }]}>
            {search.trim() !== '' 
              ? 'Nenhum cliente encontrado'
              : 'Nenhum cliente cadastrado'}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.grey3 }]}>
            {search.trim() !== '' 
              ? 'Tente uma busca diferente'
              : 'Clique no botão "+" para adicionar um cliente'}
          </Text>
          {search.trim() !== '' && (
            <Button
              title="Limpar busca"
              onPress={() => setSearch('')}
              type="clear"
              buttonStyle={styles.clearButton}
              titleStyle={{ color: theme.colors.primary }}
            />
          )}
        </View>
      ) : (
        <SwipeListView
          data={filteredClients}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          keyExtractor={(item) => item.id}
          rightOpenValue={-150}
          disableRightSwipe
          refreshControl={
            <EnhancedRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              lastRefreshed={lastRefreshed}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              showLastUpdated={true}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <FAB
        icon={{ name: 'add', color: 'white' }}
        color={theme.colors.primary}
        placement="right"
        onPress={handleAddClient}
        style={styles.fab}
        accessibilityLabel="Adicionar novo cliente"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Espaço adicional no final da lista para não obstruir o FAB
  },
  itemContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clientInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  clientType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  clientTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 4,
  },
  clientDetail: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 16,
  },
  fab: {
    marginBottom: 16,
    marginRight: 16,
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    right: 75,
  },
  backRightBtnRight: {
    right: 0,
  },
  backTextWhite: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ClientListScreen;
