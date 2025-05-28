// src/screens/ClientListScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'; // Assumindo que está a usar esta biblioteca
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme, Theme } from '../contexts/ThemeContext';
// import { useClients } from '../contexts/ClientCrudContext'; // Descomente quando tiver o ClientCrudContext
import { Client as ClientType, PessoaFisica, PessoaJuridica } from '../types/client';
import { ClientsStackParamList } from '../navigation/stacks/ClientsStack'; // Ajuste para a sua Stack Param List
import { Header, Input, Button, Card, LoadingSkeleton } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES } from '../constants';

// Tipagem para a prop de navegação específica desta tela
type ClientListScreenNavigationProp = StackNavigationProp<ClientsStackParamList, typeof ROUTES.CLIENT_LIST>;

// Mock de dados de clientes (substitua pelo seu ClientCrudContext)
const MOCK_CLIENTS: ClientType[] = [
  { id: '1', tipo: 'pessoaFisica', nome: 'Ana Silva', cpf: '111.222.333-44', email: 'ana.silva@example.com', telefonePrincipal: '(11) 98888-7777', dataCadastro: '2023-01-15', ativo: true, enderecos: [{ cep: '01000-000', logradouro: 'Rua Exemplo', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP' }] },
  { id: '2', tipo: 'pessoaJuridica', nome: 'Empresa ABC Ltda.', cnpj: '12.345.678/0001-99', nomeFantasia: 'ABC Soluções', email: 'contato@abc.com', telefonePrincipal: '(21) 2345-6789', dataCadastro: '2022-11-20', ativo: true },
  { id: '3', tipo: 'pessoaFisica', nome: 'Carlos Pereira', cpf: '444.555.666-77', email: 'carlos.pereira@example.com', dataCadastro: '2023-05-10', ativo: false },
  { id: '4', tipo: 'pessoaJuridica', nome: 'Consultoria XYZ S/A', cnpj: '98.765.432/0001-11', email: 'suporte@xyzconsult.com', dataCadastro: '2024-01-02', ativo: true, nomeFantasia: 'XYZ Consult' },
];
// Fim do Mock

const ClientListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ClientListScreenNavigationProp>();

  // Substitua isto pelo seu ClientCrudContext
  // const { clients: allClients, isLoading: isLoadingClientsContext, deleteClientById } = useClients();
  const [allClients, setAllClients] = useState<ClientType[]>([]);
  const [isLoadingClientsContext, setIsLoadingClientsContext] = useState(true);
  const deleteClientById = async (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            setAllClients(prev => prev.filter(c => c.id !== id));
            resolve(true);
        }, 500);
    });
  };
  // Fim da substituição do Context

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading local para a tela

  const loadClients = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    // console.log('ClientListScreen: Carregando clientes...');
    // Lógica para carregar clientes (do contexto ou API)
    // await fetchClientsFromContextOrAPI();
    setTimeout(() => { // Simula carregamento
      setAllClients(MOCK_CLIENTS); // Usando mock por enquanto
      setIsLoadingClientsContext(false);
      setIsLoading(false);
      // console.log('ClientListScreen: Clientes carregados.');
    }, 1000);
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Recarrega os clientes quando a tela ganha foco, se necessário (ex: após adicionar/editar)
  useFocusEffect(
    useCallback(() => {
      // console.log('ClientListScreen: Tela focada.');
      // Se você não estiver a usar um contexto que se atualiza automaticamente,
      // pode querer recarregar os clientes aqui.
      // loadClients(true); // Passa true para não mostrar o skeleton principal novamente
      // Por agora, vamos assumir que a lista é atualizada pelo wizard ao voltar.
      // Se estiver a usar mocks, pode ser necessário forçar a atualização da lista filtrada.
       const lowercasedFilter = searchTerm.toLowerCase();
        const newFilteredClients = allClients.filter(client => {
            const nome = client.nome.toLowerCase();
            const doc = client.tipo === 'pessoaFisica' ? client.cpf : client.cnpj;
            const email = client.email?.toLowerCase() || '';
            const nomeFantasia = client.tipo === 'pessoaJuridica' ? client.nomeFantasia?.toLowerCase() || '' : '';

            return nome.includes(lowercasedFilter) ||
                   doc.includes(lowercasedFilter) ||
                   email.includes(lowercasedFilter) ||
                   nomeFantasia.includes(lowercasedFilter);
        });
        setFilteredClients(newFilteredClients);
    }, [allClients, searchTerm]) // Adicionado allClients e searchTerm como dependências
  );


  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    const lowercasedFilter = text.toLowerCase();
    if (!lowercasedFilter) {
      setFilteredClients(allClients);
    } else {
      const newFilteredClients = allClients.filter(client => {
        const nome = client.nome.toLowerCase();
        // CPF/CNPJ (simplificado, idealmente removeria formatação antes de comparar)
        const doc = client.tipo === 'pessoaFisica' ? client.cpf.replace(/[^\d]/g, '') : client.cnpj.replace(/[^\d]/g, '');
        const email = client.email?.toLowerCase() || '';
        const nomeFantasia = client.tipo === 'pessoaJuridica' ? client.nomeFantasia?.toLowerCase() || '' : '';

        return nome.includes(lowercasedFilter) ||
               doc.includes(lowercasedFilter.replace(/[^\d]/g, '')) ||
               email.includes(lowercasedFilter) ||
               nomeFantasia.includes(lowercasedFilter);
      });
      setFilteredClients(newFilteredClients);
    }
  }, [allClients]);

  useEffect(() => {
    // Inicializa filteredClients com allClients ou aplica o searchTerm inicial
    handleSearch(searchTerm);
  }, [allClients, searchTerm, handleSearch]);


  const navigateToClientWizard = (client?: ClientType, readOnly = false) => {
    navigation.navigate(ROUTES.CLIENT_WIZARD, {
      clientId: client?.id,
      // Passar o objeto cliente completo pode ser útil para edição/visualização sem refetch
      // clientData: client, // Descomente se ClientWizardScreen puder receber clientData
      isEditMode: !!client && !readOnly,
      readOnly,
    });
  };

  const confirmDeleteClient = (client: ClientType) => {
    if (!client || !client.id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Confirmar Exclusão',
      `Tem a certeza que deseja apagar o cliente "${client.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteClientById(client.id); // Use a função do seu contexto
            if (success) {
              Toast.show({ type: 'success', text1: 'Cliente Apagado', text2: `"${client.nome}" foi removido.` });
              // A lista deve atualizar-se automaticamente se estiver a usar um contexto,
              // ou pode precisar de chamar loadClients() ou filtrar localmente.
              // No mock, já removemos de `allClients` e o useEffect de `handleSearch` atualizará `filteredClients`.
            } else {
              Toast.show({ type: 'error', text1: 'Erro ao Apagar', text2: 'Não foi possível apagar o cliente.' });
            }
          },
        },
      ]
    );
  };

  const renderClientItem = ({ item }: { item: ClientType }) => {
    const docLabel = item.tipo === 'pessoaFisica' ? 'CPF' : 'CNPJ';
    const docValue = item.tipo === 'pessoaFisica' ? item.cpf : item.cnpj;
    const subName = item.tipo === 'pessoaJuridica' && item.nomeFantasia ? item.nomeFantasia : item.email;

    return (
      <Card
        style={[styles.clientCard, !item.ativo && styles.inactiveClientCard]}
        onPress={() => navigateToClientWizard(item, true)} // Abrir em modo visualização
        elevation="sm"
      >
        <View style={styles.cardHeader}>
            <Text style={[styles.clientName, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            {item.nome}
            </Text>
            {!item.ativo && (
                <View style={[styles.statusBadge, {backgroundColor: theme.colors.disabled}]}>
                    <Text style={[styles.statusBadgeText, {color: theme.colors.surface, fontFamily: theme.typography.fontFamily.bold}]}>INATIVO</Text>
                </View>
            )}
        </View>
        {subName && <Text style={[styles.clientSubtitle, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>{subName}</Text>}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name={item.tipo === 'pessoaFisica' ? "account-outline" : "domain"} size={16} color={theme.colors.primary} style={styles.iconStyle} />
          <Text style={[styles.clientInfo, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
            {docLabel}: {docValue}
          </Text>
        </View>
        {item.telefonePrincipal && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
            <Text style={[styles.clientInfo, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>{item.telefonePrincipal}</Text>
          </View>
        )}
      </Card>
    );
  };

  const renderHiddenItem = (data: { item: ClientType }, rowMap: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft, { backgroundColor: theme.colors.info }]}
        onPress={() => {
          navigateToClientWizard(data.item, false); // Abrir em modo edição
          if (rowMap[data.item.id]) {
            rowMap[data.item.id].closeRow();
          }
        }}
      >
        <MaterialCommunityIcons name="pencil-outline" size={24} color={theme.colors.white || '#fff'} />
        <Text style={[styles.backTextWhite, { fontFamily: theme.typography.fontFamily.regular }]}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight, { backgroundColor: theme.colors.error }]}
        onPress={() => {
            confirmDeleteClient(data.item);
            if (rowMap[data.item.id]) {
              rowMap[data.item.id].closeRow();
            }
        }}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.white || '#fff'} />
        <Text style={[styles.backTextWhite, { fontFamily: theme.typography.fontFamily.regular }]}>Apagar</Text>
      </TouchableOpacity>
    </View>
  );


  if (isLoading && !isLoadingClientsContext) { // Mostra skeleton apenas no carregamento inicial da tela
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Header title="Clientes" />
        <View style={{padding: theme.spacing.md}}>
            <Input placeholder="Buscar cliente..." disabled containerStyle={{marginBottom: theme.spacing.md}}/>
            <LoadingSkeleton count={5} rowHeight={100} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Clientes"
        rightComponent={
          <TouchableOpacity onPress={() => navigateToClientWizard()} style={{ paddingHorizontal: theme.spacing.sm }}>
            <MaterialCommunityIcons name="plus-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      <Input
        placeholder="Buscar por nome, documento, email..."
        value={searchTerm}
        onChangeText={handleSearch}
        containerStyle={{ marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs }}
        leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={theme.colors.placeholder}/>}
      />

      {isLoadingClientsContext && !allClients.length ? ( // Mostra loading do contexto se a lista estiver vazia
         <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.messageText, {color: theme.colors.text}]}>A carregar clientes...</Text>
         </View>
      ) : (
        <SwipeListView<ClientType> // Tipando SwipeListView
            data={filteredClients}
            renderItem={renderClientItem}
            renderHiddenItem={renderHiddenItem}
            keyExtractor={(item) => item.id}
            leftOpenValue={0} // Não abre para a esquerda
            rightOpenValue={-150} // Largura dos botões de swipe
            previewRowKey={filteredClients.length > 0 ? filteredClients[0].id : undefined} // Mostra preview na primeira linha
            previewOpenValue={-40}
            previewOpenDelay={1000}
            disableRightSwipe // Desabilita swipe para a direita
            // useNativeDriver={false} // Pode ser necessário para SwipeListView dependendo da versão e animações
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
                <View style={styles.centeredMessageContainer}>
                    <MaterialCommunityIcons name="account-search-outline" size={48} color={theme.colors.placeholder} />
                    <Text style={[styles.messageText, {color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular}]}>
                        {allClients.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado com os critérios de busca."}
                    </Text>
                    {allClients.length === 0 && (
                        <Button title="Adicionar Primeiro Cliente" onPress={() => navigateToClientWizard()} type="solid" />
                    )}
                </View>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clientCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    // backgroundColor é definido pelo Card
  },
  inactiveClientCard: {
    opacity: 0.7,
    // backgroundColor: '#f0f0f0', // Ou uma cor de fundo ligeiramente diferente do tema
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18, // Usar theme.typography
    // fontWeight e fontFamily são dinâmicos
    flexShrink: 1, // Para quebrar nome longo
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    // fontWeight e fontFamily são dinâmicos
  },
  clientSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 14, // Usar theme.typography
    // fontFamily é dinâmico
    flexShrink: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconStyle: {
    marginRight: 8,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  // Estilos para SwipeListView Hidden Items
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD', // Cor de fundo da área de swipe (pode ser transparente)
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15, // Não usado se só tiver botões à direita
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8, // Mesmo borderRadius do Card
    overflow: 'hidden', // Para aplicar borderRadius aos botões internos
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
    // backgroundColor: // Definido dinamicamente
    right: 75,
  },
  backRightBtnRight: {
    // backgroundColor: // Definido dinamicamente
    right: 0,
  },
  backTextWhite: {
    color: '#FFF', // Usar theme.colors.white
    fontSize: 12,
    marginTop: 2,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
});

export default ClientListScreen;
