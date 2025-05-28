// src/types/event.ts

export interface Contact {
  id: string;
  nome: string;
  tipo?: 'cliente' | 'advogado' | 'testemunha' | 'outro'; // Tipos de contato
  telefone?: string;
  email?: string;
}

export type RecurrenceRule = 'nao_repete' | 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual';
export type EventStatus = 'agendado' | 'realizado' | 'cancelado' | 'adiado' | 'pendente';

export interface Event {
  id: string;
  title: string;
  data: string;
  dataNascimento?: Date | string;
  hora?: string;

  local?: string;
  descricao?: string;
  tipo?: string;

  // Campos relacionados a processos judiciais (opcionais)
  processo?: string; // Número do processo
  vara?: string; // Vara ou juízo
  comarca?: string; // Comarca

  // Envolvidos (opcionais)
  clienteEnvolvido?: string; // Nome ou ID do cliente principal
  advogadoResponsavel?: string; // Nome ou ID do advogado

  // Gerenciamento do evento (opcionais)
  status?: EventStatus; // Status atual do evento
  lembretes?: number[]; // Array de minutos antes do evento para lembrete (ex: [15, 60] para 15min e 1h antes)
  recorrencia?: RecurrenceRule; // Regra de recorrência
  
  contatos?: Contact[]; // Lista de contatos associados ao evento
  
  // Campos de auditoria (opcionais, gerenciados automaticamente se houver backend)
  // criadoEm?: string; // Data ISO de criação
  // atualizadoEm?: string; // Data ISO da última atualização
  // criadoPor?: string; // ID do usuário que criou

  // Outros campos customizados que você possa precisar
  // prioridade?: 'baixa' | 'media' | 'alta';
  // anexos?: { nome: string; url: string }[];
}
