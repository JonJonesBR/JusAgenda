// Mock for expo-haptics
const Haptics = {
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  }
};

export default Haptics;
export const { NotificationFeedbackType, ImpactFeedbackStyle } = Haptics;
export const selectionAsync = Haptics.selectionAsync;
export const notificationAsync = Haptics.notificationAsync;
export const impactAsync = Haptics.impactAsync;

describe('expo-haptics mock', () => {
  it('should provide mock functions', () => {
    expect(selectionAsync).toBeDefined();
    expect(notificationAsync).toBeDefined();
    expect(impactAsync).toBeDefined();
  });

  it('should provide feedback type constants', () => {
    expect(NotificationFeedbackType.Success).toBe('success');
    expect(NotificationFeedbackType.Warning).toBe('warning');
    expect(NotificationFeedbackType.Error).toBe('error');
  });

  it('should provide impact style constants', () => {
    expect(ImpactFeedbackStyle.Light).toBe('light');
    expect(ImpactFeedbackStyle.Medium).toBe('medium');
    expect(ImpactFeedbackStyle.Heavy).toBe('heavy');
  });
});