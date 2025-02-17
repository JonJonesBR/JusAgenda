import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { formatDateTime, formatFullDate } from '../utils/dateUtils';
import { COLORS } from '../utils/common';

export default class ExportService {
  static async exportToExcel(data) {
    try {
      // Cabeçalho com informações gerais
      const headerInfo = [
        `Total de Compromissos: ${data.length}`,
        `Gerado em ${formatFullDate(new Date())}\n`
      ].join('\n');

      // Cabeçalho das colunas
      const columns = [
        'Tribunal',
        'Número do Processo',
        'Data',
        'Marcadores',
        'Responsável',
        'Compromisso'
      ].join(',');

      // Formata os dados dos compromissos
      const rows = data.map(event => {
        const processInfo = event.title.split(' ');
        const tribunal = processInfo[0] || '';
        const processo = processInfo.slice(1).join(' ') || '';
        
        return [
          `"${tribunal}"`,
          `"${processo}"`,
          `"${formatDateTime(event.date)}"`,
          `"${event.type.toUpperCase()}"`,
          `"${event.client}"`,
          `"${event.description || ''}"`,
        ].join(',');
      }).join('\n');

      const csvContent = headerInfo + columns + '\n' + rows;

      // Cria arquivo temporário
      const fileUri = `${FileSystem.documentDirectory}export.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Verifica se o compartilhamento está disponível
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Compartilhamento não disponível');
      }

      // Compartilha o arquivo
      try {
        const result = await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          UTI: 'public.comma-separated-values-text',
          dialogTitle: 'Exportar dados'
        });
        
        // Se o resultado for null ou undefined, retorna false
        if (!result) return false;
        
        return result.action === Sharing.SharedAction;
      } catch (shareError) {
        console.log('Compartilhamento cancelado');
        return false;
      }
    } catch (error) {
      console.error('Erro na exportação Excel:', error);
      throw error;
    }
  }

  static async exportToPDF(data) {
    console.log('Iniciando exportação PDF...');
    try {
      // Log do estado do compartilhamento
      const sharingAvailable = await Sharing.isAvailableAsync();
      console.log('Compartilhamento disponível:', sharingAvailable);

      if (!sharingAvailable) {
        throw new Error('Compartilhamento não disponível');
      }

      console.log('Gerando HTML...');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Agenda de Compromissos</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
                color: ${COLORS.text.primary};
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                color: ${COLORS.text.secondary};
                font-size: 12px;
              }
              h1 {
                text-align: center;
                color: ${COLORS.primary};
                margin-bottom: 30px;
              }
              .compromisso {
                margin-bottom: 30px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
              }
              .processo-header {
                background-color: ${COLORS.primary};
                color: white;
                padding: 10px;
                font-weight: bold;
              }
              .processo-info {
                padding: 15px;
              }
              .info-row {
                display: flex;
                margin-bottom: 8px;
              }
              .info-label {
                color: ${COLORS.text.secondary};
                width: 120px;
                font-weight: bold;
              }
              .info-value {
                flex: 1;
              }
              .marcadores {
                display: flex;
                gap: 10px;
                margin-top: 10px;
              }
              .tag {
                background-color: ${COLORS.secondary}22;
                color: ${COLORS.secondary};
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>Total de Compromissos: ${data.length}</div>
              <div>Gerado em ${formatFullDate(new Date())}</div>
            </div>
            
            <h1>Agenda de Compromissos</h1>

            ${data.map(event => {
              const processInfo = event.title.split(' ');
              const tribunal = processInfo[0];
              const processo = processInfo.slice(1).join(' ');
              
              return `
                <div class="compromisso">
                  <div class="processo-header">
                    ${tribunal} ${processo}
                  </div>
                  <div class="processo-info">
                    <div class="info-row">
                      <div class="info-label">Data:</div>
                      <div class="info-value">${formatDateTime(event.date)}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Marcadores:</div>
                      <div class="info-value">${event.type.toUpperCase()}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Responsável:</div>
                      <div class="info-value">${event.client}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Compromisso:</div>
                      <div class="info-value">${event.description || ''}</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </body>
        </html>
      `;

      console.log('Gerando PDF...');
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      console.log('PDF gerado em:', uri);

      try {
        console.log('Iniciando compartilhamento...');
        const result = await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar PDF'
        });
        
        console.log('Resultado do compartilhamento:', result);
        return result?.action === Sharing.SharedAction;
      } catch (shareError) {
        console.log('Erro no compartilhamento:', shareError);
        return false;
      }
    } catch (error) {
      console.error('Erro na exportação para PDF:', error);
      throw error;
    }
  }

  static async exportToWord(data) {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html xmlns:w="urn:schemas-microsoft-com:office:word">
          <head>
            <meta charset="utf-8">
            <title>Agenda de Compromissos</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th {
                background-color: ${COLORS.primary};
                color: white;
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
              }
              td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              .header-info {
                color: ${COLORS.text.secondary};
                margin-bottom: 20px;
                font-size: 12px;
              }
              h1 {
                color: ${COLORS.primary};
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header-info">
              <p>Total de Compromissos: ${data.length}</p>
              <p>Gerado em ${formatFullDate(new Date())}</p>
            </div>

            <h1>Agenda de Compromissos</h1>

            <table>
              <tr>
                <th>Tribunal</th>
                <th>Número do Processo</th>
                <th>Data</th>
                <th>Marcadores</th>
                <th>Responsável</th>
                <th>Compromisso</th>
              </tr>
              ${data.map(event => {
                const processInfo = event.title.split(' ');
                const tribunal = processInfo[0];
                const processo = processInfo.slice(1).join(' ');
                
                return `
                  <tr>
                    <td>${tribunal}</td>
                    <td>${processo}</td>
                    <td>${formatDateTime(event.date)}</td>
                    <td>${event.type.toUpperCase()}</td>
                    <td>${event.client}</td>
                    <td>${event.description || ''}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </body>
        </html>
      `;

      // Define o caminho do arquivo Word
      const fileUri = `${FileSystem.documentDirectory}export.doc`;
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });

      // Verifica se o compartilhamento está disponível
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Compartilhamento não disponível');
      }

      // Compartilha o arquivo Word
      try {
        const result = await Sharing.shareAsync(fileUri, {
          mimeType: 'application/msword',
          dialogTitle: 'Exportar Word'
        });
        
        // Se o resultado for null ou undefined, retorna false
        if (!result) return false;
        
        return result.action === Sharing.SharedAction;
      } catch (shareError) {
        console.log('Compartilhamento cancelado');
        return false;
      }
    } catch (error) {
      console.error('Erro na exportação para Word:', error);
      throw error;
    }
  }
}
