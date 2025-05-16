import { Event } from '../types/event';

class PrefetchManager {
  private static instance: PrefetchManager;
  private cache: Map<string, Event[]>;
  private prefetchQueue: string[];
  private isFetching: boolean;

  private constructor() {
    this.cache = new Map();
    this.prefetchQueue = [];
    this.isFetching = false;
  }

  public static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  public async prefetchEvents(dates: string[]): Promise<void> {
    this.prefetchQueue.push(...dates);
    if (!this.isFetching) {
      await this.processPrefetchQueue();
    }
  }

  private async processPrefetchQueue(): Promise<void> {
    if (this.prefetchQueue.length === 0) {
      this.isFetching = false;
      return;
    }

    this.isFetching = true;
    const date = this.prefetchQueue.shift()!;

    try {
      if (!this.cache.has(date)) {
        // Aqui você implementaria a lógica real de busca dos eventos
        // Por exemplo, uma chamada à API
        const events: Event[] = await this.fetchEventsForDate(); // Removido argumento date
        this.cache.set(date, events);
      }
    } catch (error) {
      console.error('Error prefetching events:', error);
    }

    await this.processPrefetchQueue();
  }

  private async fetchEventsForDate(): Promise<Event[]> { // Removido parâmetro _date
    // Implementar a lógica real de busca de eventos
    // Este é apenas um placeholder
    return [];
  }

  public getCachedEvents(date: string): Event[] | undefined {
    return this.cache.get(date);
  }

  public clearCache(): void {
    this.cache.clear();
    this.prefetchQueue = [];
    this.isFetching = false;
  }
}

export const prefetchManager = PrefetchManager.getInstance();
