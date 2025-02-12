import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { useEvents } from '../contexts/EventContext';
import { exportEvents } from '../services/ExportService';

const ExportScreen = () => {
  const { events } = useEvents();
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      await exportEvents(events, format);
      Alert.alert('Sucesso', `Compromissos exportados para ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Erro', `Falha ao exportar compromissos para ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Exportar para PDF"
        onPress={() => handleExport('pdf')}
        disabled={loading}
      />
      <Button
        title="Exportar para Excel"
        onPress={() => handleExport('excel')}
        disabled={loading}
      />
      <Button
        title="Exportar para Word"
        onPress={() => handleExport('word')}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ExportScreen;