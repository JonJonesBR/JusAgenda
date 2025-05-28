// src/screens/SettingsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, Theme } from '../contexts/ThemeContext';
import { Header, Section, InputDialog, Button } from '../components/ui'; // Usando componentes de UI atualizados
import { Toast } from '../components/ui/Toast';
import { STORAGE_KEYS, ROUTES } from '../constants';
import * as NotificationService from '../services/notifications'; // Importando todo o módulo
import * as EmailService from '../services/EmailService'; // Importando todo o módulo
// Assumindo que HomeStackParamList é onde SettingsScreen está, ou uma RootStackParamList
import { HomeStackParamList } from '../navigation/stacks/HomeStack';


// Tipagem para a prop de navegação específica desta tela
type SettingsScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.SETTINGS>;

interface SettingsState {
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  userEmail: string;
  // darkMode: boolean; // O tema escuro é agora gerido pelo ThemeContext
  isEmailClientAvailable: boolean;
}

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const [settings, setSettings] = useState<SettingsState>({
    notificationsEnabled: false,
    emailNotificationsEnabled: false,
    userEmail: '',
    isEmailClientAvailable: false,
  });
  const [isEmailDialogVisible, setIsEmailDialogVisible] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedNotificationsEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      const storedEmailNotificationsEnabled = await AsyncStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED);
      const storedUserEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL_FOR_NOTIFICATIONS);
      // O tema já é carregado pelo ThemeProvider, não precisamos carregar aqui.

      const emailAvailable = await EmailService.isEmailClientAvailable();

      setSettings({
        notificationsEnabled: storedNotificationsEnabled === 'true',
        emailNotificationsEnabled: storedEmailNotificationsEnabled === 'true' && emailAvailable,
        userEmail: storedUserEmail || '',
        isEmailClientAvailable: emailAvailable,
      });
      setTempEmail(storedUserEmail || ''); // Inicializa tempEmail para o diálogo
    } catch (error) {
      console.error("SettingsScreen: Erro ao carregar configurações:", error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar as configurações.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const saveSetting = async (key: keyof SettingsState | typeof STORAGE_KEYS.APP_THEME, value: string | boolean) => {
    try {
      await AsyncStorage.setItem(key as string, String(value));
    } catch (error) {
      console.error(`SettingsScreen: Erro ao salvar configuração ${key}:`, error);
      Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: `Não foi possível salvar ${key}.` });
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) { // Tentando ativar
      const permissionStatus = await NotificationService.registerForPushNotificationsAsync();
      if (permissionStatus) { // Se permissão concedida (string não undefined)
        setSettings(s => ({ ...s, notificationsEnabled: true }));
        await saveSetting(STORAGE_KEYS.NOTIFICATIONS_ENABLED, true);
        Toast.show({ type: 'success', text1: 'Notificações Ativadas' });
      } else {
        // Permissão não concedida, registerForPushNotificationsAsync já deve ter mostrado um Alert
        // Não altera o switch, pois a permissão é necessária.
        Toast.show({ type: 'info', text1: 'Permissão Necessária', text2: 'Ative as notificações nas configurações.' });
      }
    } else { // Tentando desativar
      setSettings(s => ({ ...s, notificationsEnabled: false, emailNotificationsEnabled: false })); // Desativa email também
      await saveSetting(STORAGE_KEYS.NOTIFICATIONS_ENABLED, false);
      await saveSetting(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED, false); // Desativa email também
      // Opcional: cancelar todas as notificações agendadas
      // await NotificationService.cancelAllScheduledNotifications();
      Toast.show({ type: 'info', text1: 'Notificações Desativadas' });
    }
  };

  const handleToggleEmailNotifications = async (value: boolean) => {
    if (!settings.notificationsEnabled && value) {
      Toast.show({ type: 'error', text1: 'Aviso', text2: 'Ative as notificações gerais primeiro.' });
      return;
    }
    if (!settings.isEmailClientAvailable && value) {
        Toast.show({ type: 'error', text1: 'Sem Email', text2: 'Nenhum cliente de email configurado.' });
        return;
    }

    if (value && !settings.userEmail) {
      // Se está a ativar e não há email, abre o diálogo para inserir email
      setTempEmail(settings.userEmail); // Garante que o diálogo comece com o email atual (ou vazio)
      setIsEmailDialogVisible(true);
      // Não salva a configuração ainda, espera a confirmação do email
    } else if (value && settings.userEmail) {
      setSettings(s => ({ ...s, emailNotificationsEnabled: true }));
      await saveSetting(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED, true);
      Toast.show({ type: 'success', text1: 'Alertas por Email Ativados' });
    } else { // Desativando
      setSettings(s => ({ ...s, emailNotificationsEnabled: false }));
      await saveSetting(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED, false);
      Toast.show({ type: 'info', text1: 'Alertas por Email Desativados' });
    }
  };

  const handleSaveUserEmail = async (email: string) => {
    if (email && EmailService.isValidEmail(email)) {
      setSettings(s => ({ ...s, userEmail: email, emailNotificationsEnabled: true })); // Ativa notificações por email ao salvar um email válido
      await saveSetting(STORAGE_KEYS.USER_EMAIL_FOR_NOTIFICATIONS, email);
      await saveSetting(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED, true);
      setIsEmailDialogVisible(false);
      setTempEmail(''); // Limpa o email temporário
      Toast.show({ type: 'success', text1: 'Email Salvo', text2: 'Alertas por email configurados.' });
    } else {
      Toast.show({ type: 'error', text1: 'Email Inválido', text2: 'Por favor, insira um email válido.' });
      // Não fecha o diálogo, permite correção
    }
  };

  const handleEmailDialogCancel = () => {
    setIsEmailDialogVisible(false);
    setTempEmail(''); // Limpa o email temporário
    // Se o utilizador cancelou e as notificações por email estavam ativadas sem um email, desativa-as
    if (settings.emailNotificationsEnabled && !settings.userEmail) {
      setSettings(s => ({ ...s, emailNotificationsEnabled: false }));
      saveSetting(STORAGE_KEYS.EMAIL_NOTIFICATIONS_ENABLED, false);
    }
  };

  const handleToggleDarkMode = async () => {
    toggleTheme(); // O ThemeContext já lida com a persistência do tema
  };

  const navigateToFeedback = () => {
    navigation.navigate(ROUTES.FEEDBACK);
  };

  const ListItem: React.FC<{ title: string; value?: string | boolean; onValueChange?: (value: boolean) => void; onPress?: () => void; isSwitch?: boolean; iconName?: keyof typeof MaterialCommunityIcons.glyphMap; hideArrow?: boolean }> =
    ({ title, value, onValueChange, onPress, isSwitch = false, iconName, hideArrow = false }) => (
    <TouchableOpacity
      style={[styles.listItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress || isSwitch} // Desabilita onPress se for switch (o switch tem seu próprio handler)
      activeOpacity={onPress ? 0.7 : 1}
    >
      {iconName && <MaterialCommunityIcons name={iconName} size={22} color={theme.colors.primary} style={styles.listItemIcon} />}
      <Text style={[styles.listItemText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>{title}</Text>
      {isSwitch && typeof value === 'boolean' && onValueChange ? (
        <Switch
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
          ios_backgroundColor={theme.colors.disabled}
          onValueChange={onValueChange}
          value={value}
        />
      ) : typeof value === 'string' && value ? (
        <Text style={[styles.listItemValue, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>{value}</Text>
      ) : null}
      {onPress && !isSwitch && !hideArrow && (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
      )}
    </TouchableOpacity>
  );


  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Configurações" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Section title="Notificações" theme={theme} style={styles.sectionStyle}>
          <ListItem
            title="Ativar Lembretes"
            isSwitch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            iconName="bell-ring-outline"
          />
          <ListItem
            title="Alertas por Email"
            isSwitch
            value={settings.emailNotificationsEnabled}
            onValueChange={handleToggleEmailNotifications}
            disabled={!settings.notificationsEnabled || !settings.isEmailClientAvailable} // Desabilita se notificações gerais ou email não estiverem ok
            iconName="email-alert-outline"
          />
          <ListItem
            title="Email para Alertas"
            value={settings.userEmail || 'Não definido'}
            onPress={() => {
                setTempEmail(settings.userEmail); // Preenche o diálogo com o email atual
                setIsEmailDialogVisible(true);
            }}
            disabled={!settings.notificationsEnabled || !settings.isEmailClientAvailable}
            iconName="email-edit-outline"
          />
           <ListItem
            title="Cancelar Todos os Lembretes Agendados"
            onPress={async () => {
                Alert.alert("Confirmar", "Tem certeza que deseja cancelar todos os lembretes agendados?", [
                    {text: "Não"},
                    {text: "Sim", onPress: async () => {
                        await NotificationService.cancelAllScheduledNotifications();
                        Toast.show({type: 'info', text1: "Lembretes Cancelados"});
                    }}
                ]);
            }}
            iconName="calendar-remove-outline"
          />
        </Section>

        <Section title="Aparência" theme={theme} style={styles.sectionStyle}>
          <ListItem
            title="Modo Escuro"
            isSwitch
            value={isDark} // Do ThemeContext
            onValueChange={handleToggleDarkMode}
            iconName={isDark ? "weather-night" : "weather-sunny"}
          />
          {/* Adicionar mais opções de aparência, como tamanho da fonte, se implementado */}
        </Section>

        <Section title="Dados" theme={theme} style={styles.sectionStyle}>
            <ListItem
                title="Exportar Dados"
                onPress={() => navigation.navigate(ROUTES.EXPORT)} // Assumindo que EXPORT está na mesma stack ou numa stack acessível
                iconName="export-variant"
            />
            <ListItem
                title="Sincronizar com Email"
                onPress={() => navigation.navigate(ROUTES.EMAIL_SYNC)}
                iconName="email-sync-outline"
            />
        </Section>

        <Section title="Sobre e Suporte" theme={theme} style={styles.sectionStyle}>
          <ListItem
            title="Enviar Feedback"
            onPress={navigateToFeedback}
            iconName="comment-quote-outline"
          />
          <ListItem
            title="Termos de Serviço"
            onPress={() => Linking.openURL('https://seusite.com/termos').catch(err => console.error("Erro ao abrir URL", err))}
            iconName="file-document-outline"
          />
          <ListItem
            title="Política de Privacidade"
            onPress={() => Linking.openURL('https://seusite.com/privacidade').catch(err => console.error("Erro ao abrir URL", err))}
            iconName="shield-lock-outline"
          />
           <ListItem
            title="Versão do App"
            value={Platform.OS === 'ios' ? "1.0.0 (iOS)" : "1.0.0 (Android)"} // Obter dinamicamente do package.json ou expo-application
            hideArrow // Não é clicável
            iconName="information-outline"
          />
        </Section>
      </ScrollView>

      <InputDialog
        visible={isEmailDialogVisible}
        title="Email para Alertas"
        message="Insira o endereço de email onde deseja receber os alertas de eventos."
        initialValue={tempEmail} // Usa tempEmail para o input
        placeholder="seuemail@exemplo.com"
        confirmText="Salvar Email"
        cancelText="Cancelar"
        onConfirm={(email) => handleSaveUserEmail(email)}
        onCancel={handleEmailDialogCancel}
        textInputProps={{
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  sectionStyle: {
    marginTop: 8, // Usar theme.spacing.sm
    marginBottom: 16, // Usar theme.spacing.md
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14, // Usar theme.spacing.sm + theme.spacing.xs
    paddingHorizontal: 16, // Usar theme.spacing.md
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor é dinâmico
    // backgroundColor: theme.colors.surface, // Opcional, se quiser que cada item tenha um fundo
  },
  listItemIcon: {
    marginRight: 16, // Usar theme.spacing.md
  },
  listItemText: {
    flex: 1,
    fontSize: 16, // Usar theme.typography.fontSize.md
    // Cor e fontFamily são dinâmicas
  },
  listItemValue: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    // Cor e fontFamily são dinâmicas
  },
});

export default SettingsScreen;
