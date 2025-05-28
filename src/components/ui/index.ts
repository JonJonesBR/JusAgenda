// src/components/ui/index.ts

// Reexporta todos os componentes de UI para facilitar a importação em outros módulos.
// Exemplo de importação em outro arquivo:
// import { Card, Button, Input } from '../components/ui';

export { default as Button } from './Button';
export type { ButtonProps, ButtonType, ButtonSize } from './Button'; // Exporta os tipos do Button

export { default as Card } from './Card';
export { default as Header } from './Header';
export { default as Input } from './Input';
export { default as InputDialog } from './InputDialog';
export { default as List } from './List';
export type { ListItem } from './List'; // Exporta o tipo ListItem também
export { default as Section } from './Section';

// Para o Toast, exportamos a API estática e o Provider
export { Toast, ToastProvider } from './Toast';
export type { ToastType, ToastProps } from './Toast'; // Exporta os tipos do Toast

// Adicione aqui outros componentes de UI que você criar na pasta 'ui'.
// Por exemplo:
// export { default as Avatar } from './Avatar';
// export { default as Badge } from './Badge';
// export { default as Modal } from './Modal';
// export { default as Spinner } from './Spinner';
// export { default as Switch } from './SwitchComponent'; // Se tiver um Switch customizado
// export { default as Tooltip } from './Tooltip';
