export interface Event {
  id: string;
  title: string;
  tipo?: string;
  data?: Date | string;
  hora?: string; // Adicionado campo para hora
  cliente?: string;
  descricao?: string;
  local?: string;
  numeroProcesso?: string;
  competencia?: string;
  vara?: string;
  comarca?: string;
  estado?: string;
  reu?: string;
  telefoneCliente?: string;
  emailCliente?: string;
  telefoneReu?: string;
  emailReu?: string;
  juiz?: string;
  promotor?: string;
  perito?: string;
  prepostoCliente?: string;
  testemunhas?: string;
  documentosNecessarios?: string;
  valor?: string;
  honorarios?: string;
  prazoDias?: string;
  fase?: string;
  prioridade?: string;
  observacoes?: string;
  presencaObrigatoria?: boolean;
  lembretes?: string[];
  contatos?: Contact[];
}

export interface Contact {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export type EventMap = {
  [date: string]: Event[];
};
