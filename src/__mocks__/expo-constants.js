module.exports = {
  manifest: {},
  appOwnership: 'expo',
  platform: { ios: {}, android: {}, web: {} },
  deviceName: 'mocked-device',
  getWebViewUserAgentAsync: jest.fn(),
  getAppOwnership: jest.fn(() => 'expo'),
  getPlatform: jest.fn(() => ({ ios: {}, android: {}, web: {} })),
};
