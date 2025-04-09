module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:jest/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'jest'
  ],
  env: {
    'react-native/react-native': true,
    'jest/globals': true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react-native/no-raw-text': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/prop-types': 'off'
  }
};