// src/__mocks__/@react-navigation/native-stack.js
import React from 'react';

/**
 * Mock para o `createNativeStackNavigator` de `@react-navigation/native-stack`.
 * Esta função, quando chamada nos testes, retorna um objeto com
 * componentes `Navigator` e `Screen` mockados.
 * Envolvemos a função principal com jest.fn() para permitir o rastreamento de chamadas.
 */
export const createNativeStackNavigator = jest.fn(() => ({
  /**
   * Mock do componente Navigator.
   * Nos testes, ele simplesmente renderiza os seus `children`.
   * Os `children` de um Navigator são tipicamente os seus componentes `Screen`.
   * @param {object} props - Props passadas para o Navigator, principalmente `children`.
   * @returns {React.ReactElement} Os componentes filhos.
   */
  Navigator: ({ children }) => {
    // console.log('[Mock NativeStack.Navigator] A renderizar children');
    return <>{children}</>;
  },

  /**
   * Mock do componente Screen.
   * Nos testes, este mock renderiza o componente que é passado através da prop `component`.
   * Todas as outras props passadas para `Screen` são encaminhadas para o `Component`.
   * Isto é útil para testar a composição de ecrãs dentro de um Navigator mockado,
   * permitindo que o conteúdo real do ecrã seja renderizado.
   * @param {object} props - Props passadas para o Screen. A prop `component` é o ecrã a ser renderizado.
   * @returns {React.ReactElement|null} O componente do ecrã renderizado ou null se nenhum componente for fornecido.
   */
  Screen: ({ component: Component, ...props }) => {
    // console.log('[Mock NativeStack.Screen] A renderizar componente:', Component ? Component.name : 'undefined', 'com props:', props);
    if (!Component) {
      // Se nenhum componente for fornecido (o que seria um erro de uso da biblioteca real),
      // o mock não renderiza nada para evitar quebrar os testes.
      // console.warn('[Mock NativeStack.Screen] A prop "component" não foi fornecida ao Screen mockado.');
      return null;
    }
    // Renderiza o componente do ecrã com todas as props recebidas.
    // Note que isto inclui props específicas de navegação como 'name' e 'options'.
    // O seu componente de ecrã pode não esperar estas props, mas para muitos cenários de teste
    // de renderização básica, isto é aceitável e útil.
    return <Component {...props} />;
  },
}));

// Se a sua aplicação usar outros exports de '@react-navigation/native-stack'
// (como tipos específicos para props de ecrã ou opções, embora tipos TypeScript
// geralmente não precisem ser mockados desta forma), você pode adicioná-los aqui.
// Por exemplo:
// export const NativeStackView = ({ children }) => <View>{children}</View>; // Mock muito simplificado
