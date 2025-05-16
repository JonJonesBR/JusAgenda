import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Text,
  Switch,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as MailComposer from 'expo-mail-composer';
import { useTheme } from '../contexts/ThemeContext';
import { Header, InputDialog, Section, ListItem } from '../components/ui';
import { SETTINGS_KEYS } from '../constants';
import { configureNotifications } from '../services/notifications';
import { Icon } from '@rneui/themed';
import Toast from 'react-native-toast-message';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const defaultDs = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  typography: {
    fontSize: { sm: 12, md: 14, lg: 16, xl: 18, xxl: 22 },
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
  },
  radii: { md: 8 },
};

const componentColors = {
  white: '#FFFFFF',
  defaultGrey: '#CCCCCC',
  trackColorFalse: '#767577',
  thumbColorFalse: '#f4f3f4',
  defaultPlaceholderText: '#A9A9A9',
  defaultDisabledText: '#C0C0C0',
};

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme(); // Correctly destructure isDark and toggleTheme
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [defaultEmail, setDefaultEmail] = useState("");
  const [defaultReminderTime, setDefaultReminderTime] = useState("30");
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const insets = useSafeAreaInsets();

  // Use local defaults as theme object does not have spacing, typography, radii
  const ds = defaultDs;

  const checkEmailAvailability = useCallback(async () => {
    try {
      const available = await MailComposer.isAvailableAsync();
      setIsEmailAvailable(available);
    } catch (error: unknown){
      console.error("Erro ao verificar disponibilidade de email:", error);
      setIsEmailAvailable(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const [
          notificationsValue,
          emailNotificationsValue,
          defaultEmailValue,
          reminderTimeValue,
          themeValue
      ] = await Promise.all([
          AsyncStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED),
          AsyncStorage.getItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS),
          AsyncStorage.getItem(SETTINGS_KEYS.DEFAULT_EMAIL),
          AsyncStorage.getItem(SETTINGS_KEYS.DEFAULT_REMINDER_TIME),
          AsyncStorage.getItem(SETTINGS_KEYS.THEME)
      ]);

      setNotificationsEnabled(notificationsValue !== "false");
      setEmailNotifications(emailNotificationsValue === "true");
      if (defaultEmailValue) setDefaultEmail(defaultEmailValue);
      if (reminderTimeValue) setDefaultReminderTime(reminderTimeValue);
      
      // Apply saved theme if toggleTheme is available and saved theme differs from current
      if (themeValue && toggleTheme && (themeValue === 'dark' !== isDark)) {
        toggleTheme();
      }

    } catch (error: unknown) {
      console.error("Erro ao carregar configurações:", error);
      Toast.show({ type:'error', text1: 'Erro', text2: 'Não foi possível carregar configurações.' });
    }
  }, [isDark, toggleTheme]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingSettings(true);
      await Promise.all([loadSettings(), checkEmailAvailability()]);
      setIsLoadingSettings(false);
    };
    loadInitialData();
  }, [loadSettings, checkEmailAvailability]);


  const saveSetting = async (key: string, value: string | boolean) => {
      try {
          await AsyncStorage.setItem(key, String(value));
      } catch (error: unknown) {
          console.error(`Erro ao salvar ${key}:`, error);
          Toast.show({ type:'error', text1: 'Erro', text2: `Não foi possível salvar ${key}.` });
          throw error;
      }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await saveSetting(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, value);
      if (value) {
        const permissionGranted = await configureNotifications();
        if (!permissionGranted) {
          Alert.alert(
            "Permissão Necessária",
            "Para receber notificações, conceda permissão nas configurações.",
            [
              { text: "Cancelar", style: "cancel", onPress: async () => { setNotificationsEnabled(false); await saveSetting(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, false); } },
              { text: "Configurações", onPress: () => Linking.openSettings() },
            ],
            { onDismiss: async () => { if(notificationsEnabled) { setNotificationsEnabled(false); await saveSetting(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, false); }} }
          );
          setNotificationsEnabled(false);
        } else {
          Toast.show({ type: 'success', text1: 'Notificações Ativadas' });
        }
      } else {
        Toast.show({ type: 'info', text1: 'Notificações Desativadas' });
      }
    } catch (error: unknown) {
      console.error("Erro ao alternar notificações:", error);
      setNotificationsEnabled(!value);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível alterar as notificações.' });
    }
  };

  const toggleEmailNotifications = async (value: boolean) => {
    if (value && !isEmailAvailable) {
         Alert.alert("Email Indisponível", "Nenhum app de email detectado para enviar notificações.");
         return;
    }
    try {
      setEmailNotifications(value);
      await saveSetting(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, value);
      if (value && !defaultEmail) {
        setShowEmailDialog(true);
      } else if (value) {
        Toast.show({ type: 'success', text1: 'Notificações por Email Ativadas' });
      } else {
        Toast.show({ type: 'info', text1: 'Notificações por Email Desativadas' });
      }
    } catch (error: unknown) {
      console.error("Erro ao alternar notificações por email:", error);
      setEmailNotifications(!value);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível alterar as notificações por email.' });
    }
  };

  const handleEmailDialogCancel = async () => {
    setShowEmailDialog(false);
    if (emailNotifications && !defaultEmail) {
        setEmailNotifications(false);
        await saveSetting(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, false);
    }
  };

  const validateEmailLocal = (emailToValidate: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(emailToValidate).toLowerCase());
  };

  const handleEmailDialogSubmit = async (emailValue: string) => {
    setShowEmailDialog(false);
    const trimmedEmail = emailValue.trim();
    if (trimmedEmail && validateEmailLocal(trimmedEmail)) {
      try {
        setDefaultEmail(trimmedEmail);
        await saveSetting(SETTINGS_KEYS.DEFAULT_EMAIL, trimmedEmail);
        Toast.show({ type: 'success', text1: 'Email Configurado', text2: `Notificações serão enviadas para ${trimmedEmail}` });
        if(!emailNotifications) {
             setEmailNotifications(true);
             await saveSetting(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, true);
        }
      } catch (error: unknown) { console.error("Erro ao salvar email:", error); }
    } else {
      Alert.alert("Email Inválido", "Por favor, insira um endereço de email válido.");
      if (emailNotifications && !defaultEmail) {
          setEmailNotifications(false);
          await saveSetting(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, false);
      }
    }
  };

  const handleDarkModeToggle = async () => {
    const newIsDarkState = !isDark; // Determine the new state before calling toggleTheme
    try {
      if (toggleTheme) toggleTheme(); // Call the context's toggle function
      Toast.show({ type: 'info', text1: newIsDarkState ? "Modo Escuro Ativado" : "Modo Claro Ativado" });
      await saveSetting(SETTINGS_KEYS.THEME, newIsDarkState ? "dark" : "light");
    } catch (error: unknown) {
      console.error("Erro ao alterar tema:", error);
      Toast.show({ type: 'error', text1: 'Erro ao Alterar Tema' });
    }
  };

  const changeDefaultReminderTime = () => setShowReminderDialog(true);
  const handleReminderDialogCancel = () => setShowReminderDialog(false);

  const handleReminderDialogSubmit = async (timeValue: string) => {
    setShowReminderDialog(false);
    const timeInt = parseInt(timeValue, 10);
    if (!isNaN(timeInt) && timeInt > 0) {
       const timeStr = String(timeInt);
       try {
            setDefaultReminderTime(timeStr);
            await saveSetting(SETTINGS_KEYS.DEFAULT_REMINDER_TIME, timeStr);
            Toast.show({ type: 'success', text1: 'Tempo de Lembrete Atualizado' });
       } catch (error: unknown) { console.error("Erro ao salvar tempo de lembrete:", error); }
    } else {
      Alert.alert("Valor Inválido", "Por favor, insira um número de minutos válido (maior que zero).");
    }
  };

  const changeDefaultEmail = () => setShowEmailDialog(true);

  const clearAllNotifications = () => {
    Alert.alert(
      "Limpar Notificações Agendadas",
      "Tem certeza que deseja cancelar todos os lembretes futuros agendados pelo aplicativo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              Toast.show({ type: 'success', text1: 'Notificações Canceladas'});
            } catch (error: unknown) {
              console.error("Erro ao cancelar notificações:", error);
              Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível cancelar.' });
            }
          },
        },
      ]
    );
  };

  const renderNotificationItems = () => (
      <>
        <ListItem
          title="Notificações Push"
          subtitle="Receber alertas no dispositivo"
          leftIcon={<Icon name="bell-outline" type="material-community" color={theme.colors.textSecondary} />}
          rightIcon={
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: componentColors.trackColorFalse, true: theme.colors.primary + '70' }}
              thumbColor={notificationsEnabled ? theme.colors.primary : componentColors.thumbColorFalse}
              ios_backgroundColor={componentColors.defaultGrey} // Fallback for greyOutline/grey4
            />
          }
        />
        <ListItem
          title="Tempo Lembrete Padrão"
          subtitle={`${defaultReminderTime} minutos antes`}
          leftIcon={<Icon name="clock-time-four-outline" type="material-community" color={theme.colors.textSecondary} />}
          onPress={notificationsEnabled ? changeDefaultReminderTime : undefined}
          disabled={!notificationsEnabled}
          bottomDivider
        />
        <ListItem
          title="Notificações por Email"
          subtitle={isEmailAvailable ? "Receber alertas por email" : "App de email não detectado"}
          leftIcon={<Icon name="email-alert-outline" type="material-community" color={isEmailAvailable ? theme.colors.textSecondary : componentColors.defaultDisabledText} />}
          rightIcon={
            <Switch
              value={emailNotifications}
              onValueChange={toggleEmailNotifications}
              trackColor={{ false: componentColors.defaultGrey, true: theme.colors.primary + '70' }} // Fallback for greyOutline/grey4
              thumbColor={emailNotifications ? theme.colors.primary : componentColors.thumbColorFalse} // Fallback for grey3
              disabled={!isEmailAvailable}
              ios_backgroundColor={componentColors.defaultGrey} // Fallback for greyOutline/grey4
            />
          }
          disabled={!isEmailAvailable}
          bottomDivider
        />
        <ListItem
          title="Email para Alertas"
          subtitle={defaultEmail || "Toque para configurar"}
          leftIcon={<Icon name="email-edit-outline" type="material-community" color={theme.colors.textSecondary} />}
          onPress={isEmailAvailable && emailNotifications ? changeDefaultEmail : (isEmailAvailable ? () => setShowEmailDialog(true) : undefined)}
          disabled={!isEmailAvailable}
          bottomDivider
        />
        <ListItem
          title="Limpar Notificações Agendadas"
          leftIcon={<Icon name="notification-clear-all" type="material-community" color={theme.colors.error} />}
          onPress={clearAllNotifications}
          titleStyle={{ color: theme.colors.error }}
        />
      </>
    );

  const renderAppearanceItems = () => (
      <ListItem
        title="Modo Escuro"
        leftIcon={<Icon name={isDark ? "weather-night" : "weather-sunny"} type="material-community" color={theme.colors.textSecondary} />}
        rightIcon={
          <Switch
            value={isDark}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: componentColors.defaultGrey, true: theme.colors.primary + '70' }} // Fallback for greyOutline/grey4
            thumbColor={isDark ? theme.colors.primary : componentColors.thumbColorFalse} // Fallback for grey3
            ios_backgroundColor={componentColors.defaultGrey} // Fallback for greyOutline/grey4
          />
        }
      />
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
       <Header title="Configurações" />
      {isLoadingSettings ? (
           <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + ds.spacing.lg}]}>
            <Section title="Notificações">
            {renderNotificationItems()}
            </Section>

            <Section title="Aparência">
            {renderAppearanceItems()}
            </Section>

            <Section title="Sobre o Aplicativo">
            <View style={styles.aboutSection}>
                <Text style={[styles.appVersion, { color: theme.colors.text, fontSize: ds.typography.fontSize.lg, fontFamily: ds.typography.fontFamily.bold, marginBottom: ds.spacing.sm }]}>
                    JusAgenda v1.0.0
                </Text>
                <Text style={[styles.appDescription, { color: theme.colors.textSecondary, fontSize: ds.typography.fontSize.md, marginBottom: ds.spacing.lg }]}>
                    Assistente para advogados organizarem prazos, audiências, reuniões e muito mais.
                </Text>
                <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: ds.spacing.md }]} />
                <Text style={[styles.appCopyright, { color: theme.colors.textSecondary, fontSize: ds.typography.fontSize.sm }]}>
                    © 2024 Seu Nome/Empresa - Todos os direitos reservados
                </Text>
            </View>
            </Section>
        </ScrollView>
      )}

      <InputDialog
        visible={showEmailDialog}
        title="Email para Notificações"
        message="Informe seu endereço de email:"
        defaultValue={defaultEmail}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        onCancel={handleEmailDialogCancel}
        onSubmit={handleEmailDialogSubmit}
        submitText="Salvar Email"
        cancelText="Cancelar"
      />

      <InputDialog
        visible={showReminderDialog}
        title="Tempo de Lembrete (Minutos)"
        message="Minutos antes do compromisso para receber o alerta:"
        defaultValue={defaultReminderTime}
        placeholder="Ex: 30"
        keyboardType="number-pad"
        onCancel={handleReminderDialogCancel}
        onSubmit={handleReminderDialogSubmit}
        submitText="Salvar Tempo"
        cancelText="Cancelar"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  aboutSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
   appCopyright: {
    marginTop: 8,
  },
  appDescription: {
    lineHeight: 21,
    textAlign: 'center',
  },
  appVersion: {},
  container: {
    flex: 1,
  },
  divider: {
    alignSelf: 'center',
    height: StyleSheet.hairlineWidth,
    width: '80%',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
});

export default SettingsScreen;
