module.exports = {
  presets: [
    'babel-preset-expo',
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', { isTSX: true, allExtensions: true, allowDeclareFields: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
};
