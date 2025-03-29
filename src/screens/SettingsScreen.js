import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Linking, Platform } from 'react-native';
import { Text, Card, ListItem, Icon, Button, Divider } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as MailComposer from 'expo-mail-composer';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/common';
import { configureNotifications } from '../services/notifications';
import { useTheme } from '../contexts/ThemeContext';

const SETTINGS_KEYS = {
  NOTIFICATIONS_ENABLED: '@jusagenda_notifications_enabled',
  DEFAULT_REMINDER_TIME: '@jusagenda_default_reminder_time',
  EMAIL_NOTIFICATIONS: '@jusagenda_email_notifications',
  DEFAULT_EMAIL: '@jusagenda_default_email',
  THEME: '@jusagenda_theme',
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [defaultEmail, setDefaultEmail] = useState('');
  const [defaultReminderTime, setDefaultReminderTime] = useState('30');
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);

  // Carrega as configurações salvas
  useEffect(() => {
    loadSettings();
    checkEmailAvailability();
  }, []);

  // Verifica se o email está disponível
  const checkEmailAvailability = async () => {
    try {
      const available = await MailComposer.isAvailableAsync();
      setIsEmailAvailable(available);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de email:', error);
      setIsEmailAvailable(false);
    }
  };

  // Carrega as configurações do armazenamento
  const loadSettings = async () => {
    try {
      const notificationsValue = await AsyncStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED);
      setNotificationsEnabled(notificationsValue !== 'false');
      
      const emailNotificationsValue = await AsyncStorage.getItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS);
      setEmailNotifications(emailNotificationsValue === 'true');
      
      const defaultEmailValue = await AsyncStorage.getItem(SETTINGS_KEYS.DEFAULT_EMAIL);
      if (defaultEmailValue) setDefaultEmail(defaultEmailValue);
      
      const reminderTimeValue = await AsyncStorage.getItem(SETTINGS_KEYS.DEFAULT_REMINDER_TIME);
      if (reminderTimeValue) setDefaultReminderTime(reminderTimeValue);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Toggle para notificações push
  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, value ? 'true' : 'false');
      
      if (value) {
        // Se estiver habilitando, solicita permissão
        const permissionGranted = await configureNotifications();
        if (!permissionGranted) {
          Alert.alert(
            'Permissão Negada',
            'Para receber notificações, você precisa conceder permissão nas configurações do dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Ir para Configurações', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
          // Reverte a mudança se a permissão for negada
          setNotificationsEnabled(false);
          await AsyncStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, 'false');
        }
      }
    } catch (error) {
      console.error('Erro ao alterar configuração de notificações:', error);
    }
  };

  // Toggle para notificações por email
  const toggleEmailNotifications = async (value) => {
    try {
      setEmailNotifications(value);
      await AsyncStorage.setItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, value ? 'true' : 'false');
      
      if (value && !defaultEmail) {
        // Se estiver habilitando e não tiver email padrão configurado
        Alert.prompt(
          'Email para Notificações',
          'Por favor, informe seu endereço de email para receber notificações:',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => {
              setEmailNotifications(false);
              AsyncStorage.setItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, 'false');
            }},
            { text: 'Salvar', onPress: async (email) => {
              if (email && validateEmail(email)) {
                setDefaultEmail(email);
                await AsyncStorage.setItem(SETTINGS_KEYS.DEFAULT_EMAIL, email);
              } else {
                Alert.alert('Email Inválido', 'Por favor, insira um endereço de email válido.');
                setEmailNotifications(false);
                await AsyncStorage.setItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, 'false');
              }
            }}
          ],
          'plain-text',
          defaultEmail
        );
      }
    } catch (error) {
      console.error('Erro ao alterar configuração de notificações por email:', error);
    }
  };

  // Toggle para modo escuro
  const handleDarkModeToggle = async (value) => {
    try {
      // Usa a função do contexto ThemeContext para mudar o tema
      toggleTheme(value);
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
    }
  };

  // Abre a tela para alterar o tempo padrão de lembretes
  const changeDefaultReminderTime = () => {
    Alert.prompt(
      'Tempo de Lembrete',
      'Quantos minutos antes do compromisso você deseja receber notificações por padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar', onPress: async (time) => {
          if (time && !isNaN(time) && parseInt(time, 10) > 0) {
            setDefaultReminderTime(time);
            await AsyncStorage.setItem(SETTINGS_KEYS.DEFAULT_REMINDER_TIME, time);
          } else {
            Alert.alert('Valor Inválido', 'Por favor, insira um número válido maior que zero.');
          }
        }}
      ],
      'plain-text',
      defaultReminderTime
    );
  };

  // Abre a tela para alterar o email padrão
  const changeDefaultEmail = () => {
    Alert.prompt(
      'Email para Notificações',
      'Informe seu endereço de email para receber notificações:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar', onPress: async (email) => {
          if (email && validateEmail(email)) {
            setDefaultEmail(email);
            await AsyncStorage.setItem(SETTINGS_KEYS.DEFAULT_EMAIL, email);
          } else {
            Alert.alert('Email Inválido', 'Por favor, insira um endereço de email válido.');
          }
        }}
      ],
      'plain-text',
      defaultEmail
    );
  };

  // Limpa todas as notificações agendadas
  const clearAllNotifications = async () => {
    Alert.alert(
      'Limpar Notificações',
      'Tem certeza que deseja cancelar todas as notificações agendadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: async () => {
          try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert('Sucesso', 'Todas as notificações foram canceladas.');
          } catch (error) {
            console.error('Erro ao cancelar notificações:', error);
            Alert.alert('Erro', 'Não foi possível cancelar as notificações.');
          }
        }}
      ]
    );
  };

  // Valida o formato do email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    sectionCard: {
      borderRadius: 10,
      marginVertical: 8,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 10,
      marginLeft: 10,
    },
    disabledText: {
      color: '#CCCCCC',
    },
    aboutSection: {
      alignItems: 'center',
      padding: 15,
    },
    appVersion: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 10,
    },
    appDescription: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: 20,
    },
    divider: {
      width: '100%',
      marginVertical: 10,
      backgroundColor: theme.colors.border,
    },
    appCopyright: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <ListItem bottomDivider containerStyle={{ backgroundColor: theme.colors.surface }}>
          <Icon name="notifications" color={theme.colors.primary} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.text }}>Notificações Push</ListItem.Title>
            <ListItem.Subtitle style={{ color: theme.colors.textSecondary }}>Receba alertas no dispositivo</ListItem.Subtitle>
          </ListItem.Content>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            color={theme.colors.primary}
            trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
          />
        </ListItem>
        
        <ListItem 
          bottomDivider 
          disabled={!notificationsEnabled} 
          onPress={changeDefaultReminderTime}
          containerStyle={{ backgroundColor: theme.colors.surface }}
        >
          <Icon name="alarm" color={notificationsEnabled ? theme.colors.primary : '#CCCCCC'} />
          <ListItem.Content>
            <ListItem.Title style={[
              { color: theme.colors.text },
              !notificationsEnabled && styles.disabledText
            ]}>
              Tempo de Lembrete Padrão
            </ListItem.Title>
            <ListItem.Subtitle style={[
              { color: theme.colors.textSecondary },
              !notificationsEnabled && styles.disabledText
            ]}>
              {defaultReminderTime} minutos antes
            </ListItem.Subtitle>
          </ListItem.Content>
          <Icon name="chevron-right" color={notificationsEnabled ? theme.colors.textSecondary : '#CCCCCC'} />
        </ListItem>

        <ListItem bottomDivider containerStyle={{ backgroundColor: theme.colors.surface }}>
          <Icon name="email" color={isEmailAvailable ? theme.colors.primary : '#CCCCCC'} />
          <ListItem.Content>
            <ListItem.Title style={[
              { color: theme.colors.text },
              !isEmailAvailable && styles.disabledText
            ]}>
              Notificações por Email
            </ListItem.Title>
            <ListItem.Subtitle style={[
              { color: theme.colors.textSecondary },
              !isEmailAvailable && styles.disabledText
            ]}>
              Receba alertas por email
            </ListItem.Subtitle>
          </ListItem.Content>
          <Switch
            value={emailNotifications}
            onValueChange={toggleEmailNotifications}
            color={theme.colors.primary}
            trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
            disabled={!isEmailAvailable}
          />
        </ListItem>

        <ListItem 
          disabled={!isEmailAvailable || !emailNotifications} 
          onPress={changeDefaultEmail}
          bottomDivider
          containerStyle={{ backgroundColor: theme.colors.surface }}
        >
          <Icon 
            name="contact-mail" 
            color={(isEmailAvailable && emailNotifications) ? theme.colors.primary : '#CCCCCC'} 
          />
          <ListItem.Content>
            <ListItem.Title style={[
              { color: theme.colors.text },
              (!isEmailAvailable || !emailNotifications) && styles.disabledText
            ]}>
              Email para Notificações
            </ListItem.Title>
            <ListItem.Subtitle style={[
              { color: theme.colors.textSecondary },
              (!isEmailAvailable || !emailNotifications) && styles.disabledText
            ]}>
              {defaultEmail || 'Não configurado'}
            </ListItem.Subtitle>
          </ListItem.Content>
          <Icon 
            name="chevron-right" 
            color={(isEmailAvailable && emailNotifications) ? theme.colors.textSecondary : '#CCCCCC'} 
          />
        </ListItem>

        <ListItem onPress={clearAllNotifications} containerStyle={{ backgroundColor: theme.colors.surface }}>
          <Icon name="delete-sweep" color={theme.colors.error} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.error }}>
              Limpar Todas Notificações
            </ListItem.Title>
            <ListItem.Subtitle style={{ color: theme.colors.textSecondary }}>
              Cancela todos os alertas agendados
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </Card>

      <Card containerStyle={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <ListItem bottomDivider containerStyle={{ backgroundColor: theme.colors.surface }}>
          <Icon name={isDarkMode ? 'brightness-3' : 'brightness-7'} color={theme.colors.primary} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.text }}>Modo Escuro</ListItem.Title>
            <ListItem.Subtitle style={{ color: theme.colors.textSecondary }}>Alterar para tema escuro</ListItem.Subtitle>
          </ListItem.Content>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            color={theme.colors.primary}
            trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
          />
        </ListItem>
      </Card>

      <Card containerStyle={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sobre o Aplicativo</Text>
        <View style={styles.aboutSection}>
          <Text style={styles.appVersion}>JusAgenda v1.0.0</Text>
          <Text style={styles.appDescription}>
            Assistente para advogados organizarem prazos, audiências, reuniões e muito mais.
          </Text>
          <Divider style={styles.divider} />
          <Text style={styles.appCopyright}>© 2023 - Todos os direitos reservados</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

export default SettingsScreen; 