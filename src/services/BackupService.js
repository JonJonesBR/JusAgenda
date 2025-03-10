import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { storage } from './storage';
import Toast from 'react-native-toast-message';
import SecureStorageService from './SecureStorageService';
import * as Crypto from 'expo-crypto';

/**
 * Service for handling backup and restore functionality
 * Allows users to export and import their data with encryption
 */
class BackupService {
  // Encryption key for backup files
  static BACKUP_ENCRYPTION_KEY = 'backup_encryption_key';
  
  /**
   * Generate a hash from password for encryption
   * @param {string} password - User password
   * @returns {Promise<string>} - Hashed password
   */
  static async generateKeyFromPassword(password) {
    try {
      // Generate a SHA-256 hash of the password
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      return digest;
    } catch (error) {
      console.error('Error generating key from password:', error);
      throw error;
    }
  }
  
  /**
   * Encrypt data with a password
   * @param {object} data - Data to encrypt
   * @param {string} password - Password for encryption
   * @returns {Promise<string>} - Encrypted data
   */
  static async encryptData(data, password) {
    try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(data);
      
      // Generate encryption key from password
      const key = await this.generateKeyFromPassword(password);
      
      // For simplicity, we're using a basic XOR encryption
      // In a production app, use a more robust encryption library
      let encrypted = '';
      for (let i = 0; i < jsonData.length; i++) {
        const charCode = jsonData.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }
      
      // Convert to base64 for safe storage
      return btoa(encrypted);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }
  
  /**
   * Decrypt data with a password
   * @param {string} encryptedData - Encrypted data
   * @param {string} password - Password for decryption
   * @returns {Promise<object>} - Decrypted data
   */
  static async decryptData(encryptedData, password) {
    try {
      // Generate decryption key from password
      const key = await this.generateKeyFromPassword(password);
      
      // Convert from base64
      const encrypted = atob(encryptedData);
      
      // Decrypt using XOR
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      // Parse JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Falha na descriptografia. Senha incorreta ou arquivo corrompido.');
    }
  }
  
  /**
   * Creates a backup of all user data with encryption
   * @param {string} password - Password for encryption
   * @returns {Promise<boolean>} Success status
   */
  static async createBackup(password) {
    try {
      // Get all data from AsyncStorage
      const events = await storage.getItem('events') || [];
      const settings = await storage.getItem('settings') || {};
      const lastEmailSync = await storage.getItem('lastEmailSync') || null;
      
      // Create backup object with metadata
      const backupData = {
        version: '1.1', // Updated version for encrypted backups
        timestamp: new Date().toISOString(),
        data: {
          events,
          settings,
          lastEmailSync
        }
      };
      
      // Encrypt the backup data if password is provided
      let backupString;
      let isEncrypted = false;
      
      if (password && password.length >= 6) {
        backupString = await this.encryptData(backupData, password);
        isEncrypted = true;
      } else if (password) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      } else {
        // Fallback to unencrypted backup if no password
        backupString = JSON.stringify(backupData, null, 2);
      }
      
      // Add encryption metadata
      const finalBackup = {
        encrypted: isEncrypted,
        data: backupString,
        checksum: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          backupString
        )
      };
      
      // Create a file name with timestamp and encryption indicator
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const securityIndicator = isEncrypted ? 'secure' : 'standard';
      const fileName = `jusagenda_backup_${securityIndicator}_${timestamp}.json`;
      
      // Create temporary file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(finalBackup));
      
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Compartilhamento não disponível neste dispositivo');
      }
      
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: 'Exportar backup de dados'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar backup',
        text2: error.message
      });
      return false;
    }
  }
  
  /**
   * Restores data from a backup file
   * @param {string} password - Password for decryption (if backup is encrypted)
   * @returns {Promise<boolean>} Success status
   */
  static async restoreBackup(password = null) {
    try {
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      // Check if user canceled
      if (result.canceled) {
        return false;
      }
      
      // Read file content
      const fileUri = result.assets[0].uri;
      
      // Validate that we have a valid URI before trying to read it
      if (!fileUri) {
        throw new Error('Arquivo inválido ou corrompido');
      }
      
      let fileContent;
      try {
        fileContent = await FileSystem.readAsStringAsync(fileUri);
        
        // Validate that we have content
        if (!fileContent || fileContent.trim() === '') {
          throw new Error('O arquivo está vazio ou corrompido');
        }
      } catch (readError) {
        console.error('Erro ao ler arquivo de backup:', readError);
        throw new Error('Não foi possível ler o arquivo de backup. O arquivo pode estar corrompido.');
      }
      
      // Parse backup file content
      let backupFile;
      try {
        backupFile = JSON.parse(fileContent);
        
        // Validate that we have a valid backup file structure
        if (!backupFile || typeof backupFile !== 'object') {
          throw new Error('Formato de backup inválido');
        }
      } catch (parseError) {
        console.error('Erro ao analisar arquivo de backup:', parseError);
        throw new Error('O arquivo não contém um backup válido. Formato JSON inválido.');
      }
      
      // Check if this is an encrypted backup
      let backupData;
      
      if (backupFile.encrypted === true) {
        // Encrypted backup requires password
        if (!password) {
          throw new Error('Este backup está criptografado. Por favor, forneça a senha.');
        }
        
        // Verify checksum for file integrity
        const calculatedChecksum = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          backupFile.data
        );
        
        if (calculatedChecksum !== backupFile.checksum) {
          throw new Error('O arquivo de backup foi corrompido ou adulterado.');
        }
        
        // Decrypt the data
        backupData = await this.decryptData(backupFile.data, password);
      } else if (backupFile.encrypted === false) {
        // Standard backup with new format
        backupData = JSON.parse(backupFile.data);
      } else {
        // Legacy backup format (pre-encryption)
        backupData = backupFile;
      }
      
      // Validate backup format
      if (!backupData.version || !backupData.data) {
        throw new Error('Formato de backup inválido');
      }
      
      // Restore data
      if (backupData.data.events) {
        await storage.setItem('events', backupData.data.events);
      }
      
      if (backupData.data.settings) {
        await storage.setItem('settings', backupData.data.settings);
      }
      
      if (backupData.data.lastEmailSync) {
        await storage.setItem('lastEmailSync', backupData.data.lastEmailSync);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Backup restaurado com sucesso',
        text2: 'Seus dados foram restaurados'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao restaurar backup',
        text2: error.message
      });
      return false;
    }
  }
}

export default BackupService;