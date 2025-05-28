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
// EmailService import removed
// Assumindo que HomeStackParamList é onde SettingsScreen está, ou uma RootStackParamList
import { HomeStackParamList } from '../navigation/stacks/HomeStack';


// Tipagem para a prop de navegação específica desta tela
type SettingsScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.SETTINGS>;

interface SettingsState {
  notificationsEnabled: boolean;
  // emailNotificationsEnabled, userEmail, isEmailClientAvailable removed
  // darkMode: boolean; // O tema escuro é agora gerido pelo ThemeContext
}

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const [settings, setSettings] = useState<SettingsState>({
    notificationsEnabled: false,
    // emailNotificationsEnabled, userEmail, isEmailClientAvailable removed
  });
  // isEmailDialogVisible, tempEmail removed
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedNotificationsEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      // storedEmailNotificationsEnabled, storedUserEmail removed
      // O tema já é carregado pelo ThemeProvider, não precisamos carregar aqui.

      // emailAvailable check removed

      setSettings({
        notificationsEnabled: storedNotificationsEnabled === 'true',
        // emailNotificationsEnabled, userEmail, isEmailClientAvailable removed
      });
      // setTempEmail removed
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
    setSettings(s => ({ ...s, notificationsEnabled: false }));
      await saveSetting(STORAGE_KEYS.NOTIFICATIONS_ENABLED, false);
      // Opcional: cancelar todas as notificações agendadas
      // await NotificationService.cancelAllScheduledNotifications();
      Toast.show({ type: 'info', text1: 'Notificações Desativadas' });
    }
  };

// handleToggleEmailNotifications removed
// handleSaveUserEmail removed
// handleEmailDialogCancel removed

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
          {/* Email Alert ListItems removed */}
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

        {/* "Dados" section removed */}

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

      {/* InputDialog for email removed */}
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
