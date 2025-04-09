import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
} from "react-native";
import { Text, Input, Button, Icon, Badge, Divider } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { useEvents } from "../contexts/EventContext";
import { useTheme } from "../contexts/ThemeContext";
import * as NotificationService from "../services/notifications";
import {
  COLORS,
  EVENT_TYPES,
  AREAS_JURIDICAS,
  FASES_PROCESSUAIS,
  PRIORIDADES,
  formatarNumeroProcesso,
} from "../utils/common";
import Selector from "../components/Selector";

const TIPOS_COMPROMISSO = Object.entries(EVENT_TYPES).reduce((acc, [k, v]) => {
  const label = v
    .split("")
    .map((c, i) => (i === 0 ? c.toUpperCase() : c))
    .join("")
    .replace(/([A-Z])/g, " $1")
    .trim();
  return { ...acc, [v]: label };
}, {});

const COMPETENCIAS = Object.entries(AREAS_JURIDICAS).reduce((acc, [k, v]) => {
  const label = v.charAt(0).toUpperCase() + v.slice(1);
  return { ...acc, [v]: label };
}, {});

const PRIORIDADES_FORMATADAS = Object.entries(PRIORIDADES).reduce(
  (acc, [k, v]) => {
    const label = v.charAt(0).toUpperCase() + v.slice(1);
    return { ...acc, [v]: label };
  },
  {}
);

