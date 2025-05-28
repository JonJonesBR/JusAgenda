// src/screens/SyncExportOptionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, Theme } from '../contexts/ThemeContext';
import { Header } from '../components/ui'; // Usando o Header de UI
import { SyncStackParamList } from '../navigation/stacks/SyncStack'; // Ajuste para a sua Stack Param List
import { ROUTES } from '../constants';

// Tipagem para a prop de navegação
type SyncExportOptionsScreenNavigationProp = StackNavigationProp<SyncStackParamList, typeof ROUTES.SYNC_EXPORT_OPTIONS>;

interface OptionItemProps {
  title: string;
  description: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  theme: Theme; // Passando o tema para estilização interna
}

const OptionButton: React.FC<OptionItemProps> = ({ title, description, iconName, onPress, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          // Aplicando sombras do tema
          ...(Platform.OS === 'ios' ? theme.shadows.sm : { elevation: theme.shadows.sm.elevation }),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionIconContainer}>
        <MaterialCommunityIcons name={iconName} size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {title}
        </Text>
        <Text style={[styles.optionDescription, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
          {description}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );
};

const SyncExportOptionsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SyncExportOptionsScreenNavigationProp>();

  const options = [
    {
      title: 'Sincronizar com Email',
      description: 'Configure alertas de eventos e sincronize sua agenda por email.',
      iconName: 'email-sync-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      route: ROUTES.EMAIL_SYNC,
    },
    {
      title: 'Exportar Dados',
      description: 'Exporte seus eventos em formatos como Excel, PDF, CSV, etc.',
      iconName: 'file-export-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      route: ROUTES.EXPORT,
    },
    // Adicione mais opções aqui, se necessário
    // {
    //   title: 'Backup na Nuvem',
    //   description: 'Configure backups automáticos dos seus dados na nuvem.',
    //   iconName: 'cloud-upload-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
    //   route: ROUTES.CLOUD_BACKUP_CONFIG, // Exemplo de rota
    // },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/*
        O Header para esta tela é definido na SyncStack.tsx com o título "Sincronizar e Exportar".
        Se quiser um header diferente ou nenhum header da stack, ajuste as opções na SyncStack.tsx
        para a rota SYNC_EXPORT_OPTIONS.
        Exemplo: options={{ headerShown: false }} na SyncStack.tsx para esta rota.
        Se precisar de um header customizado aqui:
        <Header title="Opções de Sincronização e Exportação" />
      */}
      <ScrollView contentContainerStyle={[styles.scrollContainer, {padding: theme.spacing.md}]}>
        <Text style={[styles.screenTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold, marginBottom: theme.spacing.xs }]}>
          Gerenciar Dados
        </Text>
        <Text style={[styles.screenSubtitle, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular, marginBottom: theme.spacing.lg }]}>
          Escolha uma opção abaixo para sincronizar ou exportar suas informações.
        </Text>

        {options.map((option) => (
          <OptionButton
            key={option.route}
            title={option.title}
            description={option.description}
            iconName={option.iconName}
            onPress={() => navigation.navigate(option.route as any)} // 'as any' para flexibilidade de rota, mas idealmente tipado
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    // padding é definido dinamicamente com o tema
  },
  screenTitle: {
    fontSize: 26, // Usar theme.typography
    // fontFamily e marginBottom são dinâmicos
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 15, // Usar theme.typography
    textAlign: 'center',
    // fontFamily e marginBottom são dinâmicos
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // Usar theme.spacing.md
    borderRadius: 12, // Usar theme.radii.lg
    marginBottom: 16, // Usar theme.spacing.md
    borderWidth: 1,
    // backgroundColor, borderColor e sombras são dinâmicos
  },
  optionIconContainer: {
    marginRight: 16, // Usar theme.spacing.md
    padding: 8, // Usar theme.spacing.sm
    borderRadius: 24, // Metade do tamanho do ícone + padding
    backgroundColor: 'rgba(0,0,0,0.05)', // Um fundo leve para o ícone, ajustar com o tema
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17, // Usar theme.typography.fontSize.lg ou md
    // fontFamily e color são dinâmicos
    marginBottom: 4, // Usar theme.spacing.xs
  },
  optionDescription: {
    fontSize: 13, // Usar theme.typography.fontSize.xs ou sm
    // fontFamily e color são dinâmicos
    lineHeight: 18, // Usar theme.typography.lineHeight
  },
});

export default SyncExportOptionsScreen;
