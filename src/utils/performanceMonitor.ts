import { logger } from './loggerService';

interface PerformanceEntry {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Monitor de desempenho para rastrear operações lentas e problemas de performance
 */
class PerformanceMonitor {
  private static entries: PerformanceEntry[] = [];
  private static thresholds: Record<string, number> = {
    default: 500,  // 500ms como novo limite padrão
    storage: 200,  // 200ms para operações de armazenamento
    network: 1500, // 1.5 segundos para operações de rede
    render: 50,    // 50ms para renderização
    animation: 30 // Novo limite para animações
  };

  /**
   * Inicia o monitoramento de uma operação
   * @param name Nome da operação
   * @param metadata Metadados adicionais
   * @returns ID da operação para uso em `endOperation`
   */
  static startOperation(name: string, metadata?: Record<string, any>): string {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Nome da operação deve ser uma string não vazia');
    }
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.entries.push({
      id,
      name,
      startTime: Date.now(),
      metadata: metadata && typeof metadata === 'object' ? metadata : {}
    });
    return id;
  }

  /**
   * Finaliza o monitoramento de uma operação e registra sua duração
   * @param id ID da operação retornado por `startOperation`
   * @param additionalMetadata Metadados adicionais a serem incluídos no registro final
   * @returns Duração da operação em ms, ou -1 se a operação não for encontrada
   */
  static endOperation(id: string, additionalMetadata?: Record<string, any>): number {
    if (typeof id !== 'string') {
      logger.warn('ID de operação inválido:', id);
      return -1;
    }
    const index = this.entries.findIndex(entry => entry.id === id && !entry.endTime);
    
    if (index === -1) {
      logger.warn(`Operação não encontrada para finalizar: ${id}`);
      return -1;
    }

    const entry = this.entries[index];
    const endTime = Date.now();
    const duration = endTime - entry.startTime;

    const safeMetadata = additionalMetadata && typeof additionalMetadata === 'object' ? additionalMetadata : {};
    this.entries[index] = {
      ...entry,
      endTime,
      duration,
      metadata: {
        ...entry.metadata,
        ...safeMetadata
      }
    };

    // Verifica e classifica a severidade da operação lenta
    const threshold = this.getThreshold(entry.name);
    if (duration > threshold) {
      const severity = duration > threshold * 2 ? 'critical' : 'warning';
      if (severity === 'warning') {
        logger.warn(`Operação ${severity} detectada: ${entry.name}`, {
          duration,
          threshold,
          severity,
          metadata: this.entries[index].metadata
        });
      } else {
        logger.error(`Operação ${severity} detectada: ${entry.name}`, {
          duration,
          threshold,
          severity,
          metadata: this.entries[index].metadata
        });
      }
    }

    return duration;
  }

  /**
   * Obtém o limite de tempo para uma operação
   * @param operationName Nome da operação
   * @returns Limite em ms
   */
  static getThreshold(operationName: string): number {
    // Verifica se há um limite específico para essa operação
    for (const [category, threshold] of Object.entries(this.thresholds)) {
      if (operationName.includes(category)) {
        return threshold;
      }
    }
    return this.thresholds.default;
  }

  /**
   * Define um limite de tempo personalizado para categorias de operações
   * @param category Categoria ou nome da operação
   * @param thresholdMs Limite em ms
   */
  static setThreshold(category: string, thresholdMs: number): void {
    this.thresholds[category] = thresholdMs;
  }

  /**
   * Mede o tempo de execução de uma função assíncrona
   * @param name Nome da operação
   * @param fn Função assíncrona a ser medida
   * @param metadata Metadados adicionais
   * @returns Resultado da função
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const operationId = this.startOperation(name, metadata);
    
    try {
      const result = await fn();
      this.endOperation(operationId, { success: true });
      return result;
    } catch (error) {
      this.endOperation(operationId, { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Obtém todas as operações registradas
   * @returns Lista de operações monitoradas
   */
  static getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * Limpa o histórico de operações
   */
  static clearEntries(): void {
    this.entries = [];
  }

  /**
   * Obtém estatísticas de desempenho das operações concluídas
   * @returns Estatísticas agrupadas por nome de operação
   */
  static getStats(): Record<string, { count: number; avgDuration: number; maxDuration: number; }> {
    const stats: Record<string, { 
      count: number; 
      totalDuration: number; 
      maxDuration: number; 
    }> = {};

    // Considera apenas operações concluídas
    const completedEntries = this.entries.filter(entry => entry.duration !== undefined);

    // Agrupa por nome de operação
    completedEntries.forEach(entry => {
      const { name, duration = 0 } = entry;
      
      if (!stats[name]) {
        stats[name] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }
      
      stats[name].count++;
      stats[name].totalDuration += duration;
      stats[name].maxDuration = Math.max(stats[name].maxDuration, duration);
    });

    // Calcula médias
    return Object.entries(stats).reduce((result, [name, data]) => {
      result[name] = {
        count: data.count,
        avgDuration: Math.round(data.totalDuration / data.count),
        maxDuration: data.maxDuration
      };
      return result;
    }, {} as Record<string, { count: number; avgDuration: number; maxDuration: number; }>);
  }
}

export default PerformanceMonitor;
