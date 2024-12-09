/**
 * @typedef {Object} Theme
 * @property {string} fundo
 * @property {string} primaria
 * @property {string} secundaria
 * @property {string} texto
 * @property {string} cartao
 */

export function criarTema(fundo, primaria, secundaria, texto, cartao) {
  return {
    fundo,
    primaria,
    secundaria,
    texto,
    cartao
  };
}

export const lightTheme = criarTema(
  '#F4F7F9', // fundo
  '#1A5F7A', // primaria
  '#134B6A', // secundaria
  '#333333', // texto
  '#FFFFFF' // cartao
);

export const darkTheme = criarTema(
  '#121212', // fundo
  '#2C8CB4', // primaria
  '#1F6E9C', // secundaria
  '#E0E0E0', // texto
  '#1E1E1E' // cartao
);
