// src/components/ui/Header.tsx
import React, { ReactElement, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para o ícone de voltar

interface HeaderProps {
  title?: string;
  titleComponent?: ReactElement; // Para um título customizado (ex: com logo)
  leftComponent?: ReactElement;
  rightComponent?: ReactElement;
  onBackPress?: () => void; // Se fornecido, mostra um botão de voltar padrão (a menos que leftComponent seja fornecido)
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  noBorder?: boolean; // Para remover a borda inferior
  transparent?: boolean; // Para um cabeçalho transparente
}

// Componente de botão de voltar padrão
const HeaderBackButton: React.FC<{ onPress: () => void; color: string }> = ({ onPress, color }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <MaterialCommunityIcons name="arrow-left" size={24} color={color} />
  </TouchableOpacity>
);

const Header: React.FC<HeaderProps> = ({
  title,
  titleComponent,
  leftComponent,
  rightComponent,
  onBackPress,
  style,
  titleStyle,
  noBorder = false,
  transparent = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const headerBaseStyle: ViewStyle = {
    paddingTop: insets.top, // Aplica o padding do safe area no topo
    backgroundColor: transparent ? 'transparent' : theme.colors.background, // Cor de fundo do tema ou transparente
    borderBottomWidth: noBorder || transparent ? 0 : StyleSheet.hairlineWidth,
    borderBottomColor: transparent ? 'transparent' : theme.colors.border,
  };

  const titleBaseStyle: TextStyle = {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold', // Ajuste de fontWeight para iOS/Android
    fontFamily: theme.typography.fontFamily.bold, // Usar a fonte bold do tema
  };

  // Determina o componente esquerdo
  let finalLeftComponent: ReactNode = leftComponent;
  if (!leftComponent && onBackPress) {
    finalLeftComponent = <HeaderBackButton onPress={onBackPress} color={theme.colors.text} />;
  }

  return (
    <View style={[styles.container, headerBaseStyle, style]}>
      <View style={styles.leftContainer}>
        {finalLeftComponent}
      </View>
      <View style={styles.titleContainer}>
        {titleComponent ? titleComponent : (
          title && <Text style={[styles.title, titleBaseStyle, titleStyle]} numberOfLines={1}>{title}</Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? 44 : 56, // Altura padrão do header (sem o safe area)
    // O paddingTop do safe area é adicionado dinamicamente
    paddingHorizontal: 8, // Padding horizontal base
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    // backgroundColor: 'rgba(255,0,0,0.2)', // Debug
  },
  titleContainer: {
    flex: 3, // Dá mais espaço para o título
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,255,0,0.2)', // Debug
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    // backgroundColor: 'rgba(0,0,255,0.2)', // Debug
  },
  title: {
    textAlign: 'center',
  },
  button: {
    padding: 8, // Área de toque para o botão
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
