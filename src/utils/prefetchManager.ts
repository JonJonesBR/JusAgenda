import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
// Nota: Para usar esta funcionalidade, instale: npm install @react-native-community/netinfo
// import NetInfo from '@react-native-community/netinfo'; 
import { AppError } from './AppError';
import { logger } from './loggerService';

// Definição de tipo para NetInfo (mockado para este exemplo)
type NetInfoState = {
  isConnected: boolean;
  type: string;
  details: any;
};

// Objeto NetInfo mockado (substitua pela implementação real quando a dependência for instalada)
const NetInfo = {
  addEventListener: (callback: (state: NetInfoState) => void) => {
    // Simula uma conexão ativa wi-fi para testes
    callback({
      isConnected: true,
      type: 'wifi',
      details: null,
    });
    
    // Retorna um objeto com método remove
    return {
      remove: () => {}
    };
  },
  fetch: async () => ({
    isConnected: true,
    type: 'wifi',
    details: null,
  }),
};

// Tipos de recursos que podem ser pré-carregados
export enum PrefetchResourceType {
  EVENTS = 'events',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
}

// Status de rede do dispositivo
export enum NetworkStatus {
  CONNECTED_WIFI = 'connected_wifi',
  CONNECTED_CELLULAR = 'connected_cellular',
  DISCONNECTED = 'disconnected',
  UNKNOWN = 'unknown',
}

// Configurações de prefetch baseadas no tipo de rede
const PREFETCH_CONFIG = {
  [NetworkStatus.CONNECTED_WIFI]: {
    enabled: true,
    maxItemsPerBatch: 100,
    prefetchMonths: 6,
    prefetchNotifications: true,
    prefetchSettings: true,
    prefetchProfile: true,
    backgroundPrefetch: true,
  },
  [NetworkStatus.CONNECTED_CELLULAR]: {
    enabled: true,
    maxItemsPerBatch: 20,
    prefetchMonths: 2,
    prefetchNotifications: true,
    prefetchSettings: false,
    prefetchProfile: true,
    backgroundPrefetch: false,
  },
  [NetworkStatus.DISCONNECTED]: {
    enabled: false,
    maxItemsPerBatch: 0,
    prefetchMonths: 0,
    prefetchNotifications: false,
    prefetchSettings: false,
    prefetchProfile: false,
    backgroundPrefetch: false,
  },
  [NetworkStatus.UNKNOWN]: {
    enabled: false,
    maxItemsPerBatch: 0,
    prefetchMonths: 0,
    prefetchNotifications: false,
    prefetchSettings: false,
    prefetchProfile: false,
    backgroundPrefetch: false,
  },
};

// Chaves de armazenamento para dados prefetchados
const STORAGE_KEYS = {
  PREFETCH_DATA: 'jus_agenda_prefetch_data',
  PREFETCH_TIMESTAMP: 'jus_agenda_prefetch_timestamp',
};

// Interface para metadados de prefetch
interface PrefetchMetadata {
  timestamp: number;
  expiresAt: number;
  type: PrefetchResourceType;
  params: any;
  status: 'pending' | 'completed' | 'failed';
  networkType: NetworkStatus;
}

// Interface para um recurso prefetchado
interface PrefetchedResource {
  data: any;
  metadata: PrefetchMetadata;
}

// Cache em memória para dados prefetchados
const memoryCache: Record<string, PrefetchedResource> = {};

/**
 * Gerenciador de prefetching para carregar dados antecipadamente
 */
class PrefetchManager {
  private networkStatus: NetworkStatus = NetworkStatus.UNKNOWN;
  private prefetchInProgress: boolean = false;
  private ongoingPrefetchPromises: Record<string, Promise<any>> = {};

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa o gerenciador de prefetch
   */
  private async initialize() {
    try {
      // Monitorar o estado da rede
      NetInfo.addEventListener(state => {
        if (!state.isConnected) {
          this.networkStatus = NetworkStatus.DISCONNECTED;
        } else if (state.type === 'wifi') {
          this.networkStatus = NetworkStatus.CONNECTED_WIFI;
        } else if (state.type === 'cellular') {
          this.networkStatus = NetworkStatus.CONNECTED_CELLULAR;
        } else {
          this.networkStatus = NetworkStatus.UNKNOWN;
        }

        // Se a rede estiver disponível e o prefetch estiver habilitado, verificamos
        // se há necessidade de atualizar os dados prefetchados
        if (this.isPrefetchEnabled()) {
          this.checkAndUpdatePrefetchedData().catch(err => {
            logger.error('[PrefetchManager] Erro durante verificação de dados:', err);
          });
        }
      });

      // Verificar e limpar dados expirados
      this.clearExpiredPrefetchData();
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao inicializar:', error);
    }
  }

