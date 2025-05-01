module.exports = {
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({}),
};
