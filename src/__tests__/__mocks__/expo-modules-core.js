// Mock for expo-modules-core
export const requireOptionalNativeModule = jest.fn(() => null);
export const requireNativeModule = jest.fn(() => null);
export const EventEmitter = jest.fn().mockImplementation(() => ({
  addListener: jest.fn(),
  removeListeners: jest.fn(),
}));

describe('expo-modules-core mock', () => {
  it('should provide mock functions', () => {
    expect(requireOptionalNativeModule).toBeDefined();
    expect(requireNativeModule).toBeDefined();
    expect(EventEmitter).toBeDefined();
  });

  it('should create EventEmitter with expected methods', () => {
    const emitter = new EventEmitter();
    expect(emitter.addListener).toBeDefined();
    expect(emitter.removeListeners).toBeDefined();
  });
});