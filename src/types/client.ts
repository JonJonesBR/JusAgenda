// src/types/client.ts

// Define a interface para o endereço do cliente
export interface ClientAddress {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Define a interface principal para Cliente
export interface Client {
  id: string; // Obrigatório
  nome: string; // Obrigatório (Nome ou Razão Social)
  tipo: 'pessoaFisica' | 'pessoaJuridica'; // Obrigatório

  // Campos comuns
  email?: string;
  telefone?: string;
  observacoes?: string;
  endereco?: ClientAddress; // Usa a interface ClientAddress
  pontoReferencia?: string;
  documentosAdicionais?: string; // Campo genérico para outros docs

  // Campos específicos para Pessoa Física
  // nomeFantasia?: never; // Comentado pois pode ser útil ter como opcional no tipo base
  cpf?: string;
  rg?: string;
  orgaoEmissor?: string;
  estadoCivil?: string;
  profissao?: string;
  dataNascimento?: string; // Formato YYYY-MM-DD

  // Campos específicos para Pessoa Jurídica
  nomeFantasia?: string; // Pode ser opcional no tipo base, mas obrigatório via Yup para PJ
  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  ramoAtividade?: string;
  responsavelLegal?: string;
}

// Tipos mais específicos (opcional, mas pode ajudar na lógica de negócios)
export type PessoaFisica = Client & {
  tipo: 'pessoaFisica';
  cpf: string; // CPF obrigatório para PF
  // Outros campos obrigatórios para PF, se houver
};

export type PessoaJuridica = Client & {
  tipo: 'pessoaJuridica';
  cnpj: string; // CNPJ obrigatório para PJ
  nomeFantasia: string; // Nome Fantasia obrigatório para PJ
  // Outros campos obrigatórios para PJ, se houver
};
