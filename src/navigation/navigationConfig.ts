// src/navigation/navigationConfig.ts
import { Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Theme } from '../contexts/ThemeContext'; // Importando o tipo Theme

// Tipos para as ParamLists de cada navegador (isto é crucial!)
// Você deve definir estes tipos de forma mais completa com base nas suas rotas e parâmetros.
// Exemplo:
// export type RootStackParamList = {
//   MainTabs: undefined; // MainTabs não recebe parâmetros diretamente
//   EventDetails: { eventId?: string; initialDateString?: string };
//   EventView: { eventId: string; eventTitle?: string };
//   ClientWizard: { clientId?: string; isEditMode?: boolean; readOnly?: boolean };
//   Settings: undefined;
//   // ... outras rotas globais ou modais
// };

// export type BottomTabParamList = {
//   HomeStack: undefined; // Ou NavigatorScreenParams<HomeStackParamList> se aninhado
//   ClientsStack: undefined;
//   SearchStack: undefined;
//   SyncStack: undefined;
//   UnifiedCalendar: undefined; // Se for uma tela direta na tab
// };

// Criando instâncias dos navegadores
// Estes podem ser usados em toda a aplicação para consistência.
export const Tab = createBottomTabNavigator(); // Use BottomTabParamList aqui se definida globalmente
export const Stack = createNativeStackNavigator(); // Use RootStackParamList aqui se definida globalmente

/**
 * Gera opções de ecrã padrão para StackNavigators usando o tema da aplicação.
 * @param theme - O objeto de tema da aplicação.
 * @param isTransparent - Se o header deve ser transparente.
 * @returns NativeStackNavigationOptions
 */
export const getStackScreenOptions = (theme: Theme, isTransparent: boolean = false): NativeStackNavigationOptions => ({
  headerStyle: {
    backgroundColor: isTransparent ? 'transparent' : theme.colors.background,
  },
  headerTintColor: theme.colors.text, // Cor do título e do botão de voltar
  headerTitleStyle: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
  },
  headerBackTitleVisible: false, // Não mostrar o texto de "Voltar" no iOS, apenas o ícone
  headerTransparent: isTransparent,
  animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right', // Animação padrão para Android
});

/**
 * Gera opções de ecrã padrão para BottomTabNavigator usando o tema da aplicação.
 * @param theme - O objeto de tema da aplicação.
 * @returns BottomTabNavigationOptions
 */
export const getTabScreenOptions = (theme: Theme): BottomTabNavigationOptions => ({
  headerShown: false, // Geralmente, cada tab terá o seu próprio header (definido pela stack interna)
  tabBarStyle: {
    backgroundColor: theme.colors.card, // Cor de fundo da barra de tabs
    borderTopColor: theme.colors.border,
    // height: Platform.OS === 'ios' ? 90 : 70, // Altura customizada se necessário
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.xs, // Padding para safe area inferior no iOS
    paddingTop: theme.spacing.xs,
  },
  tabBarActiveTintColor: theme.colors.primary, // Cor do ícone e label da tab ativa
  tabBarInactiveTintColor: theme.colors.placeholder, // Cor do ícone e label da tab inativa
  tabBarLabelStyle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    // marginBottom: Platform.OS === 'ios' ? 0 : theme.spacing.xs, // Ajuste de margem do label
  },
  tabBarHideOnKeyboard: Platform.OS === 'android', // Esconder a tab bar quando o teclado abre no Android
});


// Configurações de navegação que eram usadas anteriormente (podem ser removidas ou adaptadas)
// Se estas configurações forem agora geradas dinamicamente com o tema (como acima),
// estas constantes podem não ser mais necessárias ou podem servir como um fallback muito básico.

// export const navigationConfig: NativeStackNavigationOptions = {
//   headerStyle: {
//     backgroundColor: '#6200ee', // Cor primária hardcoded (exemplo)
//   },
//   headerTintColor: '#fff', // Cor do texto do header hardcoded
//   headerTitleStyle: {
//     fontWeight: 'bold',
//   },
//   headerBackTitleVisible: false,
// };

// export const tabConfig: BottomTabNavigationOptions = {
//   headerShown: false,
//   tabBarActiveTintColor: '#6200ee', // Cor ativa hardcoded
//   tabBarInactiveTintColor: 'gray', // Cor inativa hardcoded
//   tabBarStyle: {
//     backgroundColor: '#f0f0f0', // Fundo da tab bar hardcoded
//   },
// };

// É preferível usar as funções getStackScreenOptions e getTabScreenOptions
// diretamente nos seus navegadores, passando o objeto `theme` atual.
