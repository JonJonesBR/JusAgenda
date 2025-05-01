import { scheduleCustomAlert, getAlertSettings } from '../../services/alertCustomization';
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({
    minutesBefore: 15,
    notificationType: 'push',
    repeat: true,
    repeatInterval: 'day'
  }))),
  removeItem: jest.fn(() => Promise.resolve()),
}));
import { Event } from '../types/event';

describe('Alert Customization', () => {
  it('should save and retrieve alert settings', async () => {
    const event: Event = {
      id: 'evt1',
      title: 'Reunião',
      cliente: 'João',
      tipo: 'reuniao',
      data: new Date(),
      prioridade: 'media',
    };
    const settings = { minutesBefore: 15, repeat: true, repeatInterval: 'day', notificationType: 'push' };
    await scheduleCustomAlert(event, settings, 'user@email.com');
    const saved = await getAlertSettings(event.id);
    expect(saved).toMatchObject(settings);
  });
});
