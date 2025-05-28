// src/utils/prefetchManager.ts

import { Event as EventType } from '../types/event'; // Importando o tipo Event
// Se você tiver uma função para buscar eventos (ex: do EventCrudContext ou um serviço), importe-a aqui.
// import { fetchEventsForDateAPI } from '../services/apiService'; // Exemplo

interface PrefetchTask {
  date: string; // Data para a qual pré-buscar eventos (formato YYYY-MM-DD)
  // Outros parâmetros para a tarefa de prefetch, se necessário
}

/**
 * Gerencia o pré-carregamento de dados, como eventos do calendário.
 * Implementado como um Singleton.
 */
export class PrefetchManager {
  private static instance: PrefetchManager | null = null;
  private prefetchQueue: PrefetchTask[] = [];
  private isFetching = false;
  private activeFetches: Set<string> = new Set(); // Para rastrear datas já em processo de fetch ou buscadas recentemente

  // Construtor privado para o padrão Singleton
  private constructor() {
    // Inicializações, se houver
    console.log('PrefetchManager instanciado.');
  }

  /**
   * Obtém a instância Singleton do PrefetchManager.
   * @returns A instância do PrefetchManager.
   */
  public static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  /**
   * Adiciona uma data à fila de pré-carregamento.
   * @param dateString - A data no formato YYYY-MM-DD.
   */
  public queuePrefetchForDate(dateString: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.warn(`PrefetchManager: Formato de data inválido para prefetch: ${dateString}. Esperado YYYY-MM-DD.`);
      return;
    }

    // Evita adicionar à fila se já estiver em processo ou foi buscado recentemente
    // (a lógica de "recentemente" pode ser mais complexa, ex: com timestamp)
    if (this.prefetchQueue.some(task => task.date === dateString) || this.activeFetches.has(dateString)) {
      // console.log(`PrefetchManager: Pré-carregamento para ${dateString} já na fila ou ativo.`);
      return;
    }

    this.prefetchQueue.push({ date: dateString });
    // console.log(`PrefetchManager: Data ${dateString} adicionada à fila de prefetch. Fila atual:`, this.prefetchQueue.length);
    this.processPrefetchQueue();
  }

  /**
   * Processa a fila de pré-carregamento.
   * Pega a próxima tarefa da fila e inicia o fetch se não houver outro em andamento.
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.isFetching || this.prefetchQueue.length === 0) {
      return;
    }

    this.isFetching = true;
    const task = this.prefetchQueue.shift(); // Pega a primeira tarefa da fila

    if (task) {
      if (this.activeFetches.has(task.date)) {
        // console.log(`PrefetchManager: Fetch para ${task.date} já foi iniciado ou concluído recentemente. Pulando.`);
        this.isFetching = false;
        this.processPrefetchQueue(); // Tenta processar a próxima
        return;
      }

      // console.log(`PrefetchManager: Iniciando pré-carregamento para a data: ${task.date}`);
      this.activeFetches.add(task.date); // Marca como ativo

      try {
        // Simula o fetch de eventos para a data.
        // Substitua pela sua lógica real de fetch de eventos.
        const events: EventType[] = await this.fetchEventsForDate(task.date);
        // console.log(`PrefetchManager: Eventos pré-carregados para ${task.date}:`, events.length);

        // Aqui você poderia armazenar os eventos em cache,
        // atualizar um contexto, ou o que for necessário.
        // Ex: this.cacheService.storeEvents(task.date, events);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`PrefetchManager: Erro durante o pré-carregamento para ${task.date}: ${errorMessage}`);
        // Considerar remover de activeFetches em caso de erro para permitir nova tentativa?
        // this.activeFetches.delete(task.date);
      } finally {
        this.isFetching = false;
        // Não remover de activeFetches aqui para evitar re-fetch imediato da mesma data,
        // a menos que você tenha uma estratégia de expiração para activeFetches.
        this.processPrefetchQueue(); // Tenta processar a próxima tarefa da fila
      }
    } else {
      this.isFetching = false; // Garante que isFetching seja resetado se a fila estiver vazia
    }
  }

  /**
   * Simula a busca de eventos para uma data específica.
   * **Substitua esta função pela sua lógica real de fetch de dados.**
   * @param date - A data no formato YYYY-MM-DD.
   * @returns Uma Promise que resolve para uma lista de eventos.
   */
  private async fetchEventsForDate(date: string): Promise<EventType[]> {
    // console.log(`PrefetchManager: Simulando fetch de eventos para a data ${date}...`);
    // Lógica de simulação/placeholder:
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000)); // Simula latência da rede

    // Exemplo: Se você tivesse uma função de API:
    // return fetchEventsForDateAPI(date);

    // Por enquanto, retorna um array vazio como placeholder.
    // Em uma implementação real, você buscaria dados de um serviço, AsyncStorage, ou API.
    // Se esta classe precisar interagir com o EventCrudContext,
    // você precisaria injetar as funções de busca ou o próprio contexto,
    // o que pode complicar o padrão Singleton se o contexto não estiver disponível globalmente.
    // Uma alternativa é este manager emitir eventos e um listener (ex: no App.tsx)
    // reagir e usar o contexto para buscar e armazenar os dados.
    return Promise.resolve([]);
  }

  /**
   * Limpa a fila de prefetch e o rastreamento de fetches ativos.
   * Pode ser útil ao fazer logout ou limpar cache.
   */
  public clearQueueAndActivity(): void {
    this.prefetchQueue = [];
    this.activeFetches.clear();
    this.isFetching = false;
    // console.log('PrefetchManager: Fila e rastreamento de atividade limpos.');
  }
}

// Para usar:
// import { PrefetchManager } from './prefetchManager';
// const prefetcher = PrefetchManager.getInstance();
// prefetcher.queuePrefetchForDate('2024-12-25');
