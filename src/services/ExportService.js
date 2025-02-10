import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

/**
 * Exporta os compromissos para um arquivo e inicia o compartilhamento.
 *
 * @param {Array} events - Lista de compromissos a exportar.
 * @param {string} format - Formato de exportação ('pdf', 'excel', 'word' ou 'csv').
 * @returns {Promise<void>}
 * @throws {Error} Se a exportação falhar.
 */
export const exportEvents = async (events, format) => {
  try {
    let filePath;
    let fileType;

    switch (format) {
      case 'pdf':
        filePath = await generatePDFFile(events);
        fileType = 'application/pdf';
        break;
      case 'excel':
        filePath = await generateExcelFile(events);
        fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'word':
        filePath = await generateWordFile(events);
        fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'csv':
        filePath = await generateCSVFile(events);
        fileType = 'text/csv';
        break;
      default:
        throw new Error('Unsupported format');
    }

    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available');
    }

    await Sharing.shareAsync(filePath, {
      mimeType: fileType,
      dialogTitle: 'Export Events',
      UTI: fileType,
    });
  } catch (error) {
    console.error('Error exporting events:', error);
    throw new Error('Failed to export events');
  }
};

const generatePDFFile = async (events) => {
  let html = '<h1>Compromissos</h1>';
  events.forEach((event) => {
    html += `<h2>Título: ${event.title}</h2>`;
    html += `<p>Data: ${moment(event.date).format('DD/MM/YYYY HH:mm')}</p>`;
    html += `<p>Local: ${event.location}</p>`;
    html += `<p>Cliente: ${event.client}</p>`;
    html += `<p>Tipo: ${event.type}</p>`;
    html += `<p>Descrição: ${event.description}</p>`;
    html += '<hr>';
  });

  const options = {
    html,
    fileName: 'compromissos',
    directory: 'Documents',
  };

  const result = await RNHTMLtoPDF.convert(options);
  if (!result || !result.filePath) {
    throw new Error("Falha ao gerar o PDF.");
  }
  return result.filePath;
};

const generateExcelFile = async (events) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Compromissos');

  worksheet.columns = [
    { header: 'Título', key: 'title' },
    { header: 'Data', key: 'date' },
    { header: 'Local', key: 'location' },
    { header: 'Cliente', key: 'client' },
    { header: 'Tipo', key: 'type' },
    { header: 'Descrição', key: 'description' },
  ];

  events.forEach((event) => {
    worksheet.addRow({
      title: event.title,
      date: moment(event.date).format('DD/MM/YYYY HH:mm'),
      location: event.location,
      client: event.client,
      type: event.type,
      description: event.description,
    });
  });

  const filePath = `${FileSystem.documentDirectory}compromissos.xlsx`;
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

const generateWordFile = async (events) => {
  const doc = new Document({
    creator: "JusAgenda",
    title: "Compromissos",
    description: "Exportação dos compromissos para Word",
  });

  if (events.length === 0) {
    throw new Error("Nenhum evento para exportar.");
  }

  events.forEach((event) => {
    doc.addSection({
      children: [
        new Paragraph({
          text: `Título: ${event.title || 'Sem título'}`,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(`Data: ${moment(event.date).format('DD/MM/YYYY HH:mm')}`),
        new Paragraph(`Local: ${event.location || 'Sem local definido'}`),
        new Paragraph(`Cliente: ${event.client || 'Sem cliente definido'}`),
        new Paragraph(`Tipo: ${event.type || 'Sem tipo definido'}`),
        new Paragraph(`Descrição: ${event.description || 'Sem descrição'}`),
      ],
    });
  });

  const packer = new Packer();
  const buffer = await packer.toBuffer(doc);
  const filePath = `${FileSystem.documentDirectory}compromissos.docx`;
  const base64Data = Buffer.from(buffer).toString('base64');
  await FileSystem.writeAsStringAsync(filePath, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return filePath;
};

const generateCSVFile = async (events) => {
  const headers = ['Título', 'Data', 'Local', 'Cliente', 'Tipo', 'Descrição'];
  const rows = events.map((event) => [
    event.title,
    new Date(event.date).toLocaleString(),
    event.location,
    event.client,
    event.type,
    event.description,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const filePath = `${FileSystem.documentDirectory}compromissos.csv`;
  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return filePath;
};
