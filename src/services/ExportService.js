import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { formatDateTime } from '../utils/dateUtils';

export default class ExportService {
  static async exportToExcel(data) {
    try {
      // Converte dados para CSV (formato simplificado)
      const header = Object.keys(data[0]).join(',') + '\n';
      const rows = data
        .map(obj =>
          Object.values(obj)
            .map(value => (typeof value === 'string' ? `"${value}"` : value))
            .join(',')
        )
        .join('\n');
      const csvContent = header + rows;

      // Cria arquivo temporário
      const fileUri = `${FileSystem.documentDirectory}export.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Verifica se o compartilhamento está disponível
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Compartilhamento não disponível');
      }

      // Compartilha o arquivo
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Exportar dados'
      });
    } catch (error) {
      console.error('Erro na exportação Excel:', error);
      throw error;
    }
  }

  static async exportToPDF(data, filename = 'export.pdf') {
    try {
      // Cria um conteúdo HTML com os dados dos eventos
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Exportação de Eventos</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Exportação de Eventos</h1>
            <table>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Local</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Descrição</th>
              </tr>
              ${data
                .map(
                  event => `
              <tr>
                <td>${event.title}</td>
                <td>${formatDateTime(event.date)}</td>
                <td>${event.location}</td>
                <td>${event.client}</td>
                <td>${event.type}</td>
                <td>${event.description}</td>
              </tr>`
                )
                .join('')}
            </table>
          </body>
        </html>
      `;

      // Gera o arquivo PDF utilizando o expo-print
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

      // Compartilha o arquivo PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar PDF'
      });
    } catch (error) {
      console.error('Erro na exportação para PDF:', error);
      throw error;
    }
  }

  static async exportToWord(data, filename = 'export.doc') {
    try {
      // Cria um conteúdo HTML compatível com o Word
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <title>Exportação de Eventos</title>
          </head>
          <body>
            <h1>Exportação de Eventos</h1>
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Local</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Descrição</th>
              </tr>
              ${data
                .map(
                  event => `
              <tr>
                <td>${event.title}</td>
                <td>${formatDateTime(event.date)}</td>
                <td>${event.location}</td>
                <td>${event.client}</td>
                <td>${event.type}</td>
                <td>${event.description}</td>
              </tr>`
                )
                .join('')}
            </table>
          </body>
        </html>
      `;

      // Define o caminho do arquivo Word
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });

      // Compartilha o arquivo Word
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/msword',
        dialogTitle: 'Exportar Word'
      });
    } catch (error) {
      console.error('Erro na exportação para Word:', error);
      throw error;
    }
  }
}
