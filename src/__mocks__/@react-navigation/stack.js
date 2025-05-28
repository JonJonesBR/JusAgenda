// src/__mocks__/@react-navigation/stack.js
import React from 'react';

/**
 * Mock para o `createStackNavigator` de `@react-navigation/stack`.
 * Esta função, quando chamada nos testes, retorna um objeto com
 * componentes `Navigator` e `Screen` mockados.
 * Envolvemos a função principal com jest.fn() para permitir o rastreamento de chamadas.
 */
export const createStackNavigator = jest.fn(() => ({
  /**
   * Mock do componente Navigator.
   * Nos testes, ele simplesmente renderiza os seus `children`.
   * Os `children` de um Navigator são tipicamente os seus componentes `Screen`.
   * @param {object} props - Props passadas para o Navigator, principalmente `children`.
   * @returns {React.ReactElement} Os componentes filhos.
   */
  Navigator: ({ children }) => {
    // console.log('[Mock Stack.Navigator] A renderizar children');
    return <>{children}</>;
  },

  /**
   * Mock do componente Screen.
   * Nos testes, este mock renderiza o componente que é passado através da prop `component`.
   * Todas as outras props passadas para `Screen` são encaminhadas para o `Component`.
   * @param {object} props - Props passadas para o Screen. A prop `component` é o ecrã a ser renderizado.
   * @returns {React.ReactElement|null} O componente do ecrã renderizado ou null se nenhum componente for fornecido.
   */
  Screen: ({ component: Component, ...props }) => {
    // console.log('[Mock Stack.Screen] A renderizar componente:', Component ? Component.name : 'undefined', 'com props:', props);
    if (!Component) {
      // console.warn('[Mock Stack.Screen] A prop "component" não foi fornecida ao Screen mockado.');
      return null;
    }
    return <Component {...props} />;
  },

  /**
   * Mock do componente Group (se você o utilizar).
   * Semelhante ao Navigator, apenas renderiza os children.
   * @param {object} props - Props passadas para o Group, principalmente `children`.
   * @returns {React.ReactElement} Os componentes filhos.
   */
  Group: ({ children }) => {
    // console.log('[Mock Stack.Group] A renderizar children');
    return <>{children}</>;
  }
}));

// Se a sua aplicação usar outros exports de '@react-navigation/stack'
// (como tipos específicos ou componentes auxiliares), você pode adicioná-los aqui.
// Por exemplo, para simular alguns dos componentes de header, se necessário:
// export const Header = (props) => <View {...props} />;
// export const HeaderTitle = (props) => <Text {...props} />;
// export const HeaderBackButton = (props) => <TouchableOpacity {...props}><Text>Back</Text></TouchableOpacity>;

// Geralmente, para testes unitários, mockar o `createStackNavigator` e os seus
// componentes `Navigator` e `Screen` é suficiente.
