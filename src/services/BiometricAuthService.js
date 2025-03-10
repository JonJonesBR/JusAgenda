import * as LocalAuthentication from 'expo-local-authentication';
import SecureStorageService from './SecureStorageService';

/**
 * Service for handling biometric authentication
 * Uses expo-local-authentication for fingerprint/face recognition
 */
class BiometricAuthService {
  // Storage key for biometric auth preference
  static BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
  
  /**
   * Check if biometric authentication is available on this device
   * @returns {Promise<boolean>} - Whether biometric auth is available
   */
  static async isBiometricAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the types of biometric authentication available
   * @returns {Promise<string[]>} - Array of available biometric types
   */
  static async getBiometricTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const typeNames = types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'face';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'iris';
          default:
            return 'unknown';
        }
      });
      return typeNames;
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate user with biometrics
   * @param {string} promptMessage - Message to display to the user
   * @returns {Promise<boolean>} - Whether authentication was successful
   */
  static async authenticate(promptMessage = 'Autentique para continuar') {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return false;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use sua senha',
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar'
      });
      
      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }

  /**
   * Enable or disable biometric authentication
   * @param {boolean} enabled - Whether to enable biometric auth
   * @returns {Promise<boolean>} - Success status
   */
  static async setBiometricEnabled(enabled) {
    return await SecureStorageService.saveSecure(this.BIOMETRIC_ENABLED_KEY, enabled);
  }

  /**
   * Check if biometric authentication is enabled by user preference
   * @returns {Promise<boolean>} - Whether biometric auth is enabled
   */
  static async isBiometricEnabled() {
    const enabled = await SecureStorageService.getSecure(this.BIOMETRIC_ENABLED_KEY);
    return enabled === true;
  }
}

export default BiometricAuthService;