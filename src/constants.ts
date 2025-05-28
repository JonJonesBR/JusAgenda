// src/constants.ts

import { Event, EventStatus, Contact as EventContact, RecurrenceRule, Reminder } from './types/event';
import { Client, PessoaFisica, PessoaJuridica, ClientAddress } from './types/client';

// Tipos de Evento (exemplos, ajuste conforme necessário)
export const EVENT_TYPES = {
  REUNIAO: 'reuniao',
  AUDIENCIA: 'audiencia',
  PRAZO_PROCESSUAL: 'prazoProcessual',
  TAREFA_INTERNA: 'tarefaInterna',
  LIGACAO: 'ligacao',
  VISITA_CLIENTE: 'visitaCliente',
  OUTRO: 'outro',
} as const; // 'as const' para criar um tipo literal a partir das chaves e valores

export type EventTypeKey = keyof typeof EVENT_TYPES;
export type EventTypeValue = typeof EVENT_TYPES[EventTypeKey];

export const EVENT_TYPE_LABELS: Record<EventTypeValue, string> = {
  [EVENT_TYPES.REUNIAO]: 'Reunião',
  [EVENT_TYPES.AUDIENCIA]: 'Audiência',
  [EVENT_TYPES.PRAZO_PROCESSUAL]: 'Prazo Processual',
  [EVENT_TYPES.TAREFA_INTERNA]: 'Tarefa Interna',
  [EVENT_TYPES.LIGACAO]: 'Ligação',
  [EVENT_TYPES.VISITA_CLIENTE]: 'Visita ao Cliente',
  [EVENT_TYPES.OUTRO]: 'Outro',
};

export function getEventTypeLabel(typeValue: EventTypeValue | string | undefined): string {
  if (!typeValue || !EVENT_TYPE_LABELS[typeValue as EventTypeValue]) {
    // console.warn(`Tipo de evento desconhecido: ${typeValue}`);
    return 'Não Especificado';
  }
  return EVENT_TYPE_LABELS[typeValue as EventTypeValue];
}

// Status de Evento (reutilizando de event.ts, mas podemos mapear labels aqui também)
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  postponed: 'Adiado',
  pending: 'Pendente',
};

export function getEventStatusLabel(status: EventStatus | undefined): string {
  if (!status || !EVENT_STATUS_LABELS[status]) {
    return 'Não Especificado';
  }
  return EVENT_STATUS_LABELS[status];
}


// Prioridades de Evento
export const PRIORIDADES = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
} as const;

export type PrioridadeKey = keyof typeof PRIORIDADES;
export type PrioridadeValue = typeof PRIORIDADES[PrioridadeKey];

export const PRIORIDADE_LABELS: Record<PrioridadeValue, string> = {
  [PRIORIDADES.BAIXA]: 'Baixa',
  [PRIORIDADES.MEDIA]: 'Média',
  [PRIORIDADES.ALTA]: 'Alta',
};

export function getPrioridadeLabel(prioridadeValue: PrioridadeValue | string | undefined): string {
  if (!prioridadeValue || !PRIORIDADE_LABELS[prioridadeValue as PrioridadeValue]) {
    // console.warn(`Prioridade desconhecida: ${prioridadeValue}`);
    return 'Não Especificada';
  }
  return PRIORIDADE_LABELS[prioridadeValue as PrioridadeValue];
}

// Definição de campos de evento para formulários ou exibições dinâmicas
// Esta estrutura pode precisar de ajustes dependendo de como você a usa.
// O tipo 'any' aqui é problemático com strict mode, idealmente seria mais específico.
export interface EventField {
  name: keyof Event; // Chave do campo no objeto Event
  label: string;
  type: 'text' | 'date' | 'time' | 'select' | 'textarea' | 'boolean' | 'number' | 'contacts' | 'reminders';
  required?: boolean;
  options?: Array<{ label: string; value: string | number | boolean }>; // Para campos 'select'
  placeholder?: string;
  // Adicionar outras propriedades conforme necessário (ex: maxLength, keyboardType)
}

// Exemplo de campos para diferentes tipos de evento (Pode ser muito complexo manter assim)
// Considere gerar isso dinamicamente ou ter uma abordagem mais simples.
/*
export const EVENT_FIELDS_CONFIG: Record<EventTypeValue, EventField[]> = {
  [EVENT_TYPES.REUNIAO]: [
    { name: 'title', label: 'Título da Reunião', type: 'text', required: true },
    { name: 'data', label: 'Data', type: 'date', required: true },
    { name: 'hora', label: 'Hora', type: 'time' },
    { name: 'local', label: 'Local', type: 'text' },
    { name: 'description', label: 'Pauta/Descrição', type: 'textarea' },
    { name: 'contacts', label: 'Participantes', type: 'contacts' },
    { name: 'reminders', label: 'Lembretes (minutos antes)', type: 'reminders'},
  ],
  // ... outros tipos de evento
  [EVENT_TYPES.PRAZO_PROCESSUAL]: [
    { name: 'title', label: 'Descrição do Prazo', type: 'text', required: true },
    { name: 'data', label: 'Data Final', type: 'date', required: true },
    { name: 'hora', label: 'Hora Final (opcional)', type: 'time' },
    { name: 'numeroProcesso', label: 'Número do Processo', type: 'text' },
    { name: 'prioridade', label: 'Prioridade', type: 'select', options: Object.values(PRIORIDADES).map(p => ({label: PRIORIDADE_LABELS[p], value: p}))},
    { name: 'description', label: 'Observações', type: 'textarea' },
    { name: 'reminders', label: 'Lembretes (minutos antes)', type: 'reminders'},
  ],
  // ...
  [EVENT_TYPES.AUDIENCIA]: [], // Preencher
  [EVENT_TYPES.TAREFA_INTERNA]: [], // Preencher
  [EVENT_TYPES.LIGACAO]: [], // Preencher
  [EVENT_TYPES.VISITA_CLIENTE]: [], // Preencher
  [EVENT_TYPES.OUTRO]: [], // Preencher
};
*/

