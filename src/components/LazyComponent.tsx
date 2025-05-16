import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LazyComponentProps {
  children: React.ReactNode;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <View style={styles.fallbackContainer}>
          <ActivityIndicator size="large" color={componentColors.primaryLoader} />
        </View>
      }
    >
      {children}
    </Suspense>
  );
};

const componentColors = {
  primaryLoader: '#6200ee',
};

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default LazyComponent;
