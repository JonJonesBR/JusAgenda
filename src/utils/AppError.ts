/**
 * Classe de erro personalizada para padronizar os erros na aplicação
 */
export class AppError extends Error {
  /**
   * Código do erro para identificação
   */
  code: string;
  
  /**
   * Dados adicionais relacionados ao erro
   */
  data?: Record<string, any>;

  /**
   * Indica se o erro deve ser exibido para o usuário
   */
  userVisible: boolean;

  /**
   * Construtor da classe de erro
   * @param message Mensagem de erro
   * @param code Código de erro
   * @param userVisible Se o erro deve ser exibido ao usuário
   * @param data Dados adicionais relacionados ao erro
   */
  constructor(
    message: string, 
    code: string = 'UNKNOWN_ERROR', 
    userVisible: boolean = true,
    data?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userVisible = userVisible;
    this.data = data;
    
    // Necessário para que instanceof funcione corretamente com classes que estendem Error
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Converte o erro para um formato amigável ao usuário
   * @returns Mensagem de erro formatada para exibição ao usuário
   */
  toUserMessage(): string {
    if (!this.userVisible) {
      return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
    return this.message;
  }

  /**
   * Cria um erro a partir de uma exceção genérica
   * @param error Erro original
   * @param defaultCode Código padrão caso o erro original não tenha um código
   * @param defaultMessage Mensagem padrão caso o erro original não tenha uma mensagem
   * @returns Uma instância de AppError
   */
  static fromError(
    error: any, 
    defaultCode: string = 'UNKNOWN_ERROR',
    defaultMessage: string = 'Ocorreu um erro inesperado'
  ): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    // Se o erro já tiver código e mensagem (formato anterior)
    if (error && typeof error === 'object' && error.code && error.message) {
      return new AppError(error.message, error.code);
    }
    
    // Para erros padrão do JavaScript
    if (error instanceof Error) {
      return new AppError(error.message, defaultCode);
    }
    
    // Para qualquer outro tipo de erro
    return new AppError(
      typeof error === 'string' ? error : defaultMessage,
      defaultCode
    );
  }
}

// Códigos de erro para uso em toda a aplicação
export const ERROR_CODES = {
  // Códigos de erro gerais
  UNKNOWN: 'UNKNOWN_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  
  // Códigos de erro de eventos
  EVENTS: {
    MIGRATION: 'MIGRATION_ERROR',
    GET: 'GET_EVENTS_ERROR',
    GET_UPCOMING: 'GET_UPCOMING_EVENTS_ERROR',
    ADD: 'ADD_EVENT_ERROR',
    UPDATE: 'UPDATE_EVENT_ERROR',
    DELETE: 'DELETE_EVENT_ERROR',
    SEARCH: 'SEARCH_EVENTS_ERROR',
    GET_BY_ID: 'GET_EVENT_BY_ID_ERROR',
    UPDATE_NOTIFICATIONS: 'UPDATE_EVENT_NOTIFICATIONS_ERROR',
    CLEANUP: 'CLEANUP_EVENTS_ERROR',
    LOG: 'LOG_EVENTS_ERROR',
    VALIDATION: 'EVENT_VALIDATION_ERROR'
  },
  
  // Códigos de erro de notificações
  NOTIFICATIONS: {
    PERMISSION: 'NOTIFICATION_PERMISSION_ERROR',
    SCHEDULE: 'SCHEDULE_NOTIFICATION_ERROR',
    CANCEL: 'CANCEL_NOTIFICATION_ERROR'
  },
  
  // Códigos de erro de email
  EMAIL: {
    SEND: 'SEND_EMAIL_ERROR',
    VALIDATION: 'EMAIL_VALIDATION_ERROR'
  },
  
  // Códigos de erro de armazenamento
  STORAGE: {
    READ: 'STORAGE_READ_ERROR',
    WRITE: 'STORAGE_WRITE_ERROR',
    DELETE: 'STORAGE_DELETE_ERROR'
  }
};
