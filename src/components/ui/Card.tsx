// src/components/ui/Card.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme, ShadowStyle } from '../../contexts/ThemeContext'; // Importando o hook e o tipo ShadowStyle

type ElevationLevel = 'xs' | 'sm' | 'md' | 'lg' | 'none';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>; // Estilo para o container interno do conteúdo
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  elevation?: ElevationLevel | number; // Aceita níveis predefinidos ou um número para Android
  // Adicione outras props que seu Card possa precisar
  // Ex: headerComponent, footerComponent, etc.
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  contentStyle,
  onPress,
  onLongPress,
  disabled = false,
  elevation = 'sm', // Nível de elevação padrão
}) => {
  const { theme } = useTheme();

  // Função para obter o estilo de sombra com base no nível de elevação
  const getElevationStyle = (): ShadowStyle | ViewStyle => {
    if (typeof elevation === 'number') {
      // Para Android, se um número for passado, use-o diretamente para a propriedade 'elevation'
      // Para iOS, um número direto não se traduz bem para as propriedades de sombra.
      // Poderíamos tentar mapear números para os níveis predefinidos ou aplicar uma sombra genérica.
      // Por simplicidade, se for número, aplicamos apenas para Android.
      return Platform.select({
        android: { elevation: elevation },
        ios: theme.shadows.sm, // Fallback para iOS se um número for fornecido
      }) || {}; // Fallback para objeto vazio
    }

    // Se for um nível de elevação predefinido (string)
    const shadowStyle = theme.shadows[elevation] || theme.shadows.none;

    // No Android, a propriedade 'elevation' é mais performática.
    // No iOS, usamos as propriedades shadowOffset, shadowColor, etc.
    if (Platform.OS === 'android') {
      return { elevation: shadowStyle.elevation };
    }
    return shadowStyle; // Para iOS, retorna o objeto ShadowStyle completo
  };

  const cardBaseStyle: ViewStyle = {
    backgroundColor: theme.colors.card, // Usa a cor 'card' do tema
    borderRadius: theme.radii.md, // Usa o raio 'md' do tema
    // margin: theme.spacing.sm, // Removido margin padrão para dar mais controle ao usuário do componente
  };

  const elevationStyle = getElevationStyle();

  const combinedStyle = StyleSheet.flatten([
    styles.base, // Estilos base que não dependem do tema (se houver)
    cardBaseStyle,
    elevationStyle,
    style, // Estilos passados via props (podem sobrescrever os anteriores)
  ]);

  const internalContentStyle = StyleSheet.flatten([
    styles.contentBase, // Estilo base para o conteúdo interno
    { padding: theme.spacing.md }, // Padding padrão para o conteúdo
    contentStyle,
  ]);


  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;
  const touchableProps = onPress || onLongPress ? { onPress, onLongPress, disabled, activeOpacity: 0.8 } : {};

  return (
    <CardComponent style={combinedStyle} {...touchableProps}>
      <View style={internalContentStyle}>
        {children}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  base: {
    // Estilos que não mudam com o tema, se houver.
    // Ex: overflow: 'hidden', // Se você quiser que o conteúdo não ultrapasse o borderRadius
  },
  contentBase: {
    // Estilos base para o container de conteúdo interno
    // Por exemplo, se você sempre quiser que o conteúdo seja flexível:
    // flex: 1,
  },
  // Não defina cores ou tamanhos dependentes do tema aqui,
  // eles são aplicados dinamicamente em `cardBaseStyle` e `getElevationStyle`.
});

export default Card;
