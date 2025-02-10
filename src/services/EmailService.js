import * as MailComposer from 'expo-mail-composer';

/**
 * Envia um e-mail utilizando o Expo MailComposer.
 *
 * @param {string} recipient - Endereço de e-mail do destinatário.
 * @param {string} subject - Assunto do e-mail.
 * @param {string} body - Corpo do e-mail.
 * @returns {Promise<void>} Resolvido se o e-mail for enviado com sucesso.
 * @throws {Error} Se o MailComposer não estiver disponível ou ocorrer falha no envio.
 */
export const sendEmail = async (recipient, subject, body) => {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('MailComposer is not available on this device.');
    }

    const options = {
      recipients: [recipient],
      subject,
      body,
    };

    await MailComposer.composeAsync(options);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
