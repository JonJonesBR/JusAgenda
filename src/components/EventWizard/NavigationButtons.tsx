import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';

interface NavigationButtonsProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isEditMode?: boolean;
}

/**
 * Componente de botões de navegação para o wizard
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Button
        title={isFirstStep ? "Cancelar" : "Voltar"}
        type="outline"
        buttonStyle={[styles.button, { borderColor: theme.colors.primary }]}
        titleStyle={{ color: theme.colors.primary }}
        onPress={onBack}
        icon={{
          name: isFirstStep ? 'close' : 'arrow-back',
          type: 'material',
          color: theme.colors.primary,
        }}
        iconPosition="left"
      />

      <Button
        title={isLastStep ? (isEditMode ? "Salvar" : "Criar") : "Próximo"}
        buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
        titleStyle={{ color: 'white' }}
        onPress={onNext}
        icon={{
          name: isLastStep ? 'check' : 'arrow-forward',
          type: 'material',
          color: 'white',
        }}
        iconPosition="right"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  button: {
    paddingHorizontal: 20,
    minWidth: 130,
  },
});

export default NavigationButtons;
