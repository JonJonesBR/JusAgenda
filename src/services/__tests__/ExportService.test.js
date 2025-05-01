jest.mock('expo-file-system', () => ({
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  documentDirectory: '/mock/documents/',
  EncodingType: { UTF8: 'utf8' }
}));
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(),
}));

import ExportService from '../ExportService';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

describe('ExportService.exportToWord', () => {
  it('should generate and share a .doc file with HTML content', async () => {
    // Mock dependencies
    const events = [
      {
        id: '1',
        title: 'Audiência',
        date: new Date('2025-04-16T10:00:00'),
        type: 'audiencia',
        description: 'Audiência trabalhista',
        location: 'Fórum Central',
        numeroProcesso: '12345',
        cliente: 'Maria Silva',
      },
    ];
    const result = await ExportService.exportToWord(events);
    expect(result.success).toBe(true);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('<title>Relatório de Compromissos - JusAgenda</title>'),
      { encoding: FileSystem.EncodingType.UTF8 }
    );
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        dialogTitle: expect.any(String),
        mimeType: expect.any(String)
      })
    );
    expect(result.success).toBe(true);
  });
});
