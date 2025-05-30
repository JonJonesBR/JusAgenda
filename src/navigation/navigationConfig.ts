// src/navigation/navigationConfig.ts
import { Platform } from 'react-native';
// import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'; // Removido
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'; // createNativeStackNavigator import removido, pois Stack não é mais exportado daqui
import { Theme } from '../contexts/ThemeContext'; // Importando o tipo Theme

// Comentários sobre ParamLists removidos para limpeza, pois são definidos nos seus respectivos arquivos.

// Instâncias de navegadores removidas (Tab, Stack)

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
// export const getTabScreenOptions = (theme: Theme): BottomTabNavigationOptions => ({...}); // Removido


// Comentários e código antigo removidos para limpeza.
// O arquivo agora foca apenas em exportar getStackScreenOptions.
