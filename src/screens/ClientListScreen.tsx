import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Button, SearchBar, Icon, FAB } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { useTheme, Theme } from '../contexts/ThemeContext';
import Toast from 'react-native-toast-message';
import { Client } from './ClientWizardScreen';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';
import LoadingSkeleton from '../components/LoadingSkeleton';
import * as Haptics from 'expo-haptics';

type ClientStackParamList = {
  ClientList: undefined;
  ClientWizard: {
    client?: Client;
    isEditMode?: boolean;
    readOnly?: boolean;
  };
};

type ClientScreenNavigationProp = NavigationProp<ClientStackParamList>;

const MOCK_CLIENTS: Client[] = [
    { id: '1', nome: 'João da Silva', email: 'joao.silva@email.com', telefone: '(11) 98765-4321', cpf: '123.456.789-00', tipo: 'pessoaFisica', endereco: { logradouro: 'Rua das Flores', numero: '123', bairro: 'Jardim Primavera', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' } },
    { id: '2', nome: 'Maria Oliveira', email: 'maria.oliveira@email.com', telefone: '(11) 98765-1234', cpf: '987.654.321-00', tipo: 'pessoaFisica', endereco: { logradouro: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-100' } },
    { id: '3', nome: 'Empresa ABC Ltda', email: 'contato@empresaabc.com', telefone: '(11) 3456-7890', cnpj: '12.345.678/0001-90', tipo: 'pessoaJuridica', endereco: { logradouro: 'Av. Brigadeiro Faria Lima', numero: '3900', bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP', cep: '04538-132' } },
];

const componentColors = {
  white: '#FFFFFF',
  shadowBlack: '#000',
  defaultPlaceholderText: '#A9A9A9',
  defaultSurface: '#FFFFFF',
};

const ClientListScreen: React.FC = () => {
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const { theme } = useTheme(); // isDarkMode removed
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setClients(MOCK_CLIENTS);
      setFilteredClients(MOCK_CLIENTS);
      setSearch('');
      Toast.show({
          type: 'success',
          text1: isRefresh ? 'Lista atualizada!' : 'Clientes carregados',
          visibilityTime: 1500,
      });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar clientes',
        text2: 'Não foi possível buscar os dados.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (clients.length === 0) {
          loadClients();
      }
    }, [loadClients, clients.length])
  );

  const updateSearch = (searchText: string) => {
    setSearch(searchText);
    if (searchText.trim() === '') {
      setFilteredClients(clients);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = clients.filter(client =>
        client.nome.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.telefone && client.telefone.includes(searchText)) ||
        (client.cpf && client.cpf.replace(/[^\d]/g, '').includes(searchText.replace(/[^\d]/g, ''))) ||
        (client.cnpj && client.cnpj.replace(/[^\d]/g, '').includes(searchText.replace(/[^\d]/g, '')))
      );
      setFilteredClients(filtered);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    loadClients(true);
  }, [loadClients]);

  const handleAddClient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    navigation.navigate('ClientWizard', { isEditMode: false });
  };

  const handleEditClient = (client: Client, rowMap: RowMap<Client>, rowKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    rowMap[rowKey]?.closeRow();
    navigation.navigate('ClientWizard', { client, isEditMode: true });
  };

  const handleViewClient = (client: Client) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigation.navigate('ClientWizard', { client, readOnly: true });
  };

  const handleDeleteClient = (client: Client, rowMap: RowMap<Client>, rowKey: string) => {
    rowMap[rowKey]?.closeRow();
    Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir o cliente "${client.nome}"? Esta ação não pode ser desfeita.`,
        [
            { text: "Cancelar", style: "cancel", onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}) },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const updatedClients = clients.filter(c => c.id !== client.id);
                    setClients(updatedClients);
                    setFilteredClients(prevFiltered => prevFiltered.filter(c => c.id !== client.id));
                    Toast.show({
                        type: 'success',
                        text1: 'Cliente excluído',
                    });
                },
            },
        ],
        { cancelable: true }
    );
  };

  const InfoDetailRow: React.FC<{icon: string; text?: string | null; theme: Theme; numberOfLines?: number}> =
    ({icon, text, theme: currentTheme, numberOfLines}) => text ? (
        <View style={styles.infoRow}>
            <Icon name={icon} type="material-community" size={15} color={currentTheme.colors.textSecondary} style={styles.infoIcon}/>
            <Text style={[styles.clientDetail, {color: currentTheme.colors.textSecondary}]} numberOfLines={numberOfLines || 1} ellipsizeMode="tail">{text}</Text>
        </View>
    ) : null;

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.colors.background || componentColors.defaultSurface, shadowColor: componentColors.shadowBlack }]}
      onPress={() => handleViewClient(item)}
      activeOpacity={0.7}
      accessibilityLabel={`Cliente ${item.nome}`}
      accessibilityHint="Toque para ver detalhes"
    >
        <View style={styles.clientInfo}>
            <View style={styles.nameContainer}>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>{item.nome}</Text>
                <View style={[ styles.clientTypeBadge, { backgroundColor: item.tipo === 'pessoaFisica' ? theme.colors.primary : theme.colors.secondary }]}>
                    <Text style={styles.clientTypeText}>{item.tipo === 'pessoaFisica' ? 'PF' : 'PJ'}</Text>
                </View>
            </View>
             {(item.email || item.telefone || item.cpf || item.cnpj || item.endereco) && (
                <View style={styles.detailsContainer}>
                    {item.email && <InfoDetailRow icon="email-outline" text={item.email} theme={theme} />}
                    {item.telefone && <InfoDetailRow icon="phone-outline" text={item.telefone} theme={theme} />}
                    {(item.cpf || item.cnpj) && <InfoDetailRow icon={item.tipo === 'pessoaFisica' ? 'account' : 'domain'} text={item.tipo === 'pessoaFisica' ? item.cpf : item.cnpj} theme={theme} />}
                    {item.endereco && <InfoDetailRow icon="map-marker-outline" text={`${item.endereco.cidade || 'Cidade Desconhecida'}/${item.endereco.estado || 'UF'}`} theme={theme} numberOfLines={1}/>}
                </View>
            )}
        </View>
    </TouchableOpacity>
  );

  const renderHiddenItem = (data: { item: Client }, rowMap: RowMap<Client>) => {
    const { item } = data;
    const rowKey = item.id;
    return (
        <View style={[styles.rowBack, { backgroundColor: theme.colors.background }]}>
            <View style={styles.backLeftPlaceholder} />
            <View style={styles.backRightActions}>
                <TouchableOpacity
                    style={[styles.backRightBtn, { backgroundColor: theme.colors.warning }]}
                    onPress={() => handleEditClient(item, rowMap, rowKey)}
                    accessibilityLabel={`Editar cliente ${item.nome}`}
                >
                    <Icon name="pencil-outline" type="material-community" color={componentColors.white} size={24} />
                    <Text style={styles.backTextWhite}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.backRightBtn, { backgroundColor: theme.colors.error }]}
                    onPress={() => handleDeleteClient(item, rowMap, rowKey)}
                    accessibilityLabel={`Excluir cliente ${item.nome}`}
                >
                    <Icon name="delete-outline" type="material-community" color={componentColors.white} size={24} />
                    <Text style={styles.backTextWhite}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={'dark-content'} // Defaulting barStyle as isDarkMode is not directly available
        backgroundColor={theme.colors.background}
      />
      <SearchBar
        placeholder="Buscar por nome, email, doc..."
        onChangeText={updateSearch}
        value={search}
        containerStyle={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}
        inputContainerStyle={[styles.searchBarInputContainer, { backgroundColor: theme.colors.background || componentColors.defaultSurface }]}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholderText}
        searchIcon={{ color: theme.colors.textSecondary }}
        clearIcon={{ color: theme.colors.textSecondary }}
        round
      />
      {loading ? (
        <LoadingSkeleton
          width="100%" // Provide a default width
          height={100}  // Provide a default height for a list item skeleton
          style={styles.loadingSkeletonStyle}
        />
      ) : filteredClients.length === 0 ? (
        <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    tintColor={theme.colors.primary}
                />
            }
        >
          <Icon name="account-search-outline" type="material-community" size={64} color={theme.colors.textSecondary}/>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {search.trim() !== '' ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            {search.trim() !== '' ? 'Verifique os termos da busca ou tente novamente.' : 'Toque no botão + para adicionar seu primeiro cliente.'}
          </Text>
          {search.trim() !== '' && (
            <Button title="Limpar Busca" onPress={() => updateSearch('')} type="clear" titleStyle={{ color: theme.colors.primary }} />
          )}
        </ScrollView>
      ) : (
        <SwipeListView
          data={filteredClients}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          rightOpenValue={-160}
          disableRightSwipe
          closeOnRowPress={true}
          closeOnScroll={true}
          closeOnRowBeginSwipe={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          style={styles.listStyle}
        />
      )}
      <FAB
        icon={{ name: 'add', color: componentColors.white }}
        color={theme.colors.primary}
        placement="right"
        onPress={handleAddClient}
        style={styles.fabStyle}
        accessibilityLabel="Adicionar novo cliente"
        visible={!loading}
        size="large"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backLeftPlaceholder: {
    flex: 1,
  },
  backRightActions: {
    flexDirection: 'row',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 80,
  },
  backTextWhite: {
    color: componentColors.white,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  clientDetail: {
    flex: 1,
    fontSize: 14,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },
  clientTypeBadge: {
    borderRadius: 6,
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  clientTypeText: {
    color: componentColors.white,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
  },
  detailsContainer: {
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  emptySubtext: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  fabStyle: {},
  infoIcon: {
    marginRight: 6,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemContainer: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.22,
  },
  listContent: {
    paddingBottom: 90,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listStyle: {
    flex: 1,
  },
  loadingSkeletonStyle: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  nameContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowBack: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    overflow: 'hidden',
  },
  searchBarContainer: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBarInputContainer: {
    borderRadius: 20,
    height: 40,
  },
});

export default ClientListScreen;
