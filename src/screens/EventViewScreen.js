import React from "react";
import { View, StyleSheet, ScrollView, Share, Alert } from "react-native";
import { Text, Button, Icon, Badge, Divider } from "@rneui/themed";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { useEvents } from "../contexts/EventContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatDateTime, formatFullDate } from "../utils/dateUtils";

const EventViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { events, deleteEvent } = useEvents();
  const { theme, isDarkMode } = useTheme();
  const eventId = route.params?.event?.id;
  const event = route.params?.event || events.find((e) => e.id === eventId);

  React.useEffect(() => {
    if (event?.type) {
      navigation.setOptions({
        title: event.type.charAt(0).toUpperCase() + event.type.slice(1),
      });
    } else {
      navigation.setOptions({ title: "Detalhes do Compromisso" });
    }
  }, [navigation, event]);

  const handleEdit = () => {
    navigation.navigate("EventDetails", { event, editMode: true });
  };

  const handleShare = async () => {
    try {
      const rawDate = event.date || event.data;
      const dataFormatada = rawDate ? formatFullDate(rawDate) : null;
      const horarioFormatado = rawDate ? formatDateTime(rawDate) : null;

      const cliente = event.client || event.cliente || event.title || null;
      const tipo = event.type
        ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
        : "Compromisso";

      let message = `📝 ${tipo}\n\n`;

      if (cliente) message += `👤 Cliente: ${cliente}\n`;
      if (dataFormatada) message += `📅 Data: ${dataFormatada}\n`;
      if (horarioFormatado) message += `⏰ Horário: ${horarioFormatado}\n`;
      if (event.location) message += `📍 Local: ${event.location}\n`;
      if (event.numeroProcesso) message += `🔢 Processo: ${event.numeroProcesso}\n`;
      if (event.competencia) message += `⚖️ Área Jurídica: ${event.competencia}\n`;
      if (event.fase) message += `📂 Fase: ${event.fase}\n`;
      if (event.reu) message += `⚔️ Parte Contrária: ${event.reu}\n`;
      if (event.descricao || event.description)
        message += `📝 Descrição: ${event.descricao || event.description}\n`;

      await Share.share({
        message: message.trim(),
        title: `${tipo} - ${cliente || ""}`.trim(),
      });
    } catch {
      Alert.alert("Erro", "Não foi possível compartilhar o compromisso");
    }
  };

  const handleDelete = () => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este compromisso?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: "Home",
                    state: { index: 0, routes: [{ name: "HomeScreen" }] },
                  },
                ],
              })
            );
          } catch {
            Alert.alert("Erro", "Não foi possível excluir o compromisso");
          }
        },
      },
    ]);
  };

  const handleReminder = () => {
    Alert.alert("Lembrete", "Deseja configurar um lembrete para este compromisso?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () => {
          Alert.alert("Sucesso", "Lembrete configurado com sucesso!");
        },
      },
    ]);
  };

  const getBadgeColor = (prioridade) => {
    if (!prioridade) return "gray";
    const p = prioridade.toLowerCase();
    if (p.includes("alta")) return "red";
    if (p.includes("média") || p.includes("media")) return "orange";
    if (p.includes("baixa")) return "green";
    return "gray";
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: theme.colors.text },
    subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 8 },
    badge: { marginVertical: 8, paddingHorizontal: 10, paddingVertical: 5 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10, color: theme.colors.text },
    infoRow: { marginBottom: 8 },
    label: { fontSize: 14, color: theme.colors.textSecondary },
    value: { fontSize: 16, color: theme.colors.text },
    buttonContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 16,
    },
    button: {
      width: "48%",
      marginVertical: 6,
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonTitle: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      flexWrap: "wrap",
      lineHeight: 20,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{event?.client || event?.cliente || event?.title}</Text>
          <Text style={styles.subtitle}>
            {(event?.type || event?.tipo)
              ? (event?.type || event?.tipo).charAt(0).toUpperCase() + (event?.type || event?.tipo).slice(1)
              : "Compromisso"}
          </Text>
          {event?.prioridade && (
            <Badge
              value={event.prioridade}
              badgeStyle={{
                backgroundColor: getBadgeColor(event.prioridade),
                ...styles.badge,
              }}
              textStyle={{ color: "white" }}
            />
          )}
        </View>

        <View style={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Informações Principais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>
              {formatFullDate(event?.date || event?.data)} às {formatDateTime(event?.date || event?.data)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>{event?.location}</Text>
          </View>
          <Divider style={{ marginVertical: 10 }} />

          <Text style={styles.sectionTitle}>Processo</Text>
          {event?.numeroProcesso && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Número do Processo</Text>
              <Text style={styles.value}>{event.numeroProcesso}</Text>
            </View>
          )}
          {event?.competencia && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Área Jurídica</Text>
              <Text style={styles.value}>{event.competencia}</Text>
            </View>
          )}
          {event?.fase && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fase Processual</Text>
              <Text style={styles.value}>{event.fase}</Text>
            </View>
          )}
          {event?.vara && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Vara</Text>
              <Text style={styles.value}>{event.vara}</Text>
            </View>
          )}
          {event?.comarca && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Comarca</Text>
              <Text style={styles.value}>{event.comarca}</Text>
            </View>
          )}
          {event?.estado && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>{event.estado}</Text>
            </View>
          )}
          {event?.valor && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Valor da Causa</Text>
              <Text style={styles.value}>{event.valor}</Text>
            </View>
          )}
          {event?.honorarios && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Honorários</Text>
              <Text style={styles.value}>{event.honorarios}</Text>
            </View>
          )}
          {event?.prazoDias && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Prazo (dias)</Text>
              <Text style={styles.value}>{event.prazoDias}</Text>
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          <Text style={styles.sectionTitle}>Partes</Text>
          {event?.reu && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Réu / Parte Contrária</Text>
              <Text style={styles.value}>{event.reu}</Text>
            </View>
          )}
          {event?.telefoneCliente && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Telefone do Cliente</Text>
              <Text style={styles.value}>{event.telefoneCliente}</Text>
            </View>
          )}
          {event?.emailCliente && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email do Cliente</Text>
              <Text style={styles.value}>{event.emailCliente}</Text>
            </View>
          )}
          {event?.telefoneReu && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Telefone da Parte Contrária</Text>
              <Text style={styles.value}>{event.telefoneReu}</Text>
            </View>
          )}
          {event?.emailReu && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email da Parte Contrária</Text>
              <Text style={styles.value}>{event.emailReu}</Text>
            </View>
          )}
          {event?.juiz && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Juiz</Text>
              <Text style={styles.value}>{event.juiz}</Text>
            </View>
          )}
          {event?.promotor && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Promotor</Text>
              <Text style={styles.value}>{event.promotor}</Text>
            </View>
          )}
          {event?.perito && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Perito</Text>
              <Text style={styles.value}>{event.perito}</Text>
            </View>
          )}
          {event?.prepostoCliente && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Preposto do Cliente</Text>
              <Text style={styles.value}>{event.prepostoCliente}</Text>
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          <Text style={styles.sectionTitle}>Extras</Text>
          {event?.testemunhas && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Testemunhas</Text>
              <Text style={styles.value}>{event.testemunhas}</Text>
            </View>
          )}
          {event?.documentosNecessarios && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Documentos Necessários</Text>
              <Text style={styles.value}>{event.documentosNecessarios}</Text>
            </View>
          )}
          {event?.observacoes && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Observações</Text>
              <Text style={styles.value}>{event.observacoes}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingBottom: 200 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 12 }}>
          <Button
            onPress={handleEdit}
            icon={{ name: "edit", color: "white", size: 28 }}
            buttonStyle={[styles.button, { backgroundColor: theme.colors.primary, width: 60, height: 60, borderRadius: 30 }]}
            containerStyle={{ marginHorizontal: 12 }}
          />
          <Button
            onPress={handleShare}
            icon={{ name: "share", color: "white", size: 28 }}
            buttonStyle={[styles.button, { backgroundColor: "#03dac6", width: 60, height: 60, borderRadius: 30 }]}
            containerStyle={{ marginHorizontal: 12 }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Button
            onPress={handleReminder}
            icon={{ name: "alarm", color: "white", size: 28 }}
            buttonStyle={[styles.button, { backgroundColor: "#FFA500", width: 60, height: 60, borderRadius: 30 }]}
            containerStyle={{ marginHorizontal: 12 }}
          />
          <Button
            onPress={handleDelete}
            icon={{ name: "delete", color: "white", size: 28 }}
            buttonStyle={[styles.button, { backgroundColor: theme.colors.error, width: 60, height: 60, borderRadius: 30 }]}
            containerStyle={{ marginHorizontal: 12 }}
          />
        </View>
      </View>
    </View>
  );
};

export default EventViewScreen;
