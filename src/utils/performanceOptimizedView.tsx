import React, { memo } from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Componente View otimizado para performance que previne re-renders desnecessários
 * Usa React.memo para evitar renderização quando as props não mudam
 */
export const PerformanceOptimizedView = memo(({ 
  children, 
  style, 
  ...props 
}: ViewProps) => {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
});

/**
 * Use este HOC para envolver componentes que não devem ser renderizados 
 * novamente a menos que suas props mudem
 */
export function withPerformanceOptimization<T>(Component: React.ComponentType<T>) {
  return memo(Component);
}
