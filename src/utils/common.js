/**
 * Utilitários comuns compartilhados entre os módulos da aplicação.
 * Centraliza configurações, cores e funções frequentemente utilizadas.
 */

import moment from "moment";
import "moment/locale/pt-br";

// Configuração global do moment para pt-br
moment.locale("pt-br");

// Cores do tema
export const COLORS = {
  primary: "#6200ee",
  secondary: "#03dac6",
  error: "#ff0266",
  warning: "#FFA500",
  success: "#4CAF50",
  info: "#2196F3",
  textPrimary: "#000000",
  textSecondary: "#757575",
  background: "#f5f5f5",
  card: "#ffffff",
  border: "#e0e0e0",
};

// Tipos de eventos
export const EVENT_TYPES = {
  AUDIENCIA: "audiencia",
  REUNIAO: "reuniao",
  PRAZO: "prazo",
  DESPACHO: "despacho",
  JULGAMENTO: "julgamento",
  PERICIA: "pericia",
  SUSTENTACAO: "sustentacao",
  INTIMACAO: "intimacao",
  CITACAO: "citacao",
  CONCILIACAO: "conciliacao",
  DILIGENCIA: "diligencia",
  OUTROS: "outros",
};

// Tipos de competência
export const AREAS_JURIDICAS = {
  CIVEL: "civel",
  CRIMINAL: "criminal",
  TRABALHISTA: "trabalhista",
  PREVIDENCIARIO: "previdenciario",
  TRIBUTARIO: "tributario",
  CONSUMIDOR: "consumidor",
  FAMILIA: "familia",
  ADMINISTRATIVO: "administrativo",
  EMPRESARIAL: "empresarial",
  AMBIENTAL: "ambiental",
};

// Fases processuais
export const FASES_PROCESSUAIS = {
  CONHECIMENTO: "Conhecimento",
  RECURSAL: "Recursal",
  EXECUCAO: "Execução",
  CUMPRIMENTO: "Cumprimento de Sentença",
};

// Prioridades
export const PRIORIDADES = {
  ALTA: "alta",
  MEDIA: "media",
  BAIXA: "baixa",
};

// Configurações comuns de estilo para navegadores
export const COMMON_STYLES = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
};

// Funções utilitárias
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const formatErrorMessage = (error) =>
  error?.message || "Ocorreu um erro inesperado";

// Formatar número de processo no padrão CNJ
export const formatarNumeroProcesso = (numero) => {
  if (!numero) return "";

  // Remove caracteres não numéricos
  const numerosApenas = numero.replace(/\D/g, "");

  // Verifica se tem o tamanho correto (20 dígitos)
  if (numerosApenas.length !== 20) return numero;

  // Formata no padrão CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  return `${numerosApenas.substring(0, 7)}-${numerosApenas.substring(
    7,
    9
  )}.${numerosApenas.substring(9, 13)}.${numerosApenas.substring(
    13,
    14
  )}.${numerosApenas.substring(14, 16)}.${numerosApenas.substring(16, 20)}`;
};

// Exporta o moment já configurado
export { moment };
