import * as MailComposer from 'expo-mail-composer';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EmailSyncService {
  static async syncEventsWithEmail(events) {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('MailComposer não está disponível neste dispositivo.');
      }

      const emailContent = this.formatEventsForEmail(events);
      const lastSyncDate = new Date().toISOString();

      await AsyncStorage.setItem('lastEmailSync', lastSyncDate);

      return await MailComposer.composeAsync({
        subject: 'Sincronização de Compromissos - JusAgenda',
        body: emailContent,
        isHtml: true
      });
    } catch (error) {
      console.error('Erro na sincronização por e-mail:', error);
      throw new Error(`Falha na sincronização por e-mail: ${error.message}`);
    }
  }

  static formatEventsForEmail(events) {
    const htmlContent = `
      <h2>Seus Compromissos - JusAgenda</h2>
      <p>Atualizado em: ${new Date().toLocaleString()}</p>
      <hr>
      ${events.map(event => `
        <div style="margin-bottom: 20px;">
          <h3>${event.title}</h3>
          <p><strong>Data:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Tipo:</strong> ${event.type}</p>
          <p><strong>Cliente:</strong> ${event.client}</p>
          ${event.description ? `<p><strong>Descrição:</strong> ${event.description}</p>` : ''}
        </div>
      `).join('')}
    `;

    return htmlContent;
  }

  static async getLastSyncDate() {
    try {
      const lastSync = await AsyncStorage.getItem('lastEmailSync');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Erro ao obter última data de sincronização:', error);
      return null;
    }
  }
}

export default EmailSyncService;