// Função para adicionar um campo a um tipo de evento (exemplo, pode não ser mais necessário com uma estrutura de formulário mais dinâmica)
/*
export function addFieldToEventType(
  eventType: EventTypeValue,
  field: EventField
): void {
  if (!EVENT_FIELDS_CONFIG[eventType]) {
    throw new Error(`Tipo de evento "${eventType}" não encontrado.`);
  }
  EVENT_FIELDS_CONFIG[eventType].push(field);
}
*/

// Constantes de Rotas da Aplicação
export const ROUTES = {
  // Pilha Principal (Tabs)
  HOME_STACK: 'HomeStack',
  HOME: 'HomeScreen',
  UNIFIED_CALENDAR: 'UnifiedCalendarScreen',

  CLIENTS_STACK: 'ClientsStack',
  CLIENT_LIST: 'ClientListScreen',
  CLIENT_WIZARD: 'ClientWizardScreen', // Para adicionar/editar/visualizar cliente

  SEARCH_STACK: 'SearchStack',
  SEARCH: 'SearchScreen',

  SYNC_STACK: 'SyncStack',
  SYNC_EXPORT_OPTIONS: 'SyncExportOptionsScreen',
  // EMAIL_SYNC was removed
  // EXPORT was removed

  // Telas fora das stacks principais ou modais
  EVENT_DETAILS: 'EventDetailsScreen', // Para adicionar/editar evento
  EVENT_VIEW: 'EventViewScreen', // Para visualizar detalhes do evento
  SETTINGS: 'SettingsScreen',
  FEEDBACK: 'FeedbackScreen',

  // Autenticação (se houver)
  // AUTH_STACK: 'AuthStack',
  // LOGIN: 'LoginScreen',
  // SIGNUP: 'SignUpScreen',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];


// Chaves para AsyncStorage (ou outro mecanismo de armazenamento)
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  SAVED_EVENTS: 'savedEvents',
  SAVED_CLIENTS: 'savedClients',
  LAST_SYNC_TIMESTAMP: 'lastSyncTimestamp',
  USER_EMAIL_FOR_NOTIFICATIONS: 'userEmailForNotifications',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled', // Booleano se notificações gerais estão ativas
  EMAIL_NOTIFICATIONS_ENABLED: 'emailNotificationsEnabled', // Booleano se notificações por email estão ativas
  APP_THEME: 'appTheme', // 'light', 'dark', ou 'system'
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
export type StorageValue = typeof STORAGE_KEYS[StorageKey];


// Configurações da Aplicação
export const APP_CONFIG = {
  API_BASE_URL: 'https://api.meuappjuridico.com/v1', // Exemplo
  REQUEST_TIMEOUT: 15000, // ms
  MAX_FILE_SIZE_MB: 5,
  DEFAULT_REMINDER_MINUTES: [15, 60], // Lembretes padrão: 15 min e 1 hora antes
  MAX_CONTACTS_PER_EVENT: 10,
  VIA_CEP_URL: (cep: string) => `https://viacep.com.br/ws/${cep}/json/`,
} as const;

// Constantes para Prazos e Lembretes (em minutos)
export const REMINDER_OPTIONS = [
  { label: 'No horário do evento', value: 0 },
  { label: '5 minutos antes', value: 5 },
  { label: '15 minutos antes', value: 15 },
  { label: '30 minutos antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 dia antes', value: 24 * 60 },
  { label: '2 dias antes', value: 2 * 24 * 60 },
  { label: '1 semana antes', value: 7 * 24 * 60 },
] as const;


// Outras constantes úteis
export const DEBOUNCE_DELAY = 300; // ms, para inputs de busca, etc.
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'; // Consistente com o tipo Event.data
export const DEFAULT_TIME_FORMAT = 'HH:mm'; // Consistente com o tipo Event.hora
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
export const DISPLAY_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Regex para validações (exemplos)
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, // Formato flexível para telefone BR
  CEP: /^\d{5}-?\d{3}$/,
  CPF: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  CNPJ: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
  // Adicionar outros padrões conforme necessário
} as const;

// Valores padrão para entidades (exemplo)
export const DEFAULT_CLIENT_ADDRESS: ClientAddress = {
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  // pais: 'Brasil', // Pode ser definido aqui se sempre for Brasil
};

// Não é ideal definir um Client completo como padrão devido à união PessoaFisica/PessoaJuridica.
// É melhor criar objetos Client com o 'tipo' correto quando necessário.
/*
export const DEFAULT_CLIENT: Partial<Client> = { // Usar Partial aqui
  nome: '',
  enderecos: [DEFAULT_CLIENT_ADDRESS],
  ativo: true,
};
*/

export const DEFAULT_EVENT_CONTACT: EventContact = {
  id: '', // Será gerado ou pode vir de um picker
  name: '',
};

// Similar ao Client, Event tem muitos campos opcionais.
// É melhor criar um objeto Event com os campos obrigatórios (title, data) quando necessário.
/*
export const DEFAULT_EVENT_DATA: Partial<Event> = {
  title: '',
  data: '', // Deve ser preenchido com a data atual ou selecionada
  isAllDay: false,
  status: 'scheduled',
  reminders: [...APP_CONFIG.DEFAULT_REMINDER_MINUTES],
};
*/
