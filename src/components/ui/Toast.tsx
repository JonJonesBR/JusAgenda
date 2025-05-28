// src/components/ui/Toast.tsx
import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
  Easing, // Import Easing para animações mais suaves
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

interface ToastProps {
  id?: string; // ID opcional para o toast
  type?: ToastType;
  text1?: string; // Título ou texto principal
  text2?: string; // Subtítulo ou texto secundário
  duration?: number; // Duração em milissegundos
  position?: 'top' | 'bottom' | 'center';
  visibilityTime?: number; // Alias para duration
  autoHide?: boolean;
  onPress?: () => void;
  onHide?: () => void; // Chamado quando o toast é escondido
  onShow?: () => void; // Chamado quando o toast é mostrado
  topOffset?: number; // Deslocamento do topo
  bottomOffset?: number; // Deslocamento de baixo
  leadingIcon?: ReactNode; // Ícone à esquerda
  trailingIcon?: ReactNode; // Ícone à direita (ex: botão de fechar)
  style?: StyleProp<ViewStyle>;
  text1Style?: StyleProp<TextStyle>;
  text2Style?: StyleProp<TextStyle>;
}

interface InternalToastProps extends ToastProps {
  isVisible: boolean;
  hide: () => void; // Função para esconder este toast específico
}

const DEFAULT_DURATION = 4000; // 4 segundos
const ANIMATION_DURATION = 300; // Duração da animação de entrada/saída

// --- Gerenciador de Estado Global para Toasts (Singleton Pattern) ---
interface ToastMessage extends ToastProps {
  id: string; // Garante que cada mensagem tenha um ID
}

let toastMessages: ToastMessage[] = [];
let listeners: Array<(messages: ToastMessage[]) => void> = [];

