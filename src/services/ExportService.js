import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

// Função para exportar compromissos para PDF usando HTML
export const exportToPDF = async (events) => {
    try {
        let html = '<h1>Compromissos</h1>';
        events.forEach(event => {
            html += `<h2>Título: ${event.title}</h2>`;
            html += `<p>Data: ${moment(event.date).format('DD/MM/YYYY HH:mm')}</p>`;
            html += `<p>Local: ${event.location}</p>`;
            html += `<p>Cliente: ${event.client}</p>`;
            html += `<p>Tipo: ${event.type}</p>`;
            html += `<p>Descrição: ${event.description}</p>`;
            html += '<hr>'; // Separador entre compromissos
        });

        const options = {
            html,
            fileName: 'compromissos',
            directory: 'Documents',
        };

        const filePath = await RNHTMLtoPDF.convert(options);
        if (!filePath) throw new Error("Falha ao gerar o PDF.");
        return filePath.filePath;
    } catch (error) {
        console.error("Erro ao exportar para PDF:", error.message);
        throw new Error("Não foi possível exportar o PDF. Tente novamente.");
    }
};

// Função para exportar compromissos para Excel
export const exportToExcel = async (events) => {
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

    events.forEach(event => {
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

// Função para exportar compromissos para Word
export const exportToWord = async (events) => {
    try {
        const doc = new Document();
        
        if (events.length === 0) {
            throw new Error("Nenhum evento para exportar.");
        }

        events.forEach(event => {
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
        await FileSystem.writeAsStringAsync(filePath, buffer); // Usando buffer diretamente
        return filePath;
    } catch (error) {
        console.error("Erro ao exportar para Word:", error.message);
        throw new Error("Não foi possível exportar o Word. Tente novamente.");
    }
};

// Função para compartilhar o arquivo
export const shareFile = async (filePath) => {
    await Sharing.shareAsync(filePath);
};