const formatDate = (dt) => {
  const date = new Date(dt);
  return isNaN(date)
    ? ""
    : date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const formatTime = (dt) => {
  const date = new Date(dt);
  return isNaN(date)
    ? ""
    : date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
};

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent, deleteEvent, refreshEvents } = useEvents();
  const { theme, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    cliente: "",
    tipo: "",
    date: new Date(),
    local: "",
    descricao: "",
    numeroProcesso: "",
    competencia: "",
    fase: "",
    prioridade: PRIORIDADES.MEDIA,
    vara: "",
    comarca: "",
    estado: "",
    reu: "",
    telefoneCliente: "",
    emailCliente: "",
    telefoneReu: "",
    emailReu: "",
    juiz: "",
    promotor: "",
    perito: "",
    prepostoCliente: "",
    testemunhas: "",
    documentosNecessarios: "",
    observacoes: "",
    valor: "",
    honorarios: "",
    prazoDias: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const initialEditMode = route.params?.editMode === true;
  const [isViewMode, setIsViewMode] = useState(!(initialEditMode || !editingEvent));
  const [activeSection, setActiveSection] = useState("main");

  useEffect(() => {
    navigation.setOptions({
      title: editingEvent
        ? isViewMode
          ? "Detalhes do Compromisso"
          : "Editar Compromisso"
        : "Novo Compromisso",
    });

    if (editingEvent) {
      let parsedDate = editingEvent.date instanceof Date ? editingEvent.date : new Date(editingEvent.date);
      if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) parsedDate = new Date();

      setFormData((prev) => ({
        ...prev,
        cliente: editingEvent.cliente ?? prev.cliente,
        tipo: editingEvent.tipo ?? prev.tipo,
        date: parsedDate,
        local: editingEvent.local ?? prev.local,
        descricao: editingEvent.descricao ?? prev.descricao,
        numeroProcesso: editingEvent.numeroProcesso ?? prev.numeroProcesso,
        competencia: editingEvent.competencia ?? prev.competencia,
        fase: editingEvent.fase ?? prev.fase,
        prioridade: editingEvent.prioridade ?? prev.prioridade,
        vara: editingEvent.vara ?? prev.vara,
        comarca: editingEvent.comarca ?? prev.comarca,
        estado: editingEvent.estado ?? prev.estado,
        reu: editingEvent.reu ?? prev.reu,
        telefoneCliente: editingEvent.telefoneCliente ?? prev.telefoneCliente,
        emailCliente: editingEvent.emailCliente ?? prev.emailCliente,
        telefoneReu: editingEvent.telefoneReu ?? prev.telefoneReu,
        emailReu: editingEvent.emailReu ?? prev.emailReu,
        juiz: editingEvent.juiz ?? prev.juiz,
        promotor: editingEvent.promotor ?? prev.promotor,
        perito: editingEvent.perito ?? prev.perito,
        prepostoCliente: editingEvent.prepostoCliente ?? prev.prepostoCliente,
        testemunhas: editingEvent.testemunhas ?? prev.testemunhas,
        documentosNecessarios: editingEvent.documentosNecessarios ?? prev.documentosNecessarios,
        observacoes: editingEvent.observacoes ?? prev.observacoes,
        valor: editingEvent.valor ?? prev.valor,
        honorarios: editingEvent.honorarios ?? prev.honorarios,
        prazoDias: editingEvent.prazoDias ?? prev.prazoDias,
      }));
    }
  }, [navigation, editingEvent, isViewMode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "numeroProcesso") {
      const formatted = formatarNumeroProcesso(value);
      if (formatted !== value) {
        setFormData((prev) => ({ ...prev, numeroProcesso: formatted }));
      }
    }
  };

  const handleSave = async () => {
    if (!formData.cliente.trim()) {
      Alert.alert("Erro", 'O campo "Cliente" é obrigatório.');
      return;
    }
    if (!formData.tipo) {
      Alert.alert("Erro", 'O campo "Tipo de Compromisso" é obrigatório.');
      return;
    }
    if (!formData.date) {
      Alert.alert("Erro", "A data do compromisso é obrigatória.");
      return;
    }

    setIsSaving(true);
    try {
      const eventData = {
        ...formData,
        title: formData.cliente,
        type: formData.tipo,
        data: formData.date,
      };

      let success = false;
      if (editingEvent && editingEvent.id) {
        success = await updateEvent({ ...eventData, id: editingEvent.id });
      } else {
        success = await addEvent(eventData);
      }

      if (!success) throw new Error("Falha ao salvar o compromisso.");

      await refreshEvents();

      Alert.alert(
        "Compromisso salvo com sucesso!",
        "O que deseja fazer agora?",
        [
          {
            text: "Tela Inicial",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Home",
                      state: {
                        index: 0,
                        routes: [{ name: "HomeScreen" }],
                      },
                    },
                  ],
                })
              );
            },
          },
          {
            text: "Compartilhar",
            onPress: async () => {
              try {
                const message = `Compromisso: ${formData.cliente}\nTipo: ${TIPOS_COMPROMISSO[formData.tipo]}\nData: ${formatDate(formData.date)} às ${formatTime(formData.date)}\nLocal: ${formData.local}\nDescrição: ${formData.descricao}`;
                await Share.share({ message });
              } catch (error) {
                Alert.alert("Erro", "Não foi possível compartilhar.");
              } finally {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "Home",
                        state: {
                          index: 0,
                          routes: [{ name: "HomeScreen" }],
                        },
                      },
                    ],
                  })
                );
              }
            },
          },
          {
            text: "Agendar Lembrete",
            onPress: async () => {
              try {
                const reminderTime = new Date(formData.date.getTime());
                reminderTime.setMinutes(reminderTime.getMinutes() - 30);
                const now = new Date();
                if (reminderTime <= now) {
                  throw new Error("Não é possível configurar um lembrete para o passado.");
                }
                await NotificationService.scheduleNotification({
                  title: `Lembrete: ${formData.cliente}`,
                  body: `${formData.tipo} em ${formatTime(formData.date)}${formData.local ? ` em ${formData.local}` : ""}`,
                  time: reminderTime.getTime(),
                });
                Alert.alert("Lembrete Configurado", "Você receberá uma notificação 30 minutos antes do compromisso.");
              } catch (error) {
                Alert.alert("Erro", error.message || "Não foi possível configurar o lembrete.");
              } finally {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "Home",
                        state: {
                          index: 0,
                          routes: [{ name: "HomeScreen" }],
                        },
                      },
                    ],
                  })
                );
              }
            },
          },
        ]
      );
      setIsViewMode(true);
    } catch (e) {
      Alert.alert("Erro", e.message || "Erro ao salvar compromisso.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Confirmar", "Deseja realmente excluir este compromisso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(editingEvent.id);
            await refreshEvents();
            navigation.goBack();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir o compromisso.");
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      const message = `Compromisso: ${formData.cliente}\nTipo: ${TIPOS_COMPROMISSO[formData.tipo]}\nData: ${formatDate(formData.date)} às ${formatTime(formData.date)}\nLocal: ${formData.local}\nDescrição: ${formData.descricao}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar.");
    }
  };

  const renderBadgePrioridade = () => {
    const prioridade = formData.prioridade;
    let color = "gray";
    if (prioridade === PRIORIDADES.ALTA) color = "red";
    else if (prioridade === PRIORIDADES.MEDIA) color = "orange";
    else if (prioridade === PRIORIDADES.BAIXA) color = "green";

    return (
      <Badge
        value={PRIORIDADES_FORMATADAS[prioridade]}
        badgeStyle={{ backgroundColor: color, paddingHorizontal: 10, paddingVertical: 5 }}
        textStyle={{ fontSize: 12 }}
      />
    );
  };

  const renderViewMode = () => (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text h4 style={{ marginBottom: 10 }}>{formData.cliente}</Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Tipo: </Text>
        {TIPOS_COMPROMISSO[formData.tipo]}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Data: </Text>
        {formatDate(formData.date)} às {formatTime(formData.date)}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Local: </Text>
        {formData.local}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Descrição: </Text>
        {formData.descricao}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Número do Processo: </Text>
        {formData.numeroProcesso}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Área Jurídica: </Text>
        {COMPETENCIAS[formData.competencia]}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Fase Processual: </Text>
        {formData.fase}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Valor da Causa: </Text>
        {formData.valor}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Honorários: </Text>
        {formData.honorarios}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Partes: </Text>
        {formData.reu}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Testemunhas: </Text>
        {formData.testemunhas}
      </Text>
      <Text style={{ marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold" }}>Observações: </Text>
        {formData.observacoes}
      </Text>

      <View style={{ marginVertical: 10 }}>{renderBadgePrioridade()}</View>

      <Divider style={{ marginVertical: 15 }} />

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          title="Editar"
          icon={{ name: "edit", color: "white" }}
          onPress={() => setIsViewMode(false)}
        />
        <Button
          title="Excluir"
          icon={{ name: "delete", color: "white" }}
          buttonStyle={{ backgroundColor: theme.colors.error }}
          onPress={handleDelete}
        />
        <Button
          title="Compartilhar"
          icon={{ name: "share", color: "white" }}
          onPress={handleShare}
        />
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <Input
          label="Cliente *"
          value={formData.cliente}
          onChangeText={(v) => handleInputChange("cliente", v)}
        />
        <Selector
          label="Tipo de Compromisso *"
          selectedValue={formData.tipo}
          options={TIPOS_COMPROMISSO}
          onSelect={(v) => handleInputChange("tipo", v)}
        />
        <View style={{ marginVertical: 20 }}>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Data *</Text>
          <Button
            title={formatDate(formData.date)}
            onPress={() => setShowDatePicker(true)}
            type="outline"
            buttonStyle={{ paddingVertical: 12 }}
          />
          {showDatePicker && (
            <>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, d) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (d) {
                    const newDate = new Date(formData.date);
                    newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                    setFormData((prev) => ({ ...prev, date: newDate }));
                    setTempDate(d);
                  }
                }}
                locale="pt-BR"
              />
              {Platform.OS === "ios" && (
                <Button
                  title="Confirmar Data"
                  onPress={() => {
                    const newDate = new Date(formData.date);
                    newDate.setFullYear(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
                    setFormData((prev) => ({ ...prev, date: newDate }));
                    setShowDatePicker(false);
                  }}
                  buttonStyle={{ marginTop: 10 }}
                />
              )}
            </>
          )}
        </View>
        <View style={{ marginVertical: 20 }}>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Hora *</Text>
          <Button
            title={formatTime(formData.date)}
            onPress={() => setShowTimePicker(true)}
            type="outline"
            buttonStyle={{ paddingVertical: 12 }}
          />
          {showTimePicker && (
            <>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, d) => {
                  if (Platform.OS === "android") setShowTimePicker(false);
                  if (d) {
                    const newDate = new Date(formData.date);
                    newDate.setHours(d.getHours(), d.getMinutes());
                    setFormData((prev) => ({ ...prev, date: newDate }));
                    setTempDate(d);
                  }
                }}
                locale="pt-BR"
              />
              {Platform.OS === "ios" && (
                <Button
                  title="Confirmar Hora"
                  onPress={() => {
                    const newDate = new Date(formData.date);
                    newDate.setHours(tempDate.getHours(), tempDate.getMinutes());
                    setFormData((prev) => ({ ...prev, date: newDate }));
                    setShowTimePicker(false);
                  }}
                  buttonStyle={{ marginTop: 10 }}
                />
              )}
            </>
          )}
        </View>
        <Input
          label="Local"
          value={formData.local}
          onChangeText={(v) => handleInputChange("local", v)}
        />
        <Selector
          label="Prioridade"
          selectedValue={formData.prioridade}
          options={PRIORIDADES_FORMATADAS}
          onSelect={(v) => handleInputChange("prioridade", v)}
        />
        <Input
          label="Descrição"
          value={formData.descricao}
          onChangeText={(v) => handleInputChange("descricao", v)}
          multiline
        />
        <Input
          label="Número do Processo"
          value={formData.numeroProcesso}
          onChangeText={(v) => handleInputChange("numeroProcesso", v)}
        />
        <Selector
          label="Área Jurídica"
          selectedValue={formData.competencia}
          options={COMPETENCIAS}
          onSelect={(v) => handleInputChange("competencia", v)}
        />
        <Selector
          label="Fase Processual"
          selectedValue={formData.fase}
          options={FASES_PROCESSUAIS}
          onSelect={(v) => handleInputChange("fase", v)}
        />
        <Input
          label="Valor da Causa"
          value={formData.valor}
          onChangeText={(v) => handleInputChange("valor", v)}
          keyboardType="numeric"
        />
        <Input
          label="Honorários"
          value={formData.honorarios}
          onChangeText={(v) => handleInputChange("honorarios", v)}
          keyboardType="numeric"
        />
        <Input
          label="Réu/Parte Contrária"
          value={formData.reu}
          onChangeText={(v) => handleInputChange("reu", v)}
        />
        <Input
          label="Testemunhas"
          value={formData.testemunhas}
          onChangeText={(v) => handleInputChange("testemunhas", v)}
          multiline
        />
        <Input
          label="Observações"
          value={formData.observacoes}
          onChangeText={(v) => handleInputChange("observacoes", v)}
          multiline
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 20 }}>
        <Button
          title="Cancelar"
          type="outline"
          onPress={() => {
            if (editingEvent) setIsViewMode(true);
            else navigation.goBack();
          }}
        />
        <Button
          title="Salvar"
          onPress={handleSave}
          loading={isSaving}
        />
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {isViewMode ? renderViewMode() : renderEditMode()}
    </KeyboardAvoidingView>
  );
};

export default EventDetailsScreen;
