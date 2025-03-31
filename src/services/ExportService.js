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
   * Gera o HTML para PDF ou doc com melhorias visuais.
   */
  static generateHTML(events, type) {
    const appName = 'JusAgenda';
    const reportTitle = 'Relatório de Compromissos';
    const generationDate = moment().format('DD/MM/YYYY HH:mm');

    // Estilos CSS aprimorados
    const styles = `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 30px;
        color: #333;
        line-height: 1.6;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 2px solid #6200ee; /* Cor primária do app */
        padding-bottom: 15px;
      }
      .app-name {
        font-size: 28px;
        font-weight: bold;
        color: #6200ee; /* Cor primária do app */
        margin-bottom: 5px;
      }
      .report-title {
        font-size: 22px;
        color: #555;
        margin-bottom: 10px;
      }
      .generation-date {
        font-size: 12px;
        color: #777;
      }
      .event {
        border: 1px solid #ddd;
        background-color: #f9f9f9;
        margin-bottom: 20px;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .event-title {
        font-size: 20px;
        font-weight: bold;
        color: #6200ee; /* Cor primária */
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .event-info {
        font-size: 14px;
        color: #555;
        margin-bottom: 8px;
      }
      .event-info strong {
        color: #333;
        min-width: 80px; /* Alinhamento dos labels */
        display: inline-block;
      }
      .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #aaa;
          border-top: 1px solid #eee;
          padding-top: 15px;
      }
    `;

    // Mapeia eventos para HTML
    const eventsHTML = events.map(event => `
      <div class="event">
        <div class="event-title">${event.title || 'Compromisso sem título'}</div>
        <div class="event-info"><strong>Data:</strong> ${moment(event.date).format('DD/MM/YYYY')}</div>
        <div class="event-info"><strong>Horário:</strong> ${moment(event.date).format('HH:mm')}</div>
        ${event.type ? `<div class="event-info"><strong>Tipo:</strong> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>` : ''}
        ${event.description ? `<div class="event-info"><strong>Descrição:</strong> ${event.description}</div>` : ''}
        ${event.location ? `<div class="event-info"><strong>Local:</strong> ${event.location}</div>` : ''}
        ${event.numeroProcesso ? `<div class="event-info"><strong>Processo:</strong> ${event.numeroProcesso}</div>` : ''}
        ${event.cliente ? `<div class="event-info"><strong>Cliente:</strong> ${event.cliente}</div>` : ''}
        {/* Adicione outros campos relevantes aqui se necessário */}
      </div>
    `).join('');

    // Monta o HTML final
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${reportTitle} - ${appName}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="header">
            <div class="app-name">${appName}</div>
            <div class="report-title">${reportTitle}</div>
            <div class="generation-date">Gerado em: ${generationDate}</div>
          </div>

          ${eventsHTML || '<div class="event-info">Nenhum compromisso para exportar.</div>'}

          <div class="footer">
            Relatório gerado por ${appName}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Converte eventos para CSV com mais campos e formatação consistente.
   */
  static convertToCSV(events) {
    // Adiciona mais cabeçalhos relevantes
    const headers = [
      'Título', 'Data', 'Hora', 'Tipo', 'Descrição', 
      'Local', 'Processo', 'Cliente' 
      // Adicione outros cabeçalhos se necessário
    ];

    // Função auxiliar para escapar vírgulas e aspas em strings CSV
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '';
      const string = String(str);
      // Se a string contém vírgula, aspas ou nova linha, coloca entre aspas duplas
      if (string.includes(',') || string.includes('"') || string.includes('\n')) {
        // Escapa aspas duplas existentes duplicando-as
        return `"${string.replace(/"/g, '""')}"`;
      }
      return string;
    };

    const rows = events.map(event => [
      escapeCSV(event.title),
      moment(event.date).format('DD/MM/YYYY'), // Formato consistente
      moment(event.date).format('HH:mm'),      // Formato consistente
      escapeCSV(event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : ''),
      escapeCSV(event.description),
      escapeCSV(event.location),
      escapeCSV(event.numeroProcesso),
      escapeCSV(event.cliente)
      // Adicione outros campos aqui, lembrando de usar escapeCSV
    ]);

    // Junta cabeçalhos e linhas
    return [
      headers.join(','), // Junta cabeçalhos com vírgula
      ...rows.map(row => row.join(',')) // Junta cada linha com vírgula
    ].join('\n'); // Junta todas as linhas com nova linha
  }
}

export default ExportService;
