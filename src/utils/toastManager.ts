import Toast from 'react-native-toast-message';
import { AppError } from './AppError';
import { logger } from './loggerService';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
  hideOnPress?: boolean;
}

/**
 * Gerenciador de toasts para a aplicação.
 * Centraliza a exibição de mensagens ao usuário.
 */
class ToastManager {
  /**
   * Exibe uma mensagem de sucesso
   */
  static success(
    title: string,
    message?: string,
    options?: ToastOptions
  ): void {
    ToastManager.show('success', title, message, options);
    logger.info(`Toast Sucesso: ${title}`, { message });
  }

  /**
   * Exibe uma mensagem de erro
   */
  static error(
    titleOrError: string | Error | AppError,
    message?: string,
    options?: ToastOptions
  ): void {
    let title: string;
    let finalMessage: string | undefined = message;

    // Se for uma instância de AppError
    if (titleOrError instanceof AppError) {
      title = titleOrError.userVisible 
        ? titleOrError.message 
        : 'Ocorreu um erro inesperado';
      
      if (!finalMessage && titleOrError.code) {
        finalMessage = `Código: ${titleOrError.code}`;
      }

      logger.error(`Toast Erro: ${title}`, titleOrError);
    } 
    // Se for um Error padrão
    else if (titleOrError instanceof Error) {
      title = 'Ocorreu um erro';
      finalMessage = finalMessage || titleOrError.message;
      
      logger.error(`Toast Erro: ${title}`, titleOrError);
    } 
    // Se for uma string
    else {
      title = titleOrError;
      logger.error(`Toast Erro: ${title}`, { message: finalMessage });
    }

    ToastManager.show('error', title, finalMessage, options);
  }

  /**
   * Exibe uma mensagem informativa
   */
  static info(
    title: string,
    message?: string,
    options?: ToastOptions
  ): void {
    ToastManager.show('info', title, message, options);
    logger.info(`Toast Info: ${title}`, { message });
  }

  /**
   * Exibe uma mensagem de aviso
   */
  static warning(
    title: string,
    message?: string,
    options?: ToastOptions
  ): void {
    ToastManager.show('warning', title, message, options);
    logger.warn(`Toast Aviso: ${title}`, { message });
  }

  /**
   * Exibe uma mensagem de erro a partir de um resultado de operação
   */
  static showOperationResult(
    result: { success: boolean; message?: string; error?: any },
    successMessage: string
  ): void {
    if (result.success) {
      this.success(successMessage, result.message);
    } else if (result.error instanceof AppError) {
      this.error(result.error);
    } else if (result.error) {
      this.error(
        'Erro na operação',
        result.message || (typeof result.error === 'string' 
          ? result.error 
          : result.error.message || 'Ocorreu um erro inesperado')
      );
    } else {
      this.error('Falha na operação', result.message || 'Tente novamente');
    }
  }

  /**
   * Método interno para exibir o toast
   */
  private static show(
    type: ToastType,
    title: string,
    message?: string,
    options?: ToastOptions
  ): void {
    const { duration = 3000, position = 'bottom', onPress, hideOnPress = true } = options || {};

    Toast.show({
      type,
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 60,
      onPress,
      onHide: () => {},
      props: {
        hideOnPress
      }
    });
  }
}

export default ToastManager;
