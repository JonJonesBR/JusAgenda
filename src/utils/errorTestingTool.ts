import { AppError, ERROR_CODES } from './AppError';
import { logger } from './loggerService';
import ToastManager from './toastManager';

/**
 * Ferramenta para testar o tratamento de erros no aplicativo.
 * Permite simular diferentes cenários de erro para validar o comportamento do aplicativo.
 */
class ErrorTestingTool {
  /**
   * Gera um erro com o código especificado
   * @param code Código do erro a ser gerado
   * @param message Mensagem opcional do erro
   * @param userVisible Se o erro deve ser visível ao usuário
   * @returns Uma Promise rejeitada com o erro
   */
  static async generateError(
    code: string,
    message?: string,
    userVisible = true
  ): Promise<never> {
    const error = new AppError(
      message || `Erro simulado: ${code}`,
      code,
      userVisible
    );
    
    logger.debug('Erro simulado gerado para testes', { 
      code,
      message,
      userVisible,
      stack: error.stack
    });
    
    throw error;
  }

  /**
   * Simula um timeout em uma operação
   * @param operationName Nome da operação para o log
   * @param durationMs Duração do timeout em milissegundos
   * @returns Uma Promise rejeitada com erro de timeout
   */
  static async simulateTimeout(
    operationName: string,
    durationMs = 3000
  ): Promise<never> {
    logger.debug(`Simulando timeout para operação: ${operationName}`, { durationMs });
    
    return new Promise((_, reject) => {
      setTimeout(() => {
        const error = new AppError(
          `Timeout na operação: ${operationName}`,
          ERROR_CODES.TIMEOUT,
          true
        );
        reject(error);
      }, durationMs);
    });
  }

  /**
   * Simula um erro de rede
   * @param message Mensagem opcional do erro
   * @returns Uma Promise rejeitada com erro de rede
   */
  static async simulateNetworkError(message?: string): Promise<never> {
    const error = new AppError(
      message || 'Erro de conexão com a rede',
      ERROR_CODES.NETWORK,
      true
    );
    
    logger.debug('Simulando erro de rede', { message });
    throw error;
  }

  /**
   * Exibe um toast simulado para testar a exibição de mensagens
   * @param type Tipo do toast
   * @param title Título do toast
   * @param message Mensagem opcional
   */
  static showTestToast(
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message?: string
  ): void {
    logger.debug(`Exibindo toast de teste: ${type}`, { title, message });
    
    switch (type) {
      case 'success':
        ToastManager.success(title, message);
        break;
      case 'error':
        ToastManager.error(title, message);
        break;
      case 'info':
        ToastManager.info(title, message);
        break;
      case 'warning':
        ToastManager.warning(title, message);
        break;
    }
  }

  /**
   * Testa o ciclo completo de tratamento de erro
   * @param code Código do erro a ser testado
   */
  static async testErrorHandlingCycle(code: string): Promise<void> {
    logger.info(`Iniciando teste de ciclo de tratamento de erro para: ${code}`);
    
    try {
      await this.generateError(code);
    } catch (error) {
      if (error instanceof AppError) {
        logger.info('Erro capturado no ciclo de teste', { 
          code: error.code,
          message: error.message,
          userVisible: error.userVisible
        });
        
        ToastManager.error(error);
      } else {
        logger.error('Erro inesperado durante teste', error);
        ToastManager.error('Erro no teste', 'Ocorreu um erro inesperado durante o teste');
      }
    }
  }
}

export default ErrorTestingTool;
