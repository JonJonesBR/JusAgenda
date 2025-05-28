// src/types/client.ts

/**
 * Representa um endereço associado a um cliente.
 */
export interface ClientAddress {
  id?: string; // ID do endereço, se armazenado separadamente
  cep: string; // CEP, obrigatório
  logradouro: string; // Rua, Avenida, etc., obrigatório
  numero: string; // Número do endereço, obrigatório
  complemento?: string; // Complemento, opcional
  bairro: string; // Bairro, obrigatório
  cidade: string; // Cidade, obrigatório
  estado: string; // Sigla do estado (UF), obrigatório (ex: SP, RJ)
  pais?: string; // País, opcional (pode ser fixo como 'Brasil')
  isPrincipal?: boolean; // Indica se é o endereço principal, opcional
}

/**
 * Tipo base para um Cliente.
 * Contém campos comuns a Pessoa Física e Pessoa Jurídica.
 */
interface BaseClient {
  id: string; // Identificador único do cliente, gerado automaticamente
  nome: string; // Nome completo (PF) ou Razão Social (PJ), obrigatório
  email?: string; // Email principal, opcional
  telefonePrincipal?: string; // Telefone principal, opcional
  telefonesSecundarios?: string[]; // Lista de telefones secundários, opcional
  enderecos?: ClientAddress[]; // Lista de endereços, opcional
  dataCadastro?: string; // Data de cadastro no formato YYYY-MM-DD, opcional
  observacoes?: string; // Observações gerais sobre o cliente, opcional
  avatarUrl?: string; // URL para a imagem de avatar/logo do cliente, opcional
  ativo?: boolean; // Indica se o cliente está ativo, opcional (default: true)
}

/**
 * Representa um cliente do tipo Pessoa Física.
 */
export interface PessoaFisica extends BaseClient {
  tipo: 'pessoaFisica';
  cpf: string; // CPF, obrigatório para Pessoa Física, formato 000.000.000-00 ou 00000000000
  rg?: string; // RG, opcional
  dataNascimento?: string; // Data de nascimento no formato YYYY-MM-DD, opcional
  estadoCivil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniaoEstavel'; // Estado civil, opcional
  profissao?: string; // Profissão, opcional
  nacionalidade?: string; // Nacionalidade, opcional
  // Campos específicos de Pessoa Jurídica devem ser opcionais e nunca preenchidos
  cnpj?: never;
  inscricaoEstadual?: never;
  nomeFantasia?: never;
}

/**
 * Representa um cliente do tipo Pessoa Jurídica.
 */
export interface PessoaJuridica extends BaseClient {
  tipo: 'pessoaJuridica';
  cnpj: string; // CNPJ, obrigatório para Pessoa Jurídica, formato 00.000.000/0000-00 ou 00000000000000
  nomeFantasia?: string; // Nome Fantasia, opcional
  inscricaoEstadual?: string; // Inscrição Estadual, opcional
  inscricaoMunicipal?: string; // Inscrição Municipal, opcional
  dataFundacao?: string; // Data de fundação no formato YYYY-MM-DD, opcional
  ramoAtividade?: string; // Ramo de atividade, opcional
  // Campos específicos de Pessoa Física devem ser opcionais e nunca preenchidos
  cpf?: never;
  rg?: never;
  dataNascimento?: never;
  estadoCivil?: never;
  profissao?: never;
}

/**
 * Tipo união para Cliente, pode ser PessoaFisica ou PessoaJuridica.
 * Este é o tipo que você geralmente usará para representar um cliente.
 */
export type Client = PessoaFisica | PessoaJuridica;

// Exemplo de como um cliente Pessoa Física poderia ser:
/*
const exemploPessoaFisica: PessoaFisica = {
  id: 'pf123',
  tipo: 'pessoaFisica',
  nome: 'João da Silva',
  cpf: '123.456.789-00',
  email: 'joao.silva@example.com',
  telefonePrincipal: '(11) 98765-4321',
  dataCadastro: '2023-01-15',
  enderecos: [
    {
      cep: '01000-000',
      logradouro: 'Praça da Sé',
      numero: '100',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
      isPrincipal: true,
    },
  ],
  ativo: true,
};
*/

// Exemplo de como um cliente Pessoa Jurídica poderia ser:
/*
const exemploPessoaJuridica: PessoaJuridica = {
  id: 'pj456',
  tipo: 'pessoaJuridica',
  nome: 'Empresa XYZ Ltda.', // Razão Social
  cnpj: '12.345.678/0001-99',
  nomeFantasia: 'XYZ Soluções Criativas',
  email: 'contato@xyzsolucoes.com.br',
  telefonePrincipal: '(21) 1234-5678',
  dataCadastro: '2022-11-20',
  enderecos: [
    {
      cep: '20000-000',
      logradouro: 'Avenida Principal',
      numero: '500',
      complemento: 'Sala 302',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      isPrincipal: true,
    },
  ],
  ativo: true,
  ramoAtividade: 'Tecnologia',
};
*/
