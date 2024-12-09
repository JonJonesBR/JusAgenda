/**
 * @typedef {Object} CampoDoEvento
 * @property {string} nome
 * @property {string} label
 * @property {string} tipo
 */

const camposComuns = {
  numeroDoProcesso: { nome: 'numeroDoProcesso', label: 'Número do Processo', tipo: 'texto' },
  vara: { nome: 'vara', label: 'Vara', tipo: 'texto' },
  observacoes: { nome: 'observacoes', label: 'Observações', tipo: 'textarea' }
};

/**
 * @type {Object<string, CampoDoEvento[]>}
 */
export const eventFields = {
  audiencia: [
    camposComuns.numeroDoProcesso,
    camposComuns.vara,
    { nome: 'parteAutora', label: 'Parte Autora', tipo: 'texto' },
    { nome: 'parteRe', label: 'Parte Ré', tipo: 'texto' },
    { nome: 'localDaAudiencia', label: 'Local da Audiência', tipo: 'texto' },
    camposComuns.observacoes
  ],
  reuniao: [
    { nome: 'nomeDoCliente', label: 'Nome do Cliente', tipo: 'texto' },
    { nome: 'localDaReuniao', label: 'Local da Reunião', tipo: 'texto' },
    { nome: 'assunto', label: 'Assunto', tipo: 'texto' },
    camposComuns.observacoes
  ],
  prazo: [
    camposComuns.numeroDoProcesso,
    camposComuns.vara,
    { nome: 'tipoDePrazo', label: 'Tipo de Prazo', tipo: 'select' },
    camposComuns.observacoes
  ]
};

export function adicionarCampo(tipoDeEvento, campo) {
  eventFields[tipoDeEvento].push(campo);
}
