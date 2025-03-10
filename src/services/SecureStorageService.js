import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

/**
 * Service for securely storing sensitive information
 * Uses expo-secure-store which provides encrypted storage
 */
class SecureStorageService {
  /**
   * Save data securely with encryption
   * @param {string} key - The key to store the data under
   * @param {any} value - The value to store (will be JSON stringified)
   * @returns {Promise<boolean>} - Success status
   */
  static async saveSecure(key, value) {
    try {
      if (!key) {
        throw new Error('Key is required for secure storage');
      }
      
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      
      await SecureStore.setItemAsync(key, stringValue, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED
      });
      
      return true;
    } catch (error) {
      console.error(`Error saving secure data for ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve securely stored data
   * @param {string} key - The key to retrieve data for
   * @returns {Promise<any>} - The retrieved data or null if not found
   */
  static async getSecure(key) {
    try {
      if (!key) {
        throw new Error('Key is required for secure storage');
      }
      
      const result = await SecureStore.getItemAsync(key);
      
      if (!result) {
        return null;
      }
      
      try {
        // Attempt to parse as JSON
        return JSON.parse(result);
      } catch {
        // If not valid JSON, return as string
        return result;
      }
    } catch (error) {
      console.error(`Error retrieving secure data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete securely stored data
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async removeSecure(key) {
    try {
      if (!key) {
        throw new Error('Key is required for secure storage');
      }
      
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error deleting secure data for ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if secure storage is available on this device
   * @returns {Promise<boolean>} - Whether secure storage is available
   */
  static async isAvailable() {
    try {
      // Test if we can store and retrieve a value
      const testKey = '_secure_storage_test';
      const testValue = 'test';
      
      await SecureStore.setItemAsync(testKey, testValue);
      const retrieved = await SecureStore.getItemAsync(testKey);
      await SecureStore.deleteItemAsync(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      console.error('Secure storage is not available:', error);
      return false;
    }
  }
}

export default SecureStorageService;