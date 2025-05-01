import React, { useState, useEffect } from 'react';
import { RefreshControl, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import moment from 'moment';
import 'moment/locale/pt-br';
import * as Haptics from 'expo-haptics';

interface EnhancedRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: Date | null;
  lastRefreshed?: Date | null; // Alternativa para lastUpdated
  setLastUpdated?: (date: Date) => void;
  showLastUpdated?: boolean;
  colors?: string[];
  tintColor?: string;
}

/**
 * Componente de controle de atualização aprimorado que mostra a hora
 * da última atualização e fornece feedback háptico
 */
const EnhancedRefreshControl: React.FC<EnhancedRefreshControlProps> = ({
  refreshing,
  onRefresh,
  lastUpdated,
  lastRefreshed,
  setLastUpdated,
  showLastUpdated = true,
  colors,
  tintColor,
}) => {
  const { theme } = useTheme();
  const [internalLastUpdated, setInternalLastUpdated] = useState<Date | null>(lastUpdated || null);
  const [refreshStarted, setRefreshStarted] = useState(false);

  // Função para formatar a data da última atualização
  const formatLastUpdated = () => {
    const date = lastUpdated || lastRefreshed || internalLastUpdated;
    if (!date) return 'Nunca atualizado';
    
    const now = moment();
    const updatedTime = moment(date);
    
    // Se foi atualizado hoje, mostra apenas a hora
    if (now.isSame(updatedTime, 'day')) {
      return `Atualizado hoje às ${updatedTime.format('HH:mm')}`;
    }
    
    // Se foi atualizado ontem
    if (now.subtract(1, 'day').isSame(updatedTime, 'day')) {
      return `Atualizado ontem às ${updatedTime.format('HH:mm')}`;
    }
    
    // Se foi atualizado esta semana
    if (now.isSame(updatedTime, 'week')) {
      return `Atualizado ${updatedTime.format('dddd')} às ${updatedTime.format('HH:mm')}`;
    }
    
    // Caso contrário, mostra data completa
    return `Atualizado em ${updatedTime.format('DD/MM/YYYY [às] HH:mm')}`;
  };

  // Função de atualização aprimorada
  const handleRefresh = () => {
    // Feedback háptico para iniciar a atualização
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRefreshStarted(true);
    onRefresh();
  };

  // Atualizar a data quando a atualização estiver completa
  useEffect(() => {
    if (refreshStarted && !refreshing) {
      const now = new Date();
      
      // Atualiza o estado interno ou o estado fornecido via props
      if (setLastUpdated) {
        setLastUpdated(now);
      } else {
        setInternalLastUpdated(now);
      }
      
      setRefreshStarted(false);
      
      // Feedback háptico para indicar que a atualização foi concluída
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    }
  }, [refreshing, refreshStarted]);

  return (
    <View style={styles.container}>
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={colors || [theme.colors.primary]}
        tintColor={tintColor || theme.colors.primary}
      />
      
      {showLastUpdated && (internalLastUpdated || lastUpdated || lastRefreshed) && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={[styles.lastUpdatedText, { color: theme.colors.grey1 || '#999' }]}>
            {formatLastUpdated()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lastUpdatedContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EnhancedRefreshControl;
