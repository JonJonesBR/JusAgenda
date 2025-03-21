import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import moment from 'moment';

// Se quiser gerar docx real, descomente e instale a biblioteca docx (exige configurações extras no Expo):
// import { Document, Packer, Paragraph, TextRun } from 'docx';

class ExportService {
  /**
   * Exporta a lista de eventos para um arquivo CSV.
   */
  static async exportToExcel(events) {
    try {
      const csvContent = this.convertToCSV(events);
      const fileName = `events_${Date.now()}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);
      await Sharing.shareAsync(filePath);

      return { success: true, filePath };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exporta a lista de eventos para PDF.
   * Usa expo-print (gera PDF) e depois move para um caminho local antes de compartilhar.
   */
  static async exportToPDF(events) {
    try {
      const html = this.generateHTML(events, 'pdf');
      const { uri } = await Print.printToFileAsync({ html });
      const pdfName = `events_${moment().format('YYYY-MM-DD_HH-mm')}.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({ from: uri, to: pdfPath });
      await Sharing.shareAsync(pdfPath);

      return { success: true, filePath: pdfPath };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Abordagem 1 (Padrão): Exporta para Word gerando um arquivo .doc com HTML.
   * O Word consegue abrir e converter o arquivo internamente.
   * Não gera um docx "nativo", mas funciona na maioria dos cenários.
   */
  static async exportToWord(events) {
    try {
      const html = this.generateHTML(events, 'doc');
      const docName = `events_${moment().format('YYYY-MM-DD_HH-mm')}.doc`;
      const docPath = `${FileSystem.documentDirectory}${docName}`;

      // Escreve o conteúdo HTML diretamente no arquivo .doc
      await FileSystem.writeAsStringAsync(docPath, html, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Compartilha como 'application/msword' (Word antigo)
      await Sharing.shareAsync(docPath, {
        mimeType: 'application/msword',
        dialogTitle: 'Exportar para Word'
      });
      return { success: true, filePath: docPath };
    } catch (error) {
      console.error('Error exporting to Word:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Abordagem 2 (Opcional): Gerar docx real (OOXML) - Exige biblioteca docx
   * e não utiliza expo-print. Comentei pois precisa de setup extra.
   *
   * Para habilitar:
   *  1) Descomente os imports e este método
   *  2) Instale a biblioteca docx (npm install docx)
   *  3) Verifique compatibilidade no Expo (pode exigir configurações adicionais)
   */
  /*
  static async exportToDocx(events) {
    try {
      // Exemplo simples usando a lib docx
      const doc = new Document({
        sections: [
          {
            children: events.map((event) =>
              new Paragraph({
                children: [
                  new TextRun(`Título: ${event.title}\n`),
                  new TextRun(`Data: ${moment(event.date).format('DD/MM/YYYY HH:mm')}\n`),
                  new TextRun(`Descrição: ${event.description || ''}\n`),
                  new TextRun(`Local: ${event.location || ''}\n`)
                ]
              })
            )
          }
        ]
      });

      const buffer = await Packer.toBuffer(doc);

      const docxName = `events_${moment().format('YYYY-MM-DD_HH-mm')}.docx`;
      const docxPath = `${FileSystem.documentDirectory}${docxName}`;

      // Converte o buffer para base64 e salva
      await FileSystem.writeAsStringAsync(docxPath, buffer.toString('base64'), {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(docxPath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Exportar para Word (docx)'
      });

      return { success: true, filePath: docxPath };
    } catch (error) {
      console.error('Error exporting to docx real:', error);
      return { success: false, error: error.message };
    }
  }
  */

  /**
   * Gera o HTML para PDF ou doc.
   */
  static generateHTML(events, type) {
    const title = type === 'pdf' ? 'Relatório de Compromissos' : 'Lista de Compromissos';
    const styles = `
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
      .event { border: 1px solid #e0e0e0; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
      .event-title { color: #34495e; font-size: 18px; margin-bottom: 10px; }
      .event-info { color: #7f8c8d; margin: 5px 0; }
    `;

    const eventsHTML = events.map(event => `
      <div class="event">
        <div class="event-title">${event.title}</div>
        <div class="event-info">Data: ${moment(event.date).format('DD/MM/YYYY')}</div>
        <div class="event-info">Horário: ${moment(event.date).format('HH:mm')}</div>
        ${event.description ? `<div class="event-info">Descrição: ${event.description}</div>` : ''}
        ${event.location ? `<div class="event-info">Local: ${event.location}</div>` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${styles}</style>
        </head>
        <body>
          <h1>${title}</h1>
          ${eventsHTML}
        </body>
      </html>
    `;
  }

  /**
   * Converte eventos para CSV.
   */
  static convertToCSV(events) {
    const headers = ['Title', 'Date', 'Time', 'Description', 'Location'];
    const rows = events.map(event => [
      event.title,
      new Date(event.date).toLocaleDateString(),
      new Date(event.date).toLocaleTimeString(),
      event.description || '',
      event.location || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
}

export default ExportService;