const toastStateManager = {
  add: (message: ToastProps) => {
    const id = message.id || Math.random().toString(36).substring(2, 9);
    const newMessage = { ...message, id };
    toastMessages = [newMessage, ...toastMessages.filter(m => m.id !== id)].slice(0, 3); // Mantém no máximo 3 toasts
    listeners.forEach(listener => listener(toastMessages));
    return id;
  },
  remove: (id: string) => {
    toastMessages = toastMessages.filter(message => message.id !== id);
    listeners.forEach(listener => listener(toastMessages));
  },
  subscribe: (listener: (messages: ToastMessage[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  getMessages: () => toastMessages,
};

// API estática para mostrar toasts de qualquer lugar
export const Toast = {
  show: (props: ToastProps): string => {
    return toastStateManager.add(props);
  },
  hide: (id: string): void => {
    // Na prática, o componente ToastItem se auto-esconderá.
    // Esta função `hide` poderia ser usada para fechar programaticamente se necessário,
    // mas o gerenciador de estado atual não a expõe diretamente para fechar um toast específico.
    // Para fechar um toast específico, o ToastItem que o renderiza chamará toastStateManager.remove(id).
    console.warn(`Toast.hide('${id}') chamado. O ToastItem deve lidar com o seu próprio desaparecimento ou o utilizador pode dispensá-lo.`);
    // Se precisar de fecho programático externo, o toastStateManager precisaria de uma função `close(id)`.
  },
};
// --- Fim do Gerenciador de Estado Global ---


const ToastItem: React.FC<InternalToastProps> = ({
  type = 'default',
  text1,
  text2,
  duration = DEFAULT_DURATION,
  position = 'top',
  visibilityTime,
  autoHide = true,
  onPress,
  onHide,
  onShow,
  topOffset = 0,
  bottomOffset = 0,
  leadingIcon,
  trailingIcon,
  style,
  text1Style,
  text2Style,
  isVisible,
  hide, // Função para remover este toast do estado global
  id, // ID do toast
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(position === 'top' ? -150 : 150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveDuration = visibilityTime || duration;

  const showToast = useCallback(() => {
    if (onShow) onShow();
    AccessibilityInfo.announceForAccessibility(text1 || text2 || 'Nova notificação');

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease), // Easing para suavizar
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    if (autoHide) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, effectiveDuration);
    }
  }, [autoHide, effectiveDuration, onShow, opacity, translateY, text1, text2]);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -150 : 150,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
      if (id) toastStateManager.remove(id); // Remove do estado global após a animação
      hide(); // Chama a prop hide para notificar o ToastProvider
    });
  }, [onHide, opacity, position, translateY, hide, id]);

  useEffect(() => {
    if (isVisible) {
      showToast();
    }
    // Não precisamos de um `else { hideToast() }` aqui, pois o hide é acionado pelo timer ou externamente.
    // O cleanup do timer é importante.
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, showToast]); // Removido hideToast das dependências para evitar loops


  const getBackgroundColor = (): string => {
    switch (type) {
      case 'success': return theme.colors.success || '#4CAF50';
      case 'error': return theme.colors.error || '#D32F2F';
      case 'info': return theme.colors.info || '#1976D2';
      case 'warning': return theme.colors.warning || '#FFA000';
      default: return theme.colors.isDark ? '#424242' : '#333333'; // Cor default escura/clara
    }
  };

  const getTextColor = (): string => {
    // Para a maioria dos backgrounds, texto branco funciona bem.
    // Pode adicionar lógica mais complexa se as cores de background variarem muito.
    return '#FFFFFF';
  };

  const getIcon = (): ReactNode => {
    if (leadingIcon) return leadingIcon;
    const iconColor = getTextColor();
    switch (type) {
      case 'success': return <MaterialCommunityIcons name="check-circle-outline" size={24} color={iconColor} />;
      case 'error': return <MaterialCommunityIcons name="alert-circle-outline" size={24} color={iconColor} />;
      case 'info': return <MaterialCommunityIcons name="information-outline" size={24} color={iconColor} />;
      case 'warning': return <MaterialCommunityIcons name="alert-outline" size={24} color={iconColor} />;
      default: return null;
    }
  };

  const toastContainerStyle: Animated.WithAnimatedValue<ViewStyle> = {
    opacity,
    transform: [{ translateY }],
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 6 : undefined, // Elevação para Android
    ...(position === 'top' && { top: insets.top + theme.spacing.sm + topOffset }),
    ...(position === 'bottom' && { bottom: insets.bottom + theme.spacing.sm + bottomOffset }),
    ...(position === 'center' && { // Para posição 'center', precisamos de mais lógica para centralizar
        top: '45%', // Aproximação, pode precisar de ajuste ou cálculo dinâmico
        alignSelf: 'center',
     }),
  };

  const themedContentStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm, // Sombra do tema
    flexDirection: 'row',
    alignItems: 'center',
  };

  const textColor = getTextColor();
  const themedText1Style: TextStyle = {
    color: textColor,
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    fontFamily: theme.typography.fontFamily.bold,
  };

  const themedText2Style: TextStyle = {
    color: textColor,
    fontSize: theme.typography.fontSize.sm,
    marginTop: text1 && text2 ? theme.spacing.xs / 2 : 0,
    fontFamily: theme.typography.fontFamily.regular,
  };

  const iconNode = getIcon();

  if (!isVisible && opacity.__getValue() === 0) { // Não renderiza se não estiver visível e já transparente
      return null;
  }

  return (
    <Animated.View style={toastContainerStyle}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={() => {
          if (onPress) onPress();
          if (!autoHide) hideToast(); // Se não for autoHide, o toque esconde
        }}
        style={[themedContentStyle, style]}
      >
        {iconNode && <View style={styles.iconContainer}>{iconNode}</View>}
        <View style={styles.textContainer}>
          {text1 && <Text style={[themedText1Style, text1Style]}>{text1}</Text>}
          {text2 && <Text style={[themedText2Style, text2Style]}>{text2}</Text>}
        </View>
        {trailingIcon && <View style={styles.trailingIconContainer}>{trailingIcon}</View>}
        {!trailingIcon && !autoHide && !onPress && ( // Adiciona um botão de fechar se não for autoHide e não houver onPress
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={textColor} />
            </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


// Componente Provider que renderiza os toasts ativos
export const ToastProvider: React.FC<{children?: ReactNode}> = ({ children }) => {
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>(toastStateManager.getMessages());

  useEffect(() => {
    const unsubscribe = toastStateManager.subscribe(setActiveToasts);
    return unsubscribe;
  }, []);

  // Função para o ToastItem chamar quando ele terminar de se esconder
  const handleToastHidden = (idToRemove: string) => {
    // O ToastItem já chama toastStateManager.remove(id)
    // Esta função pode ser usada para lógica adicional se necessário,
    // mas o estado activeToasts já será atualizado pelo listener.
    // console.log(`ToastProvider: Toast ${idToRemove} foi escondido e removido do estado global.`);
  };

  return (
    <>
      {children}
      {activeToasts.map((toastProps, index) => (
        <ToastItem
          key={toastProps.id}
          {...toastProps}
          isVisible={true} // Sempre visível para o ToastItem, ele controla sua própria animação de entrada/saída
          hide={() => handleToastHidden(toastProps.id)} // Passa a função para o ToastItem
          // Ajusta a posição para múltiplos toasts (exemplo simples de empilhamento)
          // A lógica de empilhamento pode ser mais complexa
          topOffset={(toastProps.position === 'top' ? index * (60 + theme.spacing.sm) : 0) + (toastProps.topOffset || 0)}
          bottomOffset={(toastProps.position === 'bottom' ? index * (60 + theme.spacing.sm) : 0) + (toastProps.bottomOffset || 0)}
        />
      ))}
    </>
  );
};


const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1, // Para que o texto ocupe o espaço disponível
  },
  trailingIconContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    marginLeft: 10,
    padding: 4,
  }
});
