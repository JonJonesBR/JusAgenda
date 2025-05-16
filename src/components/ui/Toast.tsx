import React, { useEffect, useRef, useCallback } from 'react'; // Adicionado useCallback
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar, // Adicionado StatusBar
  Platform,  // Adicionado Platform
  AccessibilityInfo, // Adicionado AccessibilityInfo
} from 'react-native';
import { Easing } from 'react-native-reanimated'; // Corrected Easing import
import { useTheme } from '../../contexts/ThemeContext'; // Removido tipo Theme
// import designSystemConfig from '../../theme/designSystem'; // REMOVIDO (Versão B)
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Para posicionamento superior

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  // Adicionar props para ícones se desejado
  // leftIconName?: string;
  // leftIconType?: string;
}

// defaultTextColors constant removed as it's no longer used.

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3500, // Duração um pouco maior
  onDismiss,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // Obter safe area insets
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current; // Começar mais acima
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref para o timer
  const hasBeenVisible = useRef(false); // Ref to track if toast was ever visible

  // Design system constants are now part of the theme object
  const ds = {
    spacing: theme.spacing,
    typography: theme.typography,
    radii: theme.radii,
    shadows: theme.shadows,
  };

  const getBackgroundColor = useCallback(() => {
    switch (type) {
      case 'success':
        return theme.colors.success || '#4CAF50'; // Fallback verde
      case 'error':
        return theme.colors.error || '#F44336'; // Fallback vermelho
      case 'warning':
        return theme.colors.warning || '#FFC107'; // Fallback amarelo
      case 'info':
      default:
        return theme.colors.info || '#2196F3'; // Fallback azul
    }
  }, [theme.colors, type]);

  const getTextColor = useCallback(() => {
    // Permitir override pelo tema, senão usar defaults
    switch (type) {
        case 'success': return theme.colors.onSuccess;
        case 'error': return theme.colors.onError;
        case 'warning': return theme.colors.onWarning;
        case 'info':
        default: return theme.colors.onInfo;
    }
  }, [theme.colors, type]);


  const handleDismiss = useCallback(() => {
     // Limpar timer se o dismiss for manual (ex: pelo botão de fechar)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Animar saída
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250, // Saída mais rápida
        useNativeDriver: true,
        easing: Easing.in(Easing.ease), // Easing de saída
      }),
      Animated.timing(translateY, {
        toValue: -50, // Mover para cima ao sair
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      onDismiss(); // Chama onDismiss após a animação
    });
  }, [opacity, translateY, onDismiss]); // Dependências corretas

  useEffect(() => {
    if (visible) {
      hasBeenVisible.current = true; // Mark as having been visible
      // Anunciar para acessibilidade
      AccessibilityInfo.announceForAccessibility(`Notificação ${type}: ${message}`);

      // Animar entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0, // Mover para a posição final
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();

      // Limpar timer anterior se houver
      if (timerRef.current) {
          clearTimeout(timerRef.current);
      }
      // Configurar novo timer
      timerRef.current = setTimeout(handleDismiss, duration);

    } else {
      // If visible becomes false, and the toast had been made visible, dismiss it.
      if (hasBeenVisible.current) {
        handleDismiss();
      }
    }

    // Função de limpeza para limpar o timer ao desmontar ou antes do próximo efeito
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, duration, message, type, handleDismiss, opacity, translateY]); // Dependências corretas

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const topPosition = insets.top + (Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 10)); // Posição abaixo da safe area / status bar

  // Não renderiza se nunca foi visível e a opacidade ainda é 0
  // Isso evita um flash rápido na montagem inicial se visible=false
  if (!visible && !hasBeenVisible.current) {
      return null;
  }


  return (
    <Animated.View
      style={[
        styles.containerBase,
        {
          backgroundColor: backgroundColor,
          opacity: opacity, // Aplicar opacidade animada
          transform: [{ translateY: translateY }], // Aplicar translação animada
          top: topPosition, // Posicionamento dinâmico
          borderRadius: ds.radii.md,
          paddingVertical: ds.spacing.sm,
          paddingHorizontal: ds.spacing.md,
          marginHorizontal: ds.spacing.md, // Margem horizontal em vez de left/right fixos
        },
        ds.shadows.medium, // Aplicar sombra
      ]}
      // Impede que o Toast capture toques quando não estiver totalmente visível/ativo
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityLiveRegion="assertive" // Informa leitores de tela sobre mudanças importantes
      accessibilityLabel={`Notificação ${type}: ${message}`}
    >
      <View style={styles.contentWrapper}>
        {/* Adicionar ícone baseado no tipo se desejado */}
        <Text style={[styles.messageText, { color: textColor, fontSize: ds.typography.fontSize.md, fontFamily: ds.typography.fontFamily.medium }]}>
            {message}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.closeButtonWrapper, { padding: ds.spacing.xs }]}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta área de toque
        accessibilityLabel="Fechar notificação"
        accessibilityRole="button"
      >
        <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Estilos base sem dependência de hooks/theme
const styles = StyleSheet.create({
  closeButtonText: {
    // color é dinâmico
    fontSize: 22, // Tamanho um pouco maior para o 'x'
    fontWeight: 'bold',
    lineHeight: 22, // Ajustar linha para centralizar
  },
  closeButtonWrapper: {
    // padding, marginLeft são dinâmicos
  },
  containerBase: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0, // Margem horizontal é controlada no estilo dinâmico
    position: 'absolute',
    right: 0, // Margem horizontal é controlada no estilo dinâmico
    zIndex: 9999,
    // backgroundColor, borderRadius, padding, etc., são dinâmicos
  },
  contentWrapper: {
    flex: 1,
    // marginRight é dinâmico (baseado em ds.spacing.sm)
  },
  messageText: {
    // color, fontSize, fontFamily são dinâmicos
  },
});

export default Toast;
