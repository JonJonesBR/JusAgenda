// babel.config.js
module.exports = function (api) {
  api.cache(true); // Cacheia a configuração do Babel para melhor performance

  const presets = [
    'babel-preset-expo', // Preset padrão do Expo, inclui muitas transformações necessárias
  ];

  const plugins = [
    // Plugin para react-native-reanimated (MUITO IMPORTANTE se estiver a usar Reanimated V2+)
    // Deve ser o último plugin na lista.
    'react-native-reanimated/plugin',

    // Opcional: Plugin para aliases de caminho (module-resolver)
    // Se você decidiu usar os aliases definidos em tsconfig.json (ex: @components/*),
    // precisará deste plugin e da configuração correspondente.
    // Certifique-se de instalar: npm install --save-dev babel-plugin-module-resolver
    // ou yarn add --dev babel-plugin-module-resolver
    [
      'module-resolver',
      {
        root: ['./src'], // Diretório raiz para os aliases
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          // Mapeie os aliases definidos no tsconfig.json -> compilerOptions.paths
          // Remova o '/*' do final do alias do tsconfig.
          // Exemplo: se tsconfig tem "@components/*": ["src/components/*"]
          // aqui fica "@components": "./src/components"
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@navigation": "./src/navigation",
          "@contexts": "./src/contexts",
          "@services": "./src/services",
          "@utils": "./src/utils",
          "@theme": "./src/theme",
          "@types": "./src/types",
          "@constants": "./src/constants.ts", // Para arquivos únicos, o caminho completo
          "@assets": "./assets", // Se tiver aliases para a pasta assets
          // Adicione outros aliases conforme necessário
        },
      },
    ],

    // Adicione outros plugins Babel que você possa precisar
    // Ex: ['@babel/plugin-proposal-decorators', { 'legacy': true }] se usar decorators
  ];

  return {
    presets,
    plugins,
  };
};
