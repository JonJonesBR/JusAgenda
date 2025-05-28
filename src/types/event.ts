// src/types/event.ts

/**
 * Representa um contato associado a um evento.
 */
export interface Contact {
  id: string;
  name: string;
  phone?: string; // Telefone é opcional
  email?: string; // Email é opcional
  role?: string; // Papel do contato no evento (ex: Cliente, Testemunha)
}

/**
 * Define a regra de recorrência para um evento.
 * TODO: Expandir conforme necessário (ex: intervalo, dias da semana, etc.)
 */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  endDate?: string; // Data final da recorrência, formato YYYY-MM-DD
  // Outras propriedades de recorrência podem ser adicionadas aqui
}

/**
 * Status possíveis para um evento.
 */
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'postponed' | 'pending';

/**
 * Representa um lembrete para um evento, em minutos antes do evento.
 * Ex: [15, 60] para lembretes 15 minutos e 1 hora antes.
 */
export type Reminder = number; // Em minutos antes do evento

/**
 * Estrutura principal para um Evento.
 */
export interface Event {
  id: string; // Identificador único do evento, gerado automaticamente
  title: string; // Título do evento, obrigatório
  data: string; // Data do evento no formato YYYY-MM-DD, obrigatório
  hora?: string; // Hora do evento no formato HH:MM, opcional
  description?: string; // Descrição mais detalhada do evento, opcional
  local?: string; // Local do evento, opcional
  eventType?: string; // Tipo de evento (ex: 'audiencia', 'reuniao', 'prazoProcessual'), opcional
  status?: EventStatus; // Status do evento, opcional, default pode ser 'scheduled'
  isAllDay?: boolean; // Indica se o evento dura o dia todo, opcional

  // Detalhes do Processo (se aplicável)
  numeroProcesso?: string; // Número do processo judicial, opcional
  vara?: string; // Vara ou tribunal, opcional
  comarca?: string; // Comarca, opcional
  instancia?: string; // Instância (1ª, 2ª, etc.), opcional
  naturezaAcao?: string; // Natureza da ação (Cível, Criminal, Trabalhista), opcional
  faseProcessual?: string; // Fase atual do processo, opcional
  linkProcesso?: string; // Link para o processo eletrônico, opcional

  // Contatos associados ao evento
  contacts?: Contact[]; // Lista de contatos, opcional

  // Recorrência
  recurrenceRule?: RecurrenceRule; // Regra de recorrência, opcional

  // Lembretes
  reminders?: Reminder[]; // Lista de lembretes em minutos antes do evento, opcional

  // Metadados
  createdBy?: string; // ID do usuário que criou o evento, opcional
  createdAt?: string; // Timestamp de criação (ISO 8601 string), opcional
  updatedAt?: string; // Timestamp da última atualização (ISO 8601 string), opcional
  cor?: string; // Cor para exibição no calendário (hex string, ex: '#FF0000'), opcional
  anexos?: Array<{ nome: string; url: string; tipo?: string }>; // Lista de anexos, opcional

  // Campos específicos que existiam antes e podem ser úteis manter
  clienteId?: string; // ID do cliente associado (se houver)
  clienteNome?: string; // Nome do cliente (pode ser útil para exibição rápida)
  prioridade?: 'baixa' | 'media' | 'alta'; // Prioridade do evento
  dataFim?: string; // Data de término para eventos com duração, formato YYYY-MM-DD
  horaFim?: string; // Hora de término para eventos com duração, formato HH:MM
  observacoes?: string; // Observações adicionais
  presencaObrigatoria?: boolean; // Se a presença é obrigatória

  // Campos que estavam como opcionais e podem ser mantidos como tal
  dataNascimento?: string; // Formato YYYY-MM-DD (se relevante para o evento)
  tipo?: string; // Pode ser um alias para eventType ou um campo diferente
  // Adicione quaisquer outros campos que façam sentido para o seu domínio
}

// Exemplo de como um evento poderia ser (apenas para ilustração, não é um tipo exportado)
/*
const exampleEvent: Event = {
  id: '123',
  title: 'Audiência Inicial',
  data: '2024-07-15',
  hora: '14:30',
  eventType: 'audiencia',
  numeroProcesso: '0012345-67.2024.8.26.0001',
  local: 'Fórum Central, Sala 101',
  status: 'scheduled',
  reminders: [15, 60], // 15 min e 1 hora antes
  cor: '#3a86ff',
};
*/
