// eslint.config.js
import globals from 'globals'; // Para definir ambientes globais (browser, node, jest, etc.)
import { FlatCompat } from '@eslint/eslintrc'; // Para compatibilidade com configs legadas
import path from 'path'; // Módulo path do Node.js
import { fileURLToPath } from 'url'; // Para obter o caminho do diretório no formato ES Module

// Simula __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa o FlatCompat para usar configs legadas (como as de plugins)
const compat = new FlatCompat({
  baseDirectory: __dirname, // Diretório base para resolver caminhos de configs legadas
  resolvePluginsRelativeTo: __dirname, // Resolve plugins relativos a este diretório
});

// Importa plugins ESLint
// Certifique-se de que estes plugins estão listados como devDependencies no seu package.json
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactNative from 'eslint-plugin-react-native';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'; // Para acessibilidade JSX
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Integração com Prettier
import eslintConfigPrettier from 'eslint-config-prettier'; // Desativa regras ESLint que conflitam com Prettier
import tseslint from 'typescript-eslint'; // Novo pacote para TypeScript ESLint (substitui @typescript-eslint/parser e @typescript-eslint/eslint-plugin)

export default tseslint.config(
  // Configuração base recomendada pelo ESLint
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'], // Aplica a todos os arquivos relevantes
    linterOptions: {
      reportUnusedDisableDirectives: 'warn', // Avisa sobre diretivas de desativação não utilizadas
    },
  },

  // Configurações globais e de linguagem
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest', // Usa a versão mais recente do ECMAScript
      sourceType: 'module', // Usa módulos ES
      parser: tseslint.parser, // Usa o parser do TypeScript ESLint
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Habilita JSX
        },
        project: './tsconfig.json', // Caminho para o seu tsconfig.json (importante para regras type-aware)
        // tsconfigRootDir: __dirname, // Opcional, se tsconfig.json não estiver na raiz
      },
      globals: {
        ...globals.browser, // Globais de browser
        ...globals.node,    // Globais de Node.js (se usar scripts Node)
        ...globals.es2021,  // Globais do ES2021
        // Adicionar aqui quaisquer outras globais específicas do seu projeto
        // Para React Native, muitas globais como `__DEV__` são fornecidas pelo ambiente.
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // Plugin TypeScript ESLint
      'react': eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'react-native': eslintPluginReactNative,
      'jsx-a11y': eslintPluginJsxA11y,
      'prettier': eslintPluginPrettier,
    },
    settings: {
      react: {
        version: 'detect', // Detecta automaticamente a versão do React
      },
      // Configurações para import/resolver se usar aliases ou caminhos customizados
      // 'import/resolver': {
      //   typescript: {}, // Se usar eslint-plugin-import com TypeScript
      //   node: {
      //     extensions: ['.js', '.jsx', '.ts', '.tsx'],
      //   },
      // },
    },
    rules: {
      // Regras base do Prettier (devem vir por último para sobrescrever outras regras de formatação)
      ...eslintConfigPrettier.rules, // Desativa regras ESLint conflitantes com Prettier
      'prettier/prettier': 'warn', // Mostra avisos do Prettier como erros ESLint (ou 'error')

      // Recomendações do TypeScript ESLint (ajuste conforme necessário)
      // As linhas abaixo são equivalentes a estender 'plugin:@typescript-eslint/recommended'
      // e 'plugin:@typescript-eslint/recommended-type-checking' (se project for definido)
      ...tseslint.configs.recommended.rules,
      // Se `parserOptions.project` estiver definido, pode usar regras que exigem informação de tipo:
      // ...tseslint.configs.recommendedTypeChecked.rules, // Cuidado, pode ser muito estrito inicialmente
      // ...tseslint.configs.stylisticTypeChecked.rules, // Regras de estilo com informação de tipo

      // Recomendações do React
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules, // Para o novo JSX transform

      // Recomendações do React Hooks
      ...eslintPluginReactHooks.configs.recommended.rules,

      // Recomendações do React Native (usando a configuração 'all' como base, mas pode ser muito)
      // É melhor escolher regras específicas ou um subconjunto.
      // ...eslintPluginReactNative.configs.all.rules, // CUIDADO: 'all' pode ser muito restritivo.
      // Em vez de 'all', vamos adicionar algumas regras comuns e úteis:
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn', // Avisa sobre estilos inline
      'react-native/no-color-literals': 'off', // Permite cores literais por enquanto, pode ser 'warn'
      'react-native/no-raw-text': ['warn', { skip: ['Button', 'Text', 'Card.Title', 'Dialog.Title', 'ListItem.Title', 'ListItem.Subtitle'] }], // Ajustado para permitir texto em certos componentes
      'react-native/split-platform-components': 'warn', // Avisa sobre Platform.select em arquivos não específicos da plataforma

      // Recomendações do JSX A11y (acessibilidade)
      ...eslintPluginJsxA11y.configs.recommended.rules,
      // Ajustar regras de acessibilidade conforme necessário para React Native
      'jsx-a11y/accessible-emoji': 'off', // Emojis são geralmente OK em React Native
      // Adicione aqui outras configurações de jsx-a11y que façam sentido para o seu app.

      // Suas regras customizadas ou overrides:
      '@typescript-eslint/no-explicit-any': 'warn', // Avisa sobre 'any', mas não proíbe (pode mudar para 'error')
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Avisa sobre vars não usadas
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Permite console.log em dev
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // Regras que você tinha e podem ser mantidas ou ajustadas:
      'react/prop-types': 'off', // TypeScript já lida com prop types
      'react/react-in-jsx-scope': 'off', // Não necessário com o novo JSX transform
      // 'react-native/no-raw-text': 'off', // Já configurado acima de forma mais granular

      // Exemplo de regra type-aware (requer `parserOptions.project`):
      // '@typescript-eslint/no-floating-promises': 'error',
      // '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  // Configurações específicas para arquivos de teste
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__mocks__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest, // Globais do Jest (describe, it, expect, etc.)
      },
    },
    plugins: {
      // 'jest': eslintPluginJest, // Se quiser usar eslint-plugin-jest
    },
    rules: {
      // ...eslintPluginJest.configs.recommended.rules, // Se usar eslint-plugin-jest
      // Permite `any` mais livremente em testes, se necessário
      // '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Ignorar arquivos (equivalente a .eslintignore)
  {
    ignores: [
      'node_modules/',
      '.expo/',
      '.husky/',
      'dist/',
      'build/',
      'coverage/',
      'android/', // Ignora pastas nativas
      'ios/',     // Ignora pastas nativas
      'web-build/',
      'babel.config.js', // Geralmente não precisa de linting complexo
      'metro.config.js',
      // Adicione outros padrões a serem ignorados
      // '*.generated.ts', // Exemplo para arquivos gerados
    ],
  }
);
