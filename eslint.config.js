import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:jest/recommended',
  ),
  {
    languageOptions: {
      globals: {
        'react-native/react-native': 'readonly',
        'jest/globals': 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
    files: ['src/__mocks__/**/*.js'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 'react-native/no-raw-text': 'off', // Kept for __mocks__ if needed, or remove if truly global
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'], // Apply to all relevant files in src
    rules: {
      'react-native/no-raw-text': 'off', // Turn off for all src files
    }
  },
  {
    files: ['src/__mocks__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
