import React from "react";
import {
    // View, // Removido View
    StyleSheet,
    TouchableOpacity,
    Text, // Importado de react-native
    ScrollView, // Adicionado para caso de telas pequenas
    // Platform, // Removed Platform as it's not directly used here
} from "react-native";
import { Icon } from "@rneui/themed"; // Apenas Icon é usado do RNE
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context"; // Para safe area

// Tipagem para o navegador que contém estas telas
// (Pode ser uma Stack ou Tab Navigator)
type AppNavigatorParamList = {
  SyncExportOptions: undefined;
  EmailSync: undefined;
  Export: undefined;
  Feedback: undefined;
  // Adicionar outras telas
};

type ScreenNavigationProp = NavigationProp<AppNavigatorParamList>;

const SyncExportOptionsScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const { theme } = useTheme();

  // Constantes de design do tema
  const ds = {
    spacing: theme.spacing,
    typography: theme.typography,
    radii: theme.radii,
    shadows: theme.shadows,
  };

  // Função auxiliar para criar botões de opção
  const OptionButton: React.FC<{label: string; iconName: string; iconType?: string; screenName: keyof AppNavigatorParamList; accessibilityHint: string}> =
    ({ label, iconName, iconType = "material", screenName, accessibilityHint }) => (
        <TouchableOpacity
            style={[
                styles.optionButtonBase,
                {
                    backgroundColor: theme.colors.card,
                    borderRadius: ds.radii.xl, // Maior raio
                    marginBottom: ds.spacing.xl, // Maior margem
                    paddingVertical: ds.spacing.lg, // Ajustar padding
                    paddingHorizontal: ds.spacing.lg,
                    borderColor: theme.colors.border,
                },
                ds.shadows.medium // Aplicar sombra
            ]}
            onPress={() => navigation.navigate(screenName)}
            activeOpacity={0.7}
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
        >
            <Icon
                name={iconName}
                type={iconType}
                size={28}
                color={theme.colors.primary}
                containerStyle={{ marginRight: ds.spacing.lg }} // Maior margem
            />
            <Text style={[styles.optionTextBase, { color: theme.colors.text, fontSize: ds.typography.fontSize.lg, fontFamily: ds.typography.fontFamily.medium }]}>
                {label}
            </Text>
            <Icon // Ícone de chevron indicando navegação
                name="chevron-right"
                type="material-community"
                size={24}
                color={theme.colors.textSecondary} // Replaced grey3
            />
      </TouchableOpacity>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
        {/* Header pode ser da Stack ou um customizado aqui */}
        {/* <Header title="Gerenciar Dados" /> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.titleBase, { color: theme.colors.text, fontSize: ds.typography.fontSize.xl * 1.2, fontFamily: ds.typography.fontFamily.bold, marginBottom: ds.spacing.xxl }]}>
            Gerenciar Dados
        </Text>

        <OptionButton
            label="Sincronizar Compromissos"
            iconName="sync"
            screenName="EmailSync"
            accessibilityHint="Navegar para a tela de sincronização por email"
        />

        <OptionButton
            label="Exportar Compromissos"
            iconName="file-download"
            screenName="Export"
            accessibilityHint="Navegar para a tela de exportação de dados"
        />

        <OptionButton
            label="Enviar Feedback"
            iconName="feedback"
            screenName="Feedback"
            accessibilityHint="Navegar para a tela de envio de feedback"
        />

      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos base (sem dependência direta de theme/ds)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionButtonBase: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    width: "100%", // Ocupar largura total (considerando padding do container)
    // backgroundColor, borderRadius, marginBottom, padding*, shadow*, borderColor são dinâmicos
  },
  optionTextBase: {
    flex: 1,
    fontWeight: "600", // Ocupa espaço disponível entre os ícones
    // fontSize, color, fontFamily são dinâmicos
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1, // Para centralizar verticalmente se o conteúdo for pequeno
    padding: 20, // Padding geral
    paddingTop: 30, // Mais espaço no topo
  },
  titleBase: {
    fontWeight: "bold",
    textAlign: "center",
    // fontSize, color, marginBottom, fontFamily são dinâmicos
  },
});

export default SyncExportOptionsScreen;
