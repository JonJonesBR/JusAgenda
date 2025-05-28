// src/navigation/stacks/SyncStack.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Stack, getStackScreenOptions } from '../navigationConfig'; // Usando Stack e getStackScreenOptions
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../constants';

// Importar as telas que pertencem a esta stack
import SyncExportOptionsScreen from '../../screens/SyncExportOptionsScreen';
import EmailSyncScreen from '../../screens/EmailSyncScreen';
import ExportScreen from '../../screens/ExportScreen';
// Adicione outras telas relacionadas se houver, ex: uma tela de configuração de backup na nuvem

// Defina a ParamList para a SyncStack
// Isto é crucial para a segurança de tipos com React Navigation
export type SyncStackParamList = {
  [ROUTES.SYNC_EXPORT_OPTIONS]: undefined; // Tela principal de opções de Sinc/Exportação
  [ROUTES.EMAIL_SYNC]: undefined; // Tela para sincronização de emails
  [ROUTES.EXPORT]: undefined; // Tela para exportar dados
  // Adicione outras telas que podem ser navegadas a partir da SyncStack
  // Ex: [ROUTES.CLOUD_BACKUP_CONFIG]: undefined;
};

const SyncStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Obtém as opções de ecrã para a stack, baseadas no tema atual
  const stackScreenOptions = getStackScreenOptions(theme);
  // Opções específicas para esta stack, se o header da primeira tela for diferente
  const initialScreenOptions = getStackScreenOptions(theme, true); // Exemplo com header transparente

  return (
    // Tipando o Stack.Navigator com a SyncStackParamList
    <Stack.Navigator initialRouteName={ROUTES.SYNC_EXPORT_OPTIONS} screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={ROUTES.SYNC_EXPORT_OPTIONS}
        component={SyncExportOptionsScreen}
        options={{
          // A SyncExportOptionsScreen pode não precisar de um header da stack se for um menu
          // ou pode ter um título simples.
          title: 'Sincronizar e Exportar',
          // Se SyncExportOptionsScreen tiver o seu próprio Header interno e não precisar do da stack:
          // headerShown: false,
          // Se quiser um header transparente para a primeira tela:
          // ...initialScreenOptions, // Descomente se quiser header transparente
        }}
      />
      <Stack.Screen
        name={ROUTES.EMAIL_SYNC}
        component={EmailSyncScreen}
        options={{
          title: 'Sincronizar Emails',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }}
      />
      <Stack.Screen
        name={ROUTES.EXPORT}
        component={ExportScreen}
        options={{
          title: 'Exportar Dados',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }}
      />
      {/* Exemplo de outra tela na stack:
      <Stack.Screen
        name={ROUTES.CLOUD_BACKUP_CONFIG}
        component={CloudBackupConfigScreen} // Crie este componente de tela
        options={{
          title: 'Configurar Backup na Nuvem',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }}
      />
      */}
    </Stack.Navigator>
  );
};

export default SyncStackNavigator;
