import { Platform } from 'react-native';
import { captureException } from './errorTracking';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContextData = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContextData;
  error?: Error;
}

/**
 * Serviço centralizado de logs para a aplicação
 */
class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private maxLogEntries = 100;
  private isDebugMode = __DEV__;

  /**
   * Obtém a instância do LoggerService (Singleton)
   */
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Registra uma mensagem de debug
   * @param message Mensagem a ser registrada
   * @param context Dados adicionais de contexto
   */
  public debug(message: string, context?: LogContextData): void {
    this.log('debug', message, context);
  }

  /**
   * Registra uma mensagem de informação
   * @param message Mensagem a ser registrada
   * @param context Dados adicionais de contexto
   */
  public info(message: string, context?: LogContextData): void {
    this.log('info', message, context);
  }

  /**
   * Registra uma mensagem de aviso
   * @param message Mensagem a ser registrada
   * @param context Dados adicionais de contexto
   */
  public warn(message: string, context?: LogContextData): void {
    this.log('warn', message, context);
  }

  /**
   * Registra uma mensagem de erro
   * @param message Mensagem a ser registrada
   * @param error Objeto de erro
   * @param context Dados adicionais de contexto
   */
  public error(message: string, error?: Error | unknown, context?: LogContextData): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, context, errorObj);
    
    // Envia para o serviço de monitoramento de erros, se disponível
    if (typeof captureException === 'function') {
      captureException(errorObj, { 
        ...context, 
        message, 
        platform: Platform.OS,
        version: Platform.Version,
      });
    }
  }

  /**
   * Limpa todos os logs armazenados
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Obtém todos os logs armazenados
   */
  public getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Exporta todos os logs para um formato de texto
   */
  public exportLogs(): string {
    return this.logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
  }

  /**
   * Registra uma entrada de log
   */
  private log(level: LogLevel, message: string, context?: LogContextData, error?: Error): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // Adiciona ao array de logs, mantendo o limite de tamanho
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }

    // Em desenvolvimento, exibe no console
    if (this.isDebugMode) {
      this.writeToConsole(logEntry);
    }
  }

  /**
   * Escreve a entrada de log no console
   */
  private writeToConsole(logEntry: LogEntry): void {
    const { level, message, context, error } = logEntry;
    const timestamp = logEntry.timestamp.split('T')[1].split('.')[0]; // Extrai HH:MM:SS

    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] DEBUG:`, message, context || '');
        break;
      case 'info':
        console.info(`[${timestamp}] INFO:`, message, context || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN:`, message, context || '');
        break;
      case 'error':
        console.error(`[${timestamp}] ERROR:`, message, error || '', context || '');
        break;
    }
  }
}

// Exporta uma instância única do serviço
export const logger = LoggerService.getInstance();

// Exporta a classe para testes
export default LoggerService;
