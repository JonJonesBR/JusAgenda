// metro.config.js
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname, {
  // Opcional: Defina 'isCSSEnabled' para true se estiver a usar CSS experimental no React Native.
  // isCSSEnabled: true,
});

// Personalizações comuns do Metro:

// 1. Adicionar suporte para mais extensões de ficheiro (ex: .svg)
//    Se estiver a usar SVGs como componentes React com 'react-native-svg-transformer'
//    defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
//    defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg');
//    defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'svg'];

// 2. Configurar o resolver para aliases de caminho (se não estiver a funcionar apenas com babel-plugin-module-resolver)
//    Embora o babel-plugin-module-resolver deva ser suficiente para os aliases,
//    em alguns casos, pode ser necessário ajudar o Metro a encontrar os módulos.
//    Isto é geralmente mais relevante para monorepos ou estruturas de projeto complexas.
//    Para aliases simples dentro de 'src/', o babel-plugin-module-resolver costuma ser suficiente.
/*
defaultConfig.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      if (typeof name !== 'string') {
        return target[name];
      }
      // Exemplo de como mapear um alias para um caminho específico
      // if (name === '@components') {
      //   return path.join(__dirname, 'src/components');
      // }
      // Para aliases mais complexos ou múltiplos, pode ser melhor usar um resolver customizado
      // ou garantir que o babel-plugin-module-resolver esteja a funcionar corretamente.
      return path.join(__dirname, `node_modules/${name}`);
    },
  }
);
*/

// 3. Otimizações de performance (usar com cuidado)
// defaultConfig.transformer.minifierPath = 'metro-minify-terser';
// defaultConfig.transformer.minifierConfig = {
//   // Opções do Terser: https://github.com/terser/terser#minify-options
// };

// 4. Adicionar pastas ao watch do Metro (se tiver código fora da raiz do projeto, ex: num monorepo)
// defaultConfig.watchFolders = [path.resolve(__dirname, '../caminho/para/outra/pasta')];

// Certifique-se de que o plugin do Reanimated está a funcionar corretamente.
// O `babel-preset-expo` já deve lidar com a maior parte da configuração para o Reanimated,
// e o plugin `react-native-reanimated/plugin` no babel.config.js é a parte mais crucial.

// Exporta a configuração final
module.exports = defaultConfig;
