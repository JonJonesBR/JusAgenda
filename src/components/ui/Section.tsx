// src/components/ui/Section.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionProps {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>; // Estilo para o container da seção principal
  titleStyle?: StyleProp<TextStyle>; // Estilo para o texto do título
  contentStyle?: StyleProp<ViewStyle>; // Estilo para o container do conteúdo (children)
  noHorizontalPadding?: boolean; // Para remover o padding horizontal padrão do conteúdo
  noVerticalPadding?: boolean; // Para remover o padding vertical padrão do conteúdo
  showSeparator?: boolean; // Para mostrar um separador abaixo do título
  // Adicione outras props que sua Section possa precisar
  // Ex: rightHeaderComponent para um ícone ou botão ao lado do título
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  titleStyle,
  contentStyle,
  noHorizontalPadding = false,
  noVerticalPadding = false,
  showSeparator = false,
}) => {
  const { theme } = useTheme();

  // Estilos dinâmicos baseados no tema
  const themedSectionStyle: ViewStyle = {
    // marginBottom: theme.spacing.lg, // Espaçamento padrão abaixo de cada seção
    // O espaçamento entre seções é melhor controlado pelo layout que as utiliza.
  };

  const themedTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSize.xl, // Tamanho de fonte maior para títulos de seção
    fontWeight: 'bold', // Ou theme.typography.fontFamily.bold se definido
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: title ? theme.spacing.md : 0, // Espaçamento abaixo do título apenas se houver título
    paddingHorizontal: noHorizontalPadding ? 0 : theme.spacing.md, // Padding horizontal para o título
  };

  const themedContentStyle: ViewStyle = {
    paddingHorizontal: noHorizontalPadding ? 0 : theme.spacing.md,
    paddingVertical: noVerticalPadding ? 0 : theme.spacing.md,
  };

  const separatorStyle: ViewStyle = {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    marginHorizontal: noHorizontalPadding ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.md,
  };

  return (
    <View style={[styles.container, themedSectionStyle, style]}>
      {title && <Text style={[styles.titleBase, themedTitleStyle, titleStyle]}>{title}</Text>}
      {title && showSeparator && <View style={separatorStyle} />}
      <View style={[themedContentStyle, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Estilos base para o container da seção
    // backgroundColor: 'transparent', // Geralmente transparente, a cor vem do fundo da tela
  },
  titleBase: {
    // Estilos base para o título que não dependem do tema
  },
  // contentContainer: { // Renomeado para themedContentStyle e aplicado diretamente
  //   // Estilos base para o container de conteúdo
  // },
  // separator: { // Renomeado para separatorStyle e aplicado diretamente
  //   // Estilos base para o separador
  // },
});

export default Section;
