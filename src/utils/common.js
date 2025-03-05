/**
 * Utilitários comuns compartilhados entre os módulos da aplicação.
 * Centraliza configurações, cores e funções frequentemente utilizadas.
 */

import moment from 'moment';
import 'moment/locale/pt-br';

// Configuração global do moment para pt-br
moment.locale('pt-br');

// Cores do tema
export const COLORS = {
  primary: '#6200ee',
  secondary: '#03dac6',
  error: '#ff0266',
  text: {
    primary: '#000000',
    secondary: '#757575',
  },
  background: '#f5f5f5',
};

// Tipos de eventos
export const EVENT_TYPES = {
  AUDIENCIA: 'audiencia',
  REUNIAO: 'reuniao',
  PRAZO: 'prazo',
  OUTROS: 'outros',
};

// Configurações comuns de estilo para navegadores
export const COMMON_STYLES = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

// Funções utilitárias
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const formatErrorMessage = (error) =>
  error?.message || 'Ocorreu um erro inesperado';

// Exporta o moment já configurado
export { moment };
