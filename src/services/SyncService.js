import { storage } from './storage';
import database from '@react-native-firebase/database';
import Toast from 'react-native-toast-message';

/**
 * Service for handling data synchronization across devices
 * Implements conflict resolution for concurrent edits
 */
class SyncService {
  /**
   * Initialize Firebase connection
   * @param {string} userId - User identifier for syncing
   */
  static initialize(userId) {
    if (!userId) {
      throw new Error('User ID is required for synchronization');
    }
    this.userId = userId;
    this.dbRef = database().ref(`/users/${userId}`);
  }

  /**
   * Synchronize local data with cloud
   * @returns {Promise<boolean>} Success status
   */
  static async syncData() {
    try {
      if (!this.userId || !this.dbRef) {
        throw new Error('Sync service not initialized');
      }

      // Get local data
      const localEvents = await storage.getItem('events') || [];
      const localSettings = await storage.getItem('settings') || {};
      
      // Get remote data
      const snapshot = await this.dbRef.once('value');
      const remoteData = snapshot.val() || {};
      const remoteEvents = remoteData.events || [];
      const remoteSettings = remoteData.settings || {};
      
      // Check for conflicts
      const conflicts = this.detectConflicts(localEvents, remoteEvents);
      
      if (conflicts.length > 0) {
        // Handle conflicts
        await this.handleConflicts(conflicts, localEvents, remoteEvents);
      } else {
        // Merge data (remote data takes precedence for non-conflicting items)
        const mergedEvents = this.mergeData(localEvents, remoteEvents);
        
        // Update local storage
        await storage.setItem('events', mergedEvents);
        
        // Update remote storage
        await this.dbRef.set({
          events: mergedEvents,
          settings: { ...remoteSettings, ...localSettings },
          lastSync: new Date().toISOString()
        });
      }
      
      // Update last sync timestamp
      const settings = await storage.getItem('settings') || {};
      settings.lastSync = new Date().toISOString();
      await storage.setItem('settings', settings);
      
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de sincronização',
        text2: error.message
      });
      return false;
    }
  }

  /**
   * Detect conflicts between local and remote events
   * @param {Array} localEvents - Local events
   * @param {Array} remoteEvents - Remote events
   * @returns {Array} Conflicts
   */
  static detectConflicts(localEvents, remoteEvents) {
    const conflicts = [];
    
    // Map events by ID for easier comparison
    const remoteEventsMap = {};
    remoteEvents.forEach(event => {
      remoteEventsMap[event.id] = event;
    });
    
    // Check each local event against remote
    localEvents.forEach(localEvent => {
      const remoteEvent = remoteEventsMap[localEvent.id];
      
      // If event exists in both places and has different modification timestamps
      if (remoteEvent && 
          localEvent.modifiedAt && 
          remoteEvent.modifiedAt && 
          localEvent.modifiedAt !== remoteEvent.modifiedAt) {
        conflicts.push({
          local: localEvent,
          remote: remoteEvent
        });
      }
    });
    
    return conflicts;
  }

  /**
   * Handle conflicts between local and remote data
   * @param {Array} conflicts - Detected conflicts
   * @param {Array} localEvents - Local events
   * @param {Array} remoteEvents - Remote events
   */
  static async handleConflicts(conflicts, localEvents, remoteEvents) {
    // For now, implement a simple resolution strategy: newest wins
    const resolvedEvents = [...localEvents];
    
    conflicts.forEach(conflict => {
      const localIndex = resolvedEvents.findIndex(e => e.id === conflict.local.id);
      
      // Compare modification timestamps and keep the newest version
      const localDate = new Date(conflict.local.modifiedAt).getTime();
      const remoteDate = new Date(conflict.remote.modifiedAt).getTime();
      
      if (remoteDate > localDate) {
        // Remote is newer, replace local
        if (localIndex >= 0) {
          resolvedEvents[localIndex] = conflict.remote;
        }
      }
      // If local is newer, keep it (no action needed)
    });
    
    // Update local storage with resolved events
    await storage.setItem('events', resolvedEvents);
    
    // Update remote storage
    await this.dbRef.child('events').set(resolvedEvents);
    
    // Notify user about resolved conflicts
    Toast.show({
      type: 'info',
      text1: 'Conflitos resolvidos',
      text2: `${conflicts.length} conflitos foram resolvidos automaticamente`
    });
  }

  /**
   * Merge local and remote data
   * @param {Array} localEvents - Local events
   * @param {Array} remoteEvents - Remote events
   * @returns {Array} Merged events
   */
  static mergeData(localEvents, remoteEvents) {
    // Create maps for faster lookup
    const localMap = {};
    const remoteMap = {};
    
    localEvents.forEach(event => {
      localMap[event.id] = event;
    });
    
    remoteEvents.forEach(event => {
      remoteMap[event.id] = event;
    });
    
    // Combine all event IDs
    const allIds = new Set([
      ...Object.keys(localMap),
      ...Object.keys(remoteMap)
    ]);
    
    // Create merged array
    const mergedEvents = [];
    
    allIds.forEach(id => {
      const localEvent = localMap[id];
      const remoteEvent = remoteMap[id];
      
      if (localEvent && remoteEvent) {
        // Both exist, use the one with the latest modification timestamp
        const localDate = new Date(localEvent.modifiedAt || 0).getTime();
        const remoteDate = new Date(remoteEvent.modifiedAt || 0).getTime();
        
        mergedEvents.push(remoteDate > localDate ? remoteEvent : localEvent);
      } else if (localEvent) {
        // Only exists locally
        mergedEvents.push(localEvent);
      } else if (remoteEvent) {
        // Only exists remotely
        mergedEvents.push(remoteEvent);
      }
    });
    
    return mergedEvents;
  }

  /**
   * Get the last synchronization timestamp
   * @returns {Promise<string|null>} Last sync timestamp
   */
  static async getLastSyncTime() {
    try {
      const settings = await storage.getItem('settings') || {};
      return settings.lastSync || null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }
}

export default SyncService;