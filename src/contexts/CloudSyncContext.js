import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CloudSyncContext = createContext(null);

export const CloudSyncProvider = ({ children }) => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const uploadToGoogleDrive = useCallback(async (data) => {
    if (!user?.accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/related; boundary=foo_bar_baz'
        },
        body: `--foo_bar_baz\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{
          "name": "jusagenda_backup.json",
          "mimeType": "application/json"
        }\r\n\r\n--foo_bar_baz\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--foo_bar_baz--`
      });

      if (!response.ok) throw new Error('Failed to upload to Google Drive');
      return await response.json();
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }, [user]);

  const downloadFromGoogleDrive = useCallback(async () => {
    if (!user?.accessToken) return;

    try {
      // First, search for the backup file
      const searchResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=name="jusagenda_backup.json"', {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        }
      );

      const { files } = await searchResponse.json();
      if (!files || files.length === 0) return null;

      // Download the latest backup
      const fileId = files[0].id;
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        }
      );

      return await downloadResponse.json();
    } catch (error) {
      console.error('Error downloading from Google Drive:', error);
      throw error;
    }
  }, [user]);

  const syncToCloud = useCallback(async () => {
    if (!user) return;

    setSyncing(true);
    setError(null);

    try {
      // Get all local data
      const events = await AsyncStorage.getItem('events');
      const settings = await AsyncStorage.getItem('settings');

      const backupData = {
        events: JSON.parse(events || '[]'),
        settings: JSON.parse(settings || '{}'),
        timestamp: new Date().toISOString()
      };

      await uploadToGoogleDrive(backupData);
      setLastSync(new Date());
      await AsyncStorage.setItem('lastSync', new Date().toISOString());
    } catch (error) {
      setError(error.message);
      console.error('Error syncing to cloud:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, uploadToGoogleDrive]);

  const syncFromCloud = useCallback(async () => {
    if (!user) return;

    setSyncing(true);
    setError(null);

    try {
      const backupData = await downloadFromGoogleDrive();
      if (!backupData) return;

      // Restore data locally
      await AsyncStorage.setItem('events', JSON.stringify(backupData.events));
      await AsyncStorage.setItem('settings', JSON.stringify(backupData.settings));
      setLastSync(new Date());
      await AsyncStorage.setItem('lastSync', new Date().toISOString());
    } catch (error) {
      setError(error.message);
      console.error('Error syncing from cloud:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, downloadFromGoogleDrive]);

  return (
    <CloudSyncContext.Provider
      value={{
        syncing,
        lastSync,
        error,
        syncToCloud,
        syncFromCloud
      }}
    >
      {children}
    </CloudSyncContext.Provider>
  );
};

export const useCloudSync = () => {
  const context = useContext(CloudSyncContext);
  if (!context) {
    throw new Error('useCloudSync must be used within a CloudSyncProvider');
  }
  return context;
};