  /**
   * Verifica se o prefetching está habilitado para a conexão atual
   */
  private isPrefetchEnabled(): boolean {
    return PREFETCH_CONFIG[this.networkStatus].enabled;
  }

  /**
   * Gera uma chave única para um recurso prefetchado
   */
  private getPrefetchKey(type: PrefetchResourceType, params: any): string {
    // Criar uma string a partir dos parâmetros para usar como parte da chave
    const paramsString = JSON.stringify(params || {});
    return `${type}_${paramsString}`;
  }

  /**
   * Salva dados prefetchados no AsyncStorage
   */
  private async savePrefetchedData(
    type: PrefetchResourceType,
    params: any,
    data: any,
    expirationMinutes: number = 60,
  ): Promise<void> {
    try {
      const key = this.getPrefetchKey(type, params);
      const timestamp = Date.now();
      const expiresAt = timestamp + expirationMinutes * 60 * 1000;

      const metadata: PrefetchMetadata = {
        timestamp,
        expiresAt,
        type,
        params,
        status: 'completed',
        networkType: this.networkStatus,
      };

      const resource: PrefetchedResource = {
        data,
        metadata,
      };

      // Salva no cache em memória
      memoryCache[key] = resource;

      // Salva no AsyncStorage de forma otimizada (apenas dados que precisam persistir)
      const storageData = await AsyncStorage.getItem(STORAGE_KEYS.PREFETCH_DATA);
      let prefetchStorage: Record<string, PrefetchedResource> = {};

      if (storageData) {
        prefetchStorage = JSON.parse(storageData);
      }

      prefetchStorage[key] = resource;

      // Limita o tamanho dos dados armazenados
      const keys = Object.keys(prefetchStorage);
      if (keys.length > 50) {
        // Se houver mais de 50 entradas, remove as mais antigas
        const sortedKeys = keys.sort((a, b) => {
          return (
            prefetchStorage[a].metadata.timestamp -
            prefetchStorage[b].metadata.timestamp
          );
        });

        // Remove as 20 entradas mais antigas
        for (let i = 0; i < 20; i++) {
          if (sortedKeys[i]) {
            delete prefetchStorage[sortedKeys[i]];
          }
        }
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFETCH_DATA,
        JSON.stringify(prefetchStorage),
      );

      // Atualiza o timestamp da última atualização
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFETCH_TIMESTAMP,
        timestamp.toString(),
      );

      logger.info(`[PrefetchManager] Dados de ${type} prefetchados e salvos`);
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao salvar dados prefetchados:', error);
      throw new AppError('prefetch_save_error', 'Falha ao salvar dados prefetchados', false);
    }
  }

  /**
   * Obtém dados prefetchados
   */
  public async getPrefetchedData<T>(
    type: PrefetchResourceType,
    params: any,
  ): Promise<T | null> {
    try {
      const key = this.getPrefetchKey(type, params);

      // Verifica primeiro no cache em memória (mais rápido)
      if (memoryCache[key] && Date.now() < memoryCache[key].metadata.expiresAt) {
        return memoryCache[key].data as T;
      }

      // Se não estiver em memória, verifica no AsyncStorage
      const storageData = await AsyncStorage.getItem(STORAGE_KEYS.PREFETCH_DATA);
      if (!storageData) return null;

      const prefetchStorage: Record<string, PrefetchedResource> = JSON.parse(storageData);
      const resource = prefetchStorage[key];

      if (resource && Date.now() < resource.metadata.expiresAt) {
        // Salva no cache em memória para acessos futuros
        memoryCache[key] = resource;
        return resource.data as T;
      }

      return null;
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao obter dados prefetchados:', error);
      return null;
    }
  }

  /**
   * Limpa dados de prefetch expirados
   */
  private async clearExpiredPrefetchData(): Promise<void> {
    try {
      const storageData = await AsyncStorage.getItem(STORAGE_KEYS.PREFETCH_DATA);
      if (!storageData) return;

      const prefetchStorage: Record<string, PrefetchedResource> = JSON.parse(storageData);
      const now = Date.now();
      let hasChanges = false;

      // Remove entradas expiradas
      for (const key in prefetchStorage) {
        if (prefetchStorage[key].metadata.expiresAt < now) {
          delete prefetchStorage[key];
          delete memoryCache[key]; // Também remove do cache em memória
          hasChanges = true;
        }
      }

      // Se houve mudanças, salva o storage atualizado
      if (hasChanges) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PREFETCH_DATA,
          JSON.stringify(prefetchStorage),
        );
        logger.info('[PrefetchManager] Dados expirados removidos');
      }
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao limpar dados expirados:', error);
    }
  }

  /**
   * Verifica e atualiza dados prefetchados se necessário
   */
  private async checkAndUpdatePrefetchedData(): Promise<void> {
    try {
      if (this.prefetchInProgress) return;
      this.prefetchInProgress = true;

      const config = PREFETCH_CONFIG[this.networkStatus];
      if (!config.enabled) {
        this.prefetchInProgress = false;
        return;
      }

      // Verifica quando foi a última atualização
      const lastUpdateStr = await AsyncStorage.getItem(STORAGE_KEYS.PREFETCH_TIMESTAMP);
      const lastUpdate = lastUpdateStr ? parseInt(lastUpdateStr, 10) : 0;
      const now = Date.now();

      // Se a última atualização foi há menos de 1 hora, não atualiza
      if (now - lastUpdate < 60 * 60 * 1000) {
        this.prefetchInProgress = false;
        return;
      }

      // Prefetch de eventos para os próximos meses
      if (config.prefetchMonths > 0) {
        this.prefetchEvents(config.prefetchMonths);
      }

      // Prefetch de notificações
      if (config.prefetchNotifications) {
        this.prefetchNotifications();
      }

      // Prefetch de configurações
      if (config.prefetchSettings) {
        this.prefetchSettings();
      }

      // Prefetch de dados do perfil
      if (config.prefetchProfile) {
        this.prefetchProfile();
      }

      this.prefetchInProgress = false;
    } catch (error) {
      this.prefetchInProgress = false;
      logger.error('[PrefetchManager] Erro ao verificar dados prefetchados:', error);
    }
  }

  /**
   * Pré-carrega eventos para os próximos meses
   */
  private async prefetchEvents(months: number): Promise<void> {
    try {
      // Já em progresso? Retorna a promise existente para evitar duplicação
      const prefetchKey = this.getPrefetchKey(PrefetchResourceType.EVENTS, { months });
      const existingPromise = this.ongoingPrefetchPromises[prefetchKey];
      if (existingPromise) {
        return existingPromise;
      }

      // Cria uma nova promise para o prefetch
      const prefetchPromise = (async () => {
        const now = moment();
        const startOfMonth = now.clone().startOf('month');
        const endOfPrefetch = now.clone().add(months, 'months').endOf('month');

        // Criar um mock da função getAllEvents - em um app real, seria uma 
        // chamada para o serviço real - apenas para demonstração
        const mockGetAllEvents = async (start: Date, end: Date) => {
          // Simular dados de eventos
          return [
            { id: '1', title: 'Evento 1', data: new Date() },
            { id: '2', title: 'Evento 2', data: new Date() }
          ];
        };

        // Buscar eventos para o período
        const events = await mockGetAllEvents(
          startOfMonth.toDate(),
          endOfPrefetch.toDate(),
        );

        // Salvar dados pré-carregados
        await this.savePrefetchedData(
          PrefetchResourceType.EVENTS,
          { months },
          events,
          60 * 24, // Expiração em 24 horas
        );

        return events;
      })();

      // Armazena a promise em andamento
      this.ongoingPrefetchPromises[prefetchKey] = prefetchPromise;

      // Aguarda a conclusão e remove da lista de prefetches em andamento
      await prefetchPromise;
      delete this.ongoingPrefetchPromises[prefetchKey];

      logger.info(`[PrefetchManager] Eventos para ${months} meses prefetchados`);
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao prefetchar eventos:', error);
    }
  }

  /**
   * Pré-carrega notificações
   */
  private async prefetchNotifications(): Promise<void> {
    try {
      // Já em progresso? Retorna a promise existente
      const prefetchKey = this.getPrefetchKey(PrefetchResourceType.NOTIFICATIONS, {});
      const existingPromise = this.ongoingPrefetchPromises[prefetchKey];
      if (existingPromise) {
        return existingPromise;
      }

      // Cria uma nova promise para o prefetch
      const prefetchPromise = (async () => {
        // Mock da função getNotifications
        const mockGetNotifications = async () => {
          return [
            { id: '1', title: 'Notificação 1', read: false },
            { id: '2', title: 'Notificação 2', read: true }
          ];
        };

        const notifications = await mockGetNotifications();

        await this.savePrefetchedData(
          PrefetchResourceType.NOTIFICATIONS,
          {},
          notifications,
          30, // Expiração em 30 minutos
        );

        return notifications;
      })();

      // Armazena a promise em andamento
      this.ongoingPrefetchPromises[prefetchKey] = prefetchPromise;

      // Aguarda a conclusão e remove da lista
      await prefetchPromise;
      delete this.ongoingPrefetchPromises[prefetchKey];

      logger.info('[PrefetchManager] Notificações prefetchadas');
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao prefetchar notificações:', error);
    }
  }

  /**
   * Pré-carrega configurações
   */
  private async prefetchSettings(): Promise<void> {
    try {
      // Implementação similar às anteriores
      const prefetchKey = this.getPrefetchKey(PrefetchResourceType.SETTINGS, {});
      const existingPromise = this.ongoingPrefetchPromises[prefetchKey];
      if (existingPromise) {
        return existingPromise;
      }

      const prefetchPromise = (async () => {
        // Mock
        const mockGetSettings = async () => {
          return {
            theme: 'light',
            notifications: true,
            language: 'pt-BR'
          };
        };

        const settings = await mockGetSettings();

        await this.savePrefetchedData(
          PrefetchResourceType.SETTINGS,
          {},
          settings,
          60 * 12, // Expiração em 12 horas
        );

        return settings;
      })();

      this.ongoingPrefetchPromises[prefetchKey] = prefetchPromise;
      await prefetchPromise;
      delete this.ongoingPrefetchPromises[prefetchKey];

      logger.info('[PrefetchManager] Configurações prefetchadas');
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao prefetchar configurações:', error);
    }
  }

  /**
   * Pré-carrega dados do perfil
   */
  private async prefetchProfile(): Promise<void> {
    try {
      // Implementação similar às anteriores
      const prefetchKey = this.getPrefetchKey(PrefetchResourceType.PROFILE, {});
      const existingPromise = this.ongoingPrefetchPromises[prefetchKey];
      if (existingPromise) {
        return existingPromise;
      }

      const prefetchPromise = (async () => {
        // Mock
        const mockGetProfile = async () => {
          return {
            name: 'Advogado Exemplo',
            email: 'advogado@exemplo.com',
            role: 'advogado'
          };
        };

        const profile = await mockGetProfile();

        await this.savePrefetchedData(
          PrefetchResourceType.PROFILE,
          {},
          profile,
          60 * 24, // Expiração em 24 horas
        );

        return profile;
      })();

      this.ongoingPrefetchPromises[prefetchKey] = prefetchPromise;
      await prefetchPromise;
      delete this.ongoingPrefetchPromises[prefetchKey];

      logger.info('[PrefetchManager] Perfil prefetchado');
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao prefetchar perfil:', error);
    }
  }

  /**
   * Força o prefetch de um tipo específico de dados
   */
  public async forcePrefetch(
    type: PrefetchResourceType,
    params: any = {},
    expirationMinutes: number = 60,
  ): Promise<any> {
    try {
      switch (type) {
        case PrefetchResourceType.EVENTS:
          const months = params.months || 2;
          return await this.prefetchEvents(months);
        case PrefetchResourceType.NOTIFICATIONS:
          return await this.prefetchNotifications();
        case PrefetchResourceType.SETTINGS:
          return await this.prefetchSettings();
        case PrefetchResourceType.PROFILE:
          return await this.prefetchProfile();
        default:
          throw new AppError(
            'invalid_prefetch_type',
            `Tipo de prefetch inválido: ${type}`,
            false,
          );
      }
    } catch (error) {
      logger.error(`[PrefetchManager] Erro ao forçar prefetch de ${type}:`, error);
      throw error;
    }
  }

  /**
   * Limpa todos os dados de prefetch
   */
  public async clearAllPrefetchData(): Promise<void> {
    try {
      // Limpa o cache em memória
      for (const key in memoryCache) {
        delete memoryCache[key];
      }

      // Limpa o storage
      await AsyncStorage.removeItem(STORAGE_KEYS.PREFETCH_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.PREFETCH_TIMESTAMP);

      logger.info('[PrefetchManager] Todos os dados de prefetch foram limpos');
    } catch (error) {
      logger.error('[PrefetchManager] Erro ao limpar dados de prefetch:', error);
      throw new AppError('prefetch_clear_error', 'Falha ao limpar dados de prefetch', false);
    }
  }
}

// Exporta uma instância única do gerenciador (Singleton)
export const prefetchManager = new PrefetchManager();
