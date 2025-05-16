import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Button, CheckBox, Card, Icon } from "@rneui/themed";
import { useEvents } from "../contexts/EventCrudContext"; // Event import removed
import EmailService from "../services/EmailService";
import { formatDate } from "../utils/dateUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext"; // Theme type removed from here as it's not used directly
import InputDialog from "../components/ui/InputDialog";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message'; // Assuming this will be installed

const EMAIL_STORAGE_KEY = "@jusagenda_email";

const componentColors = { // Defined for fallback
    white: '#FFFFFF',
    defaultPlaceholder: '#A9A9A9',
    defaultDisabledText: '#C0C0C0',
    transparent: 'transparent',
};

const EmailSyncScreen = () => {
  const { events } = useEvents();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfigEventId, setAlertConfigEventId] = useState<string | null>(null);
  const [isAlertConfigDialogVisible, setIsAlertConfigDialogVisible] = useState(false);

  useEffect(() => {
    const initialize = async () => {
        setIsLoading(true);
        try {
            const savedEmail = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
            if (savedEmail) {
                setEmail(savedEmail);
            }
            const available = await EmailService.isAvailable();
            setIsEmailAvailable(available);
            if (!available) {
                Alert.alert(
                "Aviso de Email",
                "Não foi possível detectar um aplicativo de email configurado. A sincronização e os alertas por email podem não funcionar."
                );
            }
        } catch (error) {
             console.error("Erro na inicialização da tela de Email:", error);
             Alert.alert("Erro", "Não foi possível carregar as configurações de email.");
        } finally {
            setIsLoading(false);
        }
    };
    initialize();
  }, []);

  const handleEmailChange = useCallback(async (text: string) => {
    setEmail(text);
    try {
        await AsyncStorage.setItem(EMAIL_STORAGE_KEY, text);
    } catch (error) {
        console.error("Erro ao salvar email no AsyncStorage:", error);
    }
  }, []);

  const validateEmail = (emailToValidate: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(emailToValidate).toLowerCase());
  };

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents((currentSelectedIds) => {
      const newSelectedIds = new Set(currentSelectedIds);
      if (newSelectedIds.has(eventId)) {
        newSelectedIds.delete(eventId);
      } else {
        newSelectedIds.add(eventId);
      }
      return Array.from(newSelectedIds);
    });
  }, []);

  const selectAllEvents = useCallback(() => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map((event) => event.id));
    }
  }, [events, selectedEvents.length]);

  const handleSyncEvents = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Email Inválido", "Por favor, insira um endereço de email válido para continuar.");
      return;
    }
    if (selectedEvents.length === 0) {
      Alert.alert("Nenhum Evento Selecionado", "Selecione pelo menos um compromisso para sincronizar.");
      return;
    }
    if (!isEmailAvailable) {
         Alert.alert("Email Indisponível", "Não é possível sincronizar pois nenhum app de email foi detectado.");
         return;
    }

    setIsLoading(true);
    try {
      const eventsToSync = events.filter((event) => selectedEvents.includes(event.id));
      const result = await EmailService.syncEventsViaEmail(eventsToSync, email);

      if (result.success) {
        Toast.show({
            type: 'success',
            text1: "Eventos Enviados",
            text2: result.message || "Os compromissos selecionados foram enviados para o seu email.",
        });
        setSelectedEvents([]);
      } else {
        Alert.alert("Erro na Sincronização", result.error || "Não foi possível enviar o email. Verifique sua conexão e o app de email.");
      }
    } catch (error: unknown) {
      console.error("Erro em handleSyncEvents:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao sincronizar.";
      Alert.alert("Erro Inesperado", message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAlertConfigDialog = (eventId: string) => {
     if (!validateEmail(email)) {
      Alert.alert("Email Inválido", "Insira um email válido antes de configurar alertas.");
      return;
    }
     if (!isEmailAvailable) {
         Alert.alert("Email Indisponível", "Não é possível configurar alertas pois nenhum app de email foi detectado.");
         return;
    }
    setAlertConfigEventId(eventId);
    setIsAlertConfigDialogVisible(true);
  };

  const handleConfigureAlertSubmit = async (minutesInput: string) => {
    setIsAlertConfigDialogVisible(false);
    const minutesBefore = parseInt(minutesInput, 10);

    if (!alertConfigEventId || isNaN(minutesBefore) || minutesBefore <= 0) {
      Alert.alert("Valor Inválido", "Por favor, insira um número de minutos válido (maior que zero).");
      setAlertConfigEventId(null);
      return;
    }

    const eventToAlert = events.find((e) => e.id === alertConfigEventId);
    setAlertConfigEventId(null);

    if (!eventToAlert) {
        Alert.alert("Erro", "Compromisso não encontrado.");
        return;
    }

    setIsLoading(true);
    try {
      const result = await EmailService.configureEmailAlert(eventToAlert, email, minutesBefore);
      if (result.success) {
        Toast.show({ type: 'success', text1: "Alerta Configurado", text2: result.message });
      } else {
        Alert.alert("Erro ao Configurar", result.error || "Não foi possível configurar o alerta de email.");
      }
    } catch (error: unknown) {
      console.error("Erro em configureEmailAlert:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao configurar o alerta.";
      Alert.alert("Erro Inesperado", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card containerStyle={[styles.emailCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Sincronização com Email</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          Insira seu email para sincronizar e receber alertas.
        </Text>
        <TextInput
          style={[styles.emailInput, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.background }]}
          placeholder="Seu email"
          placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholder}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          editable={!isLoading}
        />
         {!isEmailAvailable && (
             <Text style={[styles.warningText, {color: theme.colors.warning}]}>App de email não detectado.</Text>
         )}
      </Card>

      <View style={styles.selectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Selecione os Compromissos</Text>
        {events.length > 0 && (
             <Button
                title={ selectedEvents.length === events.length ? "Desmarcar Todos" : "Selecionar Todos" }
                type="clear"
                onPress={selectAllEvents}
                titleStyle={[styles.selectAllButtonTitle, { color: theme.colors.primary }]}
                disabled={isLoading}
             />
        )}
      </View>

      <ScrollView style={styles.eventsList}>
        {isLoading && events.length === 0 ? (
             <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator}/>
        ) : events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} containerStyle={[styles.eventCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.eventHeader}>
                <CheckBox
                  checked={selectedEvents.includes(event.id)}
                  onPress={() => toggleEventSelection(event.id)}
                  containerStyle={styles.checkbox}
                  checkedColor={theme.colors.primary}
                  uncheckedColor={theme.colors.textSecondary}
                  size={24}
                  disabled={isLoading}
                />
                <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{event.title || "Sem Título"}</Text>
              </View>
              <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>
                {formatDate(event.date)}
              </Text>
              <View style={[styles.eventActions, { borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => openAlertConfigDialog(event.id)}
                  disabled={!isEmailAvailable || isLoading}
                  accessibilityLabel={`Configurar alerta por email para ${event.title}`}
                >
                  <Icon
                    name="email-alert-outline"
                    type="material-community"
                    size={20}
                    color={isEmailAvailable ? theme.colors.primary : (theme.colors.textSecondary || componentColors.defaultDisabledText)}
                  />
                  <Text style={[styles.alertButtonText, { color: isEmailAvailable ? theme.colors.primary : (theme.colors.textSecondary || componentColors.defaultDisabledText) }]}>
                    Alerta Email
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Text style={[styles.noEventsText, { color: theme.colors.textSecondary }]}>
            Nenhum compromisso encontrado para sincronizar.
          </Text>
        )}
      </ScrollView>

      <Button
        title="Sincronizar Selecionados por Email"
        containerStyle={styles.syncButtonContainer}
        buttonStyle={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
        disabled={!isEmailAvailable || isLoading || selectedEvents.length === 0}
        loading={isLoading}
        onPress={handleSyncEvents}
        icon={{ name: "send-outline", type:"material-community", color: componentColors.white }}
        titleStyle={{color: componentColors.white}}
      />

      <InputDialog
        visible={isAlertConfigDialogVisible}
        title="Minutos de Antecedência"
        message="Digite quantos minutos antes do compromisso deseja receber o alerta por email."
        placeholder="Ex: 30"
        keyboardType="number-pad"
        defaultValue="30"
        submitText="Configurar Alerta"
        onSubmit={handleConfigureAlertSubmit}
        onCancel={() => {
            setIsAlertConfigDialogVisible(false);
            setAlertConfigEventId(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  alertButton: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertButtonText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "left",
  },
   cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
  },
  checkbox: {
    backgroundColor: componentColors.transparent, // Added for clarity and consistency
    borderWidth: 0,
    margin: 0,
    marginRight: 8,
    padding: 0,
  },
  container: {
    flex: 1,
  },
  emailCard: {
    borderRadius: 12,
    elevation: 3,
    margin: 15, // Corrected order
    padding: 16, // Added padding based on original error
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  emailInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  eventActions: {
    borderTopWidth: StyleSheet.hairlineWidth, // Corrected order
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
  },
  eventCard: {
    borderRadius: 8,
    elevation: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 32,
  },
  eventHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  eventsList: {
    flex: 1,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noEventsText: {
    fontSize: 16,
    marginVertical: 40,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectAllButtonTitle: {
    fontSize: 14,
  },
  selectionHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  syncButton: {
    borderRadius: 10,
    paddingVertical: 14,
  },
  syncButtonContainer: {
    margin: 16,
  },
  warningText: {
      fontSize: 13,
      marginTop: 8,
      textAlign: 'center',
  },
});

export default EmailSyncScreen;
