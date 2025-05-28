// src/components/EventWizard/NavigationButtons.tsx
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button'; // Importando o seu componente Button customizado

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  backText?: string;
  nextText?: string;
  finishText?: string;
  isLoadingNext?: boolean; // Para mostrar loading no botão "Próximo/Finalizar"
  isLoadingBack?: boolean; // Para mostrar loading no botão "Anterior" (menos comum)
  style?: StyleProp<ViewStyle>; // Estilo para o container dos botões
  // Adicione outras props que possam ser úteis
  // Ex: disableNext, disableBack
  canGoNext?: boolean; // Controla se o botão "Próximo" está habilitado (além de isLoadingNext)
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  backText = 'Anterior',
  nextText = 'Próximo',
  finishText = 'Finalizar',
  isLoadingNext = false,
  isLoadingBack = false,
  style,
  canGoNext = true,
}) => {
  const { theme } = useTheme();

  const currentNextText = isLastStep ? finishText : nextText;

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.border }, style]}>
      <View style={styles.buttonWrapper}>
        {!isFirstStep && onBack && (
          <Button
            title={backText}
            onPress={onBack}
            type="outline"
            loading={isLoadingBack}
            disabled={isLoadingBack || isLoadingNext} // Desabilita se o outro botão estiver carregando
            buttonStyle={styles.button}
            // titleStyle={{ color: theme.colors.text }} // O tipo 'outline' já deve usar a cor primária ou de texto
          />
        )}
      </View>

      <View style={styles.buttonWrapper}>
        {onNext && (
          <Button
            title={currentNextText}
            onPress={onNext}
            type="solid"
            loading={isLoadingNext}
            disabled={isLoadingNext || isLoadingBack || !canGoNext} // Desabilita se carregando ou se canGoNext for false
            buttonStyle={styles.button}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ou 'space-around' ou 'flex-end' dependendo do design
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingVertical: 12,   // Usar theme.spacing.sm ou md
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor é definido dinamicamente com o tema
    // backgroundColor: theme.colors.background, // Opcional, se precisar de cor de fundo diferente
  },
  buttonWrapper: {
    flex: 1, // Faz com que cada wrapper de botão tente ocupar espaço igual
    marginHorizontal: 4, // Pequeno espaçamento entre os botões, se ambos estiverem visíveis
    // Se apenas um botão estiver visível, flex: 1 fará com que ele ocupe todo o espaço.
    // Se quiser que o botão "Próximo" fique sempre à direita, ajuste o flex ou justifyContent.
    // Por exemplo, para o botão "Próximo" à direita e "Anterior" à esquerda:
    // justifyContent: 'space-between' no container, e não usar flex:1 nos wrappers,
    // ou dar flexGrow: 0 para o botão de voltar e flexGrow: 1 para o de avançar se quiser que ele expanda.
    // A configuração atual com space-between e flex:1 nos wrappers funciona bem para 1 ou 2 botões.
  },
  button: {
    // Estilos adicionais para os botões, se necessário,
    // mas o componente Button já lida com a maior parte da estilização.
    // Ex: minWidth: 120, // Largura mínima para os botões
  },
});

export default NavigationButtons;
