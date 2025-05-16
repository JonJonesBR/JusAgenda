// metro.config.cjs
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Você pode adicionar customizações aqui, se necessário, por exemplo:
// config.resolver.assetExts.push('db');

module.exports = config;