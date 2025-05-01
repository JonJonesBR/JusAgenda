import { ERROR_CODES } from './AppError';

/**
 * Traduz códigos de erro técnicos para mensagens amigáveis para o usuário
 */
class ErrorTranslator {
  private static errorMessages: Record<string, string> = {
    // Erros gerais
    [ERROR_CODES.UNKNOWN]: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    [ERROR_CODES.NETWORK]: 'Erro de conexão. Verifique sua internet e tente novamente.',
    [ERROR_CODES.TIMEOUT]: 'A operação demorou muito tempo. Por favor, tente novamente.',
    
    // Erros de eventos
    [ERROR_CODES.EVENTS.MIGRATION]: 'Erro ao migrar dados antigos. Reinicie o aplicativo.',
    [ERROR_CODES.EVENTS.GET]: 'Não foi possível carregar seus compromissos. Tente novamente.',
    [ERROR_CODES.EVENTS.GET_UPCOMING]: 'Falha ao buscar compromissos futuros.',
    [ERROR_CODES.EVENTS.ADD]: 'Não foi possível adicionar o compromisso. Verifique os dados e tente novamente.',
    [ERROR_CODES.EVENTS.UPDATE]: 'Não foi possível atualizar o compromisso. Tente novamente.',
    [ERROR_CODES.EVENTS.DELETE]: 'Não foi possível excluir o compromisso. Tente novamente.',
    [ERROR_CODES.EVENTS.SEARCH]: 'Falha na busca de compromissos. Tente novamente.',
    [ERROR_CODES.EVENTS.GET_BY_ID]: 'Não foi possível encontrar o compromisso solicitado.',
    [ERROR_CODES.EVENTS.UPDATE_NOTIFICATIONS]: 'Não foi possível configurar as notificações para este compromisso.',
    [ERROR_CODES.EVENTS.CLEANUP]: 'Erro ao limpar dados inválidos.',
    [ERROR_CODES.EVENTS.VALIDATION]: 'Dados do compromisso inválidos. Verifique e tente novamente.',
    
    // Erros de notificações
    [ERROR_CODES.NOTIFICATIONS.PERMISSION]: 'Sem permissão para enviar notificações. Verifique as configurações do seu dispositivo.',
    [ERROR_CODES.NOTIFICATIONS.SCHEDULE]: 'Não foi possível agendar a notificação para este compromisso.',
    [ERROR_CODES.NOTIFICATIONS.CANCEL]: 'Não foi possível cancelar a notificação.',
    
    // Erros de e-mail
    [ERROR_CODES.EMAIL.SEND]: 'Não foi possível enviar o e-mail. Verifique sua conexão.',
    [ERROR_CODES.EMAIL.VALIDATION]: 'Informações de e-mail inválidas. Verifique e tente novamente.',
    
    // Erros de armazenamento
    [ERROR_CODES.STORAGE.READ]: 'Não foi possível ler os dados armazenados. Reinicie o aplicativo.',
    [ERROR_CODES.STORAGE.WRITE]: 'Não foi possível salvar os dados. Verifique o espaço livre no dispositivo.',
    [ERROR_CODES.STORAGE.DELETE]: 'Não foi possível excluir os dados armazenados.'
  };

  /**
   * Traduz um código de erro para uma mensagem amigável
   * @param errorCode Código do erro
   * @param defaultMessage Mensagem padrão caso o código não seja encontrado
   * @returns Mensagem traduzida para o usuário
   */
  static translate(errorCode: string, defaultMessage = 'Ocorreu um erro inesperado'): string {
    return this.errorMessages[errorCode] || defaultMessage;
  }

  /**
   * Adiciona ou atualiza uma tradução de erro
   * @param errorCode Código do erro
   * @param message Mensagem traduzida
   */
  static addTranslation(errorCode: string, message: string): void {
    this.errorMessages[errorCode] = message;
  }

  /**
   * Obtém todas as traduções disponíveis
   * @returns Objeto com todas as traduções
   */
  static getAllTranslations(): Record<string, string> {
    return { ...this.errorMessages };
  }
}

export default ErrorTranslator;
