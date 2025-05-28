// src/__mocks__/react-native/Libraries/Animated/NativeAnimatedHelper.js

/**
 * Mock minimalista para o NativeAnimatedHelper.
 *
 * A API Animated do React Native é complexa e o NativeAnimatedHelper é um módulo interno.
 * Para a maioria dos cenários de teste unitário, um mock que exporta um objeto vazio
 * ou funções no-op (sem operação) é suficiente. O objetivo principal é
 * evitar erros se o código sob teste tentar interagir com este módulo
 * no ambiente Jest, onde a implementação nativa completa não está disponível.
 *
 * Se os seus testes falharem especificamente devido a uma função ou propriedade
 * em falta deste módulo, você pode adicioná-la aqui como uma jest.fn() ou um valor mockado.
 * Exemplo:
 * // someFunction: jest.fn(),
 * // SOME_CONSTANT: 'mockValue',
 *
 * No entanto, comece com o mock mais simples possível.
 */

const NativeAnimatedHelper = {
  // Atualmente, mantemos como um objeto vazio, alinhado com o mock original
  // que era `module.exports = {};`.
  // Adicione propriedades/funções mockadas aqui se os seus testes o exigirem.
};

export default NativeAnimatedHelper;

// Se o seu setup de teste estiver configurado para esperar CommonJS para este mock específico,
// e `export default` causar problemas, você pode usar:
// module.exports = NativeAnimatedHelper;
// ou simplesmente:
// module.exports = {}; // Como no seu mock